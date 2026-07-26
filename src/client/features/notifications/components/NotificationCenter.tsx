import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Stack,
  Button,
  Divider,
  CircularProgress,
  Tab,
  Tabs,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Close as CloseIcon,
  DoneAll as DoneAllIcon,
  DeleteSweep as DeleteSweepIcon,
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  Call as CallIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationStore } from '@/store/notificationStore';
import {
  useNotifications,
  useMarkNotificationsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from '../queries/index';
import type { NotificationSummary, NotificationCategory } from '@shared/types/notification.js';

// ---------------------------------------------------------------------------
// Category icon map
// ---------------------------------------------------------------------------

const CATEGORY_ICONS: Record<NotificationCategory, React.ReactNode> = {
  messages: <MessageIcon fontSize="small" />,
  calls: <CallIcon fontSize="small" />,
  social: <NotificationsIcon fontSize="small" />,
  groups: <GroupIcon fontSize="small" />,
  communities: <GroupIcon fontSize="small" />,
  media: <InfoIcon fontSize="small" />,
  security: <SecurityIcon fontSize="small" />,
  system: <InfoIcon fontSize="small" />,
  announcements: <NotificationsIcon fontSize="small" />,
};

const CATEGORY_COLORS: Record<NotificationCategory, string> = {
  messages: '#25D366',
  calls: '#34B7F1',
  social: '#FF9800',
  groups: '#9C27B0',
  communities: '#673AB7',
  media: '#2196F3',
  security: '#F44336',
  system: '#607D8B',
  announcements: '#FF5722',
};

// ---------------------------------------------------------------------------
// Notification Item
// ---------------------------------------------------------------------------

interface NotificationItemProps {
  notification: NotificationSummary;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification, onRead, onDelete }: NotificationItemProps) {
  const color = CATEGORY_COLORS[notification.category] ?? '#607D8B';
  const icon = CATEGORY_ICONS[notification.category] ?? <InfoIcon fontSize="small" />;

  return (
    <ListItem
      sx={{
        alignItems: 'flex-start',
        bgcolor: notification.isRead ? 'transparent' : 'action.hover',
        transition: 'background-color 0.2s',
        borderLeft: notification.isRead ? 'none' : `3px solid ${color}`,
        '&:hover': { bgcolor: 'action.selected' },
        cursor: 'pointer',
        pr: 1,
      }}
      onClick={() => !notification.isRead && onRead(notification._id)}
      secondaryAction={
        <Tooltip title="Delete">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification._id);
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      }
    >
      <ListItemAvatar>
        <Avatar
          src={notification.actor?.avatar}
          sx={{ bgcolor: color, width: 40, height: 40 }}
        >
          {icon}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Typography
              variant="body2"
              noWrap
              sx={{ flex: 1, fontWeight: notification.isRead ? 400 : 600 }}
            >
              {notification.title}
            </Typography>
            {!notification.isRead && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: color,
                  flexShrink: 0,
                }}
              />
            )}
          </Stack>
        }
        secondary={
          <Box>
            <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
              {notification.body}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
}

// ---------------------------------------------------------------------------
// NotificationCenter
// ---------------------------------------------------------------------------

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

const TABS: Array<{ label: string; value: NotificationCategory | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Messages', value: 'messages' },
  { label: 'Social', value: 'social' },
  { label: 'Groups', value: 'groups' },
  { label: 'System', value: 'system' },
];

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const [tab, setTab] = useState<NotificationCategory | 'all'>('all');

  const {
    notifications,
    unreadCount,
    setNotifications,
  } = useNotificationStore();

  const { data: pages, isFetching, fetchNextPage, hasNextPage } = useNotifications(
    tab === 'all' ? undefined : { category: tab },
  );

  const { mutate: markRead } = useMarkNotificationsRead();
  const { mutate: deleteNotif } = useDeleteNotification();
  const { mutate: deleteAll } = useDeleteAllNotifications();

  // Sync store when query pages arrive
  useEffect(() => {
    if (!pages) return;
    const allNotifs = pages.pages.flatMap((p) => p.notifications);
    const lastPage = pages.pages[pages.pages.length - 1];
    if (lastPage) {
      setNotifications(allNotifs, lastPage.total, lastPage.page, lastPage.hasMore);
    }
  }, [pages, setNotifications]);

  const handleMarkAllRead = useCallback(() => {
    markRead({ all: true });
  }, [markRead]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteNotif(id);
    },
    [deleteNotif],
  );

  const handleRead = useCallback(
    (id: string) => {
      markRead({ notificationIds: [id] });
    },
    [markRead],
  );

  const filtered = notifications.filter((n) =>
    tab === 'all' ? true : n.category === tab,
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 380 } } } }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Badge badgeContent={unreadCount} color="error" max={99} />
          )}
        </Stack>
        <Stack direction="row">
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton size="small" onClick={handleMarkAllRead}>
                <DoneAllIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Delete all">
            <IconButton size="small" onClick={() => deleteAll()}>
              <DeleteSweepIcon />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_e, v) => setTab(v as typeof tab)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 40 }}
      >
        {TABS.map((t) => (
          <Tab key={t.value} label={t.label} value={t.value} sx={{ minHeight: 40, py: 0 }} />
        ))}
      </Tabs>

      {/* List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {isFetching && filtered.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {filtered.map((n, i) => (
              <React.Fragment key={n._id}>
                <NotificationItem
                  notification={n}
                  onRead={handleRead}
                  onDelete={handleDelete}
                />
                {i < notifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
            {hasNextPage && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button
                  size="small"
                  onClick={() => void fetchNextPage()}
                  disabled={isFetching}
                >
                  {isFetching ? 'Loading…' : 'Load more'}
                </Button>
              </Box>
            )}
          </List>
        )}
      </Box>
    </Drawer>
  );
}
