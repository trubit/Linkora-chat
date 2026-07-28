import { useState } from 'react';
import { Box, Stack, Skeleton, Typography } from '@mui/material';
import { useAuthStore } from '@/store/authStore';
import { useStatusStore } from '@/store/statusStore';
import { useStatusFeed, useMyStatuses } from '../queries/index';
import { StatusRing } from './StatusRing';
import { StatusViewer } from './StatusViewer';
import { StatusCreator } from './StatusCreator';
import type { StatusGroupSummary } from '@shared/types/status.js';

export function StatusFeed() {
  const user = useAuthStore((s) => s.user);
  const { feed, openViewer, myStatuses } = useStatusStore();
  const { isLoading: feedLoading } = useStatusFeed();
  const [creatorOpen, setCreatorOpen] = useState(false);
  useMyStatuses();

  const handleOpen = (group: StatusGroupSummary, index = 0) => {
    openViewer(group, index);
  };

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

  // Filter active (unexpired <24h) own statuses
  const validMyStatuses = myStatuses.filter(
    (s) => now - new Date(s.createdAt).getTime() < TWENTY_FOUR_HOURS_MS,
  );

  // Filter contact feed to exclude own status group and expired statuses (>24h)
  const contactFeed = feed
    .map((group) => ({
      ...group,
      statuses: group.statuses.filter(
        (s) => now - new Date(s.createdAt).getTime() < TWENTY_FOUR_HOURS_MS,
      ),
    }))
    .filter(
      (group) =>
        group.statuses.length > 0 &&
        group.userId !== user?._id &&
        group.author?.username !== user?.username,
    );

  if (feedLoading) {
    return (
      <Stack direction="row" spacing={2} sx={{ px: 2, py: 1.5, overflowX: 'auto' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Box
            key={i}
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 72 }}
          >
            <Skeleton variant="circular" width={56} height={56} />
            <Skeleton variant="text" width={56} height={14} sx={{ mt: 0.5 }} />
          </Box>
        ))}
      </Stack>
    );
  }

  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          px: 2,
          py: 1.5,
          overflowX: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {/* My status — Linkora story ring */}
        <StatusRing
          group={
            validMyStatuses.length > 0
              ? {
                  userId: user?._id ?? '',
                  author: {
                    userId: user?._id ?? '',
                    username: user?.username ?? 'Me',
                    displayName: user?.username ?? 'My Status',
                  },
                  statuses: validMyStatuses,
                  latestAt: validMyStatuses[0]?.createdAt ?? new Date().toISOString(),
                  hasUnseen: false,
                }
              : undefined
          }
          isOwn
          hasUnseen={false}
          label="My Status"
          onAddClick={() => setCreatorOpen(true)}
          onClick={() => {
            if (validMyStatuses.length > 0) {
              handleOpen({
                userId: user?._id ?? '',
                author: {
                  userId: user?._id ?? '',
                  username: user?.username ?? 'Me',
                  displayName: user?.username ?? 'My Status',
                },
                statuses: validMyStatuses,
                latestAt: validMyStatuses[0]!.createdAt,
                hasUnseen: false,
              });
            } else {
              setCreatorOpen(true);
            }
          }}
        />

        {/* Contact statuses */}
        {contactFeed.map((group) => (
          <StatusRing
            key={group.userId}
            group={group}
            hasUnseen={group.hasUnseen}
            label={group.author.displayName}
            onClick={() => handleOpen(group)}
          />
        ))}

        {contactFeed.length === 0 && myStatuses.length === 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ py: 1, px: 1 }}>
            No status updates
          </Typography>
        )}
      </Stack>

      {/* Status viewer */}
      <StatusViewer />
      {/* Status creator — opens when clicking "My Status" with no existing statuses */}
      <StatusCreator open={creatorOpen} onClose={() => setCreatorOpen(false)} />
    </>
  );
}
