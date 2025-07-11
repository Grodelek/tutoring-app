import { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const useWebSocketMessages = (conversationId: string | string[], onMessage: (msg: any) => void) => {
  useEffect(() => {
    const client = new Client({
      brokerURL: undefined,
      webSocketFactory: () => new SockJS('http://192.168.1.32:8090/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Połączono z WebSocket');
        client.subscribe('/topic/notification', (message) => {
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

    return () => {
      client.deactivate();
    };
  }, [conversationId]);
};

