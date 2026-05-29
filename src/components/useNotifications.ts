import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from './ui/ToastProvider';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const useNotifications = () => {
  const { token } = useAuthStore();
  const { toast, success } = useToast();
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!token) return;

    // Initialize STOMP client using SockJS fallback provider
    const client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_WS_URL || 'http://localhost:8080'}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      console.log('STOMP Connected: ' + frame);

      // Subscribe to the authenticated user's private notification queue
      client.subscribe('/user/queue/notifications', (message) => {
        try {
          const data = JSON.parse(message.body);
          if (data.type === 'TRANSFER_RECEIVED') {
            success('Transfer Received', data.message);
          } else {
            toast('Notification', data.message || 'New banking update');
          }
        } catch (e) {
          console.warn('Failed to parse STOMP message body:', message.body);
          toast('Notification', message.body);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP Broker error: ' + frame.headers['message']);
      console.error('STOMP details: ' + frame.body);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        console.log('STOMP Disconnected');
      }
    };
  }, [token, toast, success]);
};
