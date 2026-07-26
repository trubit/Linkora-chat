import { useState } from 'react';
import { IconButton, Badge, Tooltip } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { useNotificationStore } from '@/store/notificationStore';
import { useNotificationUnreadCount } from '../queries/index';
import { useNotificationSocket } from '../hooks/useNotificationSocket';
import { NotificationCenter } from './NotificationCenter';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  // Load count from server
  useNotificationUnreadCount();

  // Real-time updates
  useNotificationSocket();

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          onClick={() => setOpen(true)}
          size="medium"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <NotificationCenter open={open} onClose={() => setOpen(false)} />
    </>
  );
}
