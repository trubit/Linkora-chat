import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import type {
  NotificationCreatedEvent,
  NotificationBulkReadEvent,
  NotificationDeletedEvent,
  NotificationUnreadCountEvent,
} from '@shared/types/notification.js';

const NOTIFICATIONS_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? '';

export function useNotificationSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { accessToken } = useAuthStore();
  const { addNotification, markRead, setUnreadCount, removeNotification } = useNotificationStore();

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    const socket = io(`${NOTIFICATIONS_URL}/notifications`, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2_000,
      autoConnect: false,
    });

    socketRef.current = socket;

    socket.on('notification:created', (event: NotificationCreatedEvent) => {
      useNotificationStore.getState().addNotification(event.notification);
    });

    socket.on('notification:bulk_read', (event: NotificationBulkReadEvent) => {
      useNotificationStore.getState().markRead(event.notificationIds);
    });

    socket.on('notification:deleted', (event: NotificationDeletedEvent) => {
      useNotificationStore.getState().removeNotification(event.notificationId);
    });

    socket.on('notification:unread_count', (event: NotificationUnreadCountEvent) => {
      useNotificationStore.getState().setUnreadCount(event.count);
    });

    socket.on('connect', () => {
      socket.emit('notification:get_unread_count');
    });

    socket.on('connect_error', () => {
      // Gracefully handles connection error when backend is offline
    });

    // Defer connect by one tick so StrictMode's cleanup can cancel before
    // the WebSocket handshake starts, avoiding the "closed before established" warning.
    const timer = setTimeout(() => {
      if (!cancelled) socket.connect();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken]);

  return socketRef;
}
