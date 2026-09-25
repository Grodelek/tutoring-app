import { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WS_URL } from '@/config/baseUrl';

export const useWebSocketMessages = (conversationId: string | string[], onMessage: (msg: any) => void) => {
  useEffect(() => {
    let client: Client;
    const start = async () => {
    const token = await AsyncStorage.getItem('jwtToken');
    if (!token) return;
    client = new Client({
      brokerURL: undefined,
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Połączono z WebSocket');
        client.subscribe('/user/queue/messages', (message) => {
          const payload = JSON.parse(message.body);
          if (payload.conversationId === conversationId) {
            onMessage(payload);
          }
        });
      },
      onStompError: (frame) => {
        console.error('WebSocket error', frame);
      },
    });
    client.activate();
    };
    start();
    return () => {
      client?.deactivate();
    };
  }, [conversationId]);
};
