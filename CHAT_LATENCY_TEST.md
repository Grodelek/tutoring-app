# Chat latency test

Run from the repository root after starting the backend:

```bash
npm install
CHAT_LATENCY_BASE_URL=http://localhost:8090 \
CHAT_LATENCY_COUNT=100 \
npm run test:chat-latency
```

The script performs REST send -> database save -> authenticated STOMP delivery to `/user/queue/messages`, then writes `chat-latency-results.csv` and `chat-latency-summary.json`. The summary contains sent, received, uniqueReceived, lost, duplicates, ordered, min, max, mean, median and P95. It does not synthesize missing measurements.
