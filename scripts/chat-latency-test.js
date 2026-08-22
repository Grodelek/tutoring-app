#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { Client } = require('@stomp/stompjs');
const WebSocketClient = require('faye-websocket').Client;

// Spring SockJS websocket transport: /{server}/{session}/websocket.
// The adapter keeps the real SockJS framing and sends JWT on the HTTP upgrade.
class SockJSWebSocket {
  constructor(url, token) {
    const server = Math.floor(Math.random() * 1000);
    const session = Math.random().toString(36).slice(2, 10);
    const wsUrl = `${url.replace(/^http/, 'ws')}/${server}/${session}/websocket`;
    this.readyState = 0;
    this.socket = new WebSocketClient(wsUrl, [], { headers: { Authorization: `Bearer ${token}` } });
    this.socket.on('message', (event) => {
      const data = String(event.data);
      if (data === 'o') {
        this.readyState = 1;
        if (this.onopen) this.onopen();
      } else if (data.startsWith('a')) {
        for (const frame of JSON.parse(data.slice(1))) {
          if (this.onmessage) this.onmessage({ data: frame });
        }
      } else if (data.startsWith('c')) {
        this.close();
      }
    });
    this.socket.on('error', (error) => { if (this.onerror) this.onerror(error); });
    this.socket.on('close', (event) => {
      this.readyState = 3;
      if (this.onclose) this.onclose(event);
    });
  }

  send(data) { this.socket.send(JSON.stringify([String(data)])); }
  close() { if (this.readyState < 2) { this.readyState = 2; this.socket.close(); } }
}

const BASE_URL = (process.env.CHAT_LATENCY_BASE_URL || 'http://localhost:8091').replace(/\/$/, '');
const COUNT = Number.parseInt(process.env.CHAT_LATENCY_COUNT || '100', 10);
const MESSAGE_INTERVAL_MS = Number.parseInt(process.env.CHAT_LATENCY_INTERVAL_MS || '75', 10);
const GLOBAL_TIMEOUT_MS = 120_000;
const FIRST_RECEIVE_TIMEOUT_MS = 5_000;
const OUTPUT_DIR = path.resolve(__dirname, '..');
const CSV_PATH = path.join(OUTPUT_DIR, 'chat-latency-results.csv');
const SUMMARY_PATH = path.join(OUTPUT_DIR, 'chat-latency-summary.json');
const TEST_DATABASE = process.env.LATENCY_DB_NAME || 'tutoring_latency_test';

if (!Number.isInteger(COUNT) || COUNT < 1 || !Number.isInteger(MESSAGE_INTERVAL_MS) || MESSAGE_INTERVAL_MS < 0) {
  throw new Error('CHAT_LATENCY_COUNT musi być >= 1, a CHAT_LATENCY_INTERVAL_MS musi być >= 0.');
}

const credentials = {
  sender: {
    email: process.env.CHAT_LATENCY_SENDER_EMAIL || 'latency.sender@local.test',
    password: process.env.CHAT_LATENCY_SENDER_PASSWORD || 'LatencyTest123',
    username: process.env.CHAT_LATENCY_SENDER_USERNAME || 'latencySender',
  },
  receiver: {
    email: process.env.CHAT_LATENCY_RECEIVER_EMAIL || 'latency.receiver@local.test',
    password: process.env.CHAT_LATENCY_RECEIVER_PASSWORD || 'LatencyTest123',
    username: process.env.CHAT_LATENCY_RECEIVER_USERNAME || 'latencyReceiver',
  },
};

function removeOldReports() {
  for (const file of [CSV_PATH, SUMMARY_PATH]) {
    try { fs.unlinkSync(file); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}

async function responseMeta(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: response.status, body, text };
}

async function login(user, clientIp) {
  return responseMeta(`${BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'X-Real-IP': clientIp },
    body: JSON.stringify({ email: user.email, password: user.password }),
  });
}

async function ensureUser(user, clientIp) {
  let result = await login(user, clientIp);
  if (result.status === 404 || result.status === 401) {
    const registration = await responseMeta(`${BASE_URL}/api/users/add`, {
      method: 'POST',
      headers: { 'X-Real-IP': clientIp },
      body: JSON.stringify({
        username: user.username,
        email: user.email,
        password: user.password,
        userType: 'STUDENT',
      }),
    });
    if (registration.status !== 201 && registration.status !== 200) {
      throw new Error(`User setup failed for ${user.email} (${registration.status}): ${registration.text}`);
    }
    result = await login(user, clientIp);
  }
  if (result.status !== 200 || !result.body?.token || !result.body?.userId) {
    throw new Error(`Login failed for ${user.email} (${result.status}): ${result.text}`);
  }
  return result.body;
}

async function createConversation(token, senderId, receiverId) {
  const result = await responseMeta(`${BASE_URL}/api/messages/get-or-create`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ user1Id: senderId, user2Id: receiverId }),
  });
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Conversation setup failed (${result.status}): ${result.text}`);
  }
  return result.body;
}

async function sendMessage(token, payload, clientIp, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await responseMeta(`${BASE_URL}/api/messages/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'X-Real-IP': clientIp },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function stompClient(token) {
  return new Client({
    webSocketFactory: () => new SockJSWebSocket(`${BASE_URL}/ws`, token),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 0,
    connectionTimeout: 5_000,
    debug: () => {},
  });
}

function connect(client) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('STOMP connection timeout')), 5_000);
    client.onConnect = () => { clearTimeout(timer); resolve(); };
    client.onWebSocketError = (error) => {
      clearTimeout(timer);
      reject(new Error(`STOMP WebSocket connection failed: ${error.message || error}`));
    };
    client.activate();
  });
}

async function subscribeAndWait(client, destination, callback) {
  const subscription = client.subscribe(destination, callback);
  // Spring's simple broker does not emit SUBSCRIBE receipts. The frame is
  // queued after CONNECTED; this short interval ensures it is sent first.
  await new Promise((resolve) => setTimeout(resolve, 250));
  return subscription;
}

function percentile(sorted, fraction) {
  if (!sorted.length) return null;
  const index = (sorted.length - 1) * fraction;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeReport(state, status, errorMessage) {
  if (state.sent.size === 0) return false;
  const orderedIds = [...state.sent.keys()];
  const rows = orderedIds.map((id) => {
    const sentItem = state.sent.get(id);
    return state.results.get(id) || {
      id,
      sentAt: sentItem.sentAt,
      receivedAt: '',
      latencyMs: '',
      httpLatencyMs: sentItem.httpLatencyMs ?? '',
      httpStatus: sentItem.httpStatus ?? '',
    };
  });
  const latencies = rows.filter((row) => row.latencyMs !== '').map((row) => row.latencyMs).sort((a, b) => a - b);
  const summary = {
    status,
    sent: state.sent.size,
    received: state.receivedOrder.length,
    uniqueReceived: state.results.size,
    lost: state.sent.size - state.results.size,
    duplicates: state.receivedOrder.length - state.results.size,
    ordered: state.receivedOrder.length === state.sent.size && state.receivedOrder.every((id, index) => id === orderedIds[index]),
    minMs: latencies.length ? latencies[0] : null,
    maxMs: latencies.length ? latencies[latencies.length - 1] : null,
    meanMs: latencies.length ? Number((latencies.reduce((sum, value) => sum + value, 0) / latencies.length).toFixed(3)) : null,
    medianMs: percentile(latencies, 0.5),
    p95Ms: percentile(latencies, 0.95),
    durationMs: Number((performance.now() - state.started).toFixed(3)),
    testDatabase: TEST_DATABASE,
    backendUrl: BASE_URL,
    messageIntervalMs: MESSAGE_INTERVAL_MS,
    ...(errorMessage ? { error: errorMessage } : {}),
  };
  fs.writeFileSync(CSV_PATH, [
    'id,sentAt,receivedAt,latencyMs,httpLatencyMs,httpStatus',
    ...rows.map((row) => [row.id, row.sentAt, row.receivedAt, row.latencyMs, row.httpLatencyMs, row.httpStatus]
      .map(csvEscape).join(',')),
  ].join('\n') + '\n');
  fs.writeFileSync(SUMMARY_PATH, `${JSON.stringify(summary, null, 2)}\n`);
  return true;
}

async function main() {
  removeOldReports();
  const state = {
    started: performance.now(),
    sent: new Map(),
    receivedOrder: [],
    results: new Map(),
  };
  let receiverClient;
  let subscription;
  let firstReceiveTimer;
  let firstReceiveResolve;
  let firstReceiveReject;
  let firstPost;
  const firstReceive = new Promise((resolve, reject) => {
    firstReceiveResolve = resolve;
    firstReceiveReject = reject;
  });
  const globalDeadline = state.started + GLOBAL_TIMEOUT_MS;
  let failure;

  try {
    const reachable = await fetch(`${BASE_URL}/ws/info`);
    if (reachable.status >= 500) throw new Error(`Backend health check failed (${reachable.status})`);

    const ipBase = 20 + Math.floor(Math.random() * 200);
    const [senderLogin, receiverLogin] = await Promise.all([
      ensureUser(credentials.sender, `127.0.0.${ipBase}`),
      ensureUser(credentials.receiver, `127.0.0.${ipBase + 1}`),
    ]);
    state.senderId = String(senderLogin.userId);
    state.receiverId = String(receiverLogin.userId);
    await createConversation(senderLogin.token, state.senderId, state.receiverId);

    receiverClient = stompClient(receiverLogin.token);
    await connect(receiverClient);
    subscription = await subscribeAndWait(receiverClient, '/topic/notification', (message) => {
      let payload;
      try { payload = JSON.parse(message.body); } catch { return; }
      if (String(payload.senderId) !== state.senderId || String(payload.receiverId) !== state.receiverId) return;
      const item = state.sent.get(payload.content);
      if (!item) return;
      if (state.receivedOrder.length < 3) console.log(payload);
      state.receivedOrder.push(payload.content);
      if (!state.results.has(payload.content)) {
        state.results.set(payload.content, {
          id: payload.content,
          sentAt: item.sentAt,
          receivedAt: new Date().toISOString(),
          latencyMs: Number((performance.now() - item.clock).toFixed(3)),
          httpLatencyMs: item.httpLatencyMs ?? '',
          httpStatus: item.httpStatus ?? '',
        });
        if (state.results.size === 1) {
          clearTimeout(firstReceiveTimer);
          firstReceiveResolve();
        }
      }
    });

    for (let number = 1; number <= COUNT; number += 1) {
      const remaining = Math.floor(globalDeadline - performance.now());
      if (remaining <= 0) throw new Error('Global test timeout (120 seconds) while sending messages.');
      const id = `latency-${String(number).padStart(3, '0')}-${Math.random().toString(36).slice(2, 10)}`;
      const item = { clock: performance.now(), sentAt: new Date().toISOString() };
      state.sent.set(id, item);
      const postStarted = performance.now();
      const response = await sendMessage(senderLogin.token, {
        senderId: state.senderId,
        receiverId: state.receiverId,
        content: id,
        messageType: 'TEXT',
        lessonId: null,
      }, `127.0.0.${ipBase + 2}`, remaining);
      item.httpLatencyMs = Number((performance.now() - postStarted).toFixed(3));
      item.httpStatus = response.status;
      const receivedResult = state.results.get(id);
      if (receivedResult) {
        receivedResult.httpLatencyMs = item.httpLatencyMs;
        receivedResult.httpStatus = item.httpStatus;
      }
      if (response.status < 200 || response.status >= 300) {
        state.sent.delete(id);
        throw new Error(`POST failed at message ${number}: HTTP ${response.status}; body=${response.text}`);
      }
      if (!firstPost) {
        firstPost = response;
        firstReceiveTimer = setTimeout(() => {
          firstReceiveReject(`No receiver message within 5 seconds after first POST; first POST HTTP ${response.status}; body=${response.text}; STOMP state=${receiverClient.state}`);
        }, FIRST_RECEIVE_TIMEOUT_MS);
      }
      await new Promise((resolve) => setTimeout(resolve, MESSAGE_INTERVAL_MS));
    }

    await Promise.race([
      firstReceive,
      new Promise((_, reject) => setTimeout(() => reject(new Error('No first receiver message within the allowed time.')), FIRST_RECEIVE_TIMEOUT_MS)),
    ]);
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    if (state.sent.size !== COUNT) throw new Error(`Only ${state.sent.size}/${COUNT} messages were sent.`);
  } catch (error) {
    failure = error instanceof Error ? error.message : String(error);
  } finally {
    clearTimeout(firstReceiveTimer);
    if (subscription) subscription.unsubscribe();
    if (receiverClient) await receiverClient.deactivate().catch(() => {});
  }

  if (failure) {
    const generated = writeReport(state, 'incomplete', failure);
    console.error(`Chat latency test FAILED: ${failure}`);
    if (firstPost) console.error(`First POST: HTTP ${firstPost.status}; body=${firstPost.text}`);
    console.error(`STOMP state: ${receiverClient?.state || 'not connected'}`);
    if (generated) console.error(`Partial report written to ${CSV_PATH} and ${SUMMARY_PATH}`);
    process.exitCode = 1;
    return;
  }

  writeReport(state, 'completed', null);
  const latencies = [...state.results.values()].map((row) => row.latencyMs).sort((a, b) => a - b);
  const mean = latencies.reduce((sum, value) => sum + value, 0) / latencies.length;
  console.log(`Chat latency test complete: ${state.sent.size} messages.`);
  console.log(`Received: ${state.results.size}/${state.sent.size}; min=${latencies[0]} ms; mean=${mean.toFixed(3)} ms; median=${percentile(latencies, 0.5).toFixed(3)} ms; p95=${percentile(latencies, 0.95).toFixed(3)} ms; max=${latencies.at(-1)} ms`);
  console.log(`CSV: ${CSV_PATH}`);
  console.log(`Summary: ${SUMMARY_PATH}`);
}

main().catch((error) => { console.error(`Chat latency test FAILED: ${error.message}`); process.exitCode = 1; });
