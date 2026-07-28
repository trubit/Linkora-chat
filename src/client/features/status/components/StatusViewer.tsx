import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Dialog,
  IconButton,
  Typography,
  Avatar,
  LinearProgress,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  Send as SendIcon,
  EmojiEmotions as EmojiIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useStatusStore } from '@/store/statusStore';
import { useViewStatus, useReactToStatus, useReplyToStatus } from '../queries/index';
import type { StatusSummary } from '@shared/types/status.js';

const REACTIONS = ['❤️', '😂', '😮', '😢', '😡', '👍'];
const STATUS_DURATION_MS = 5_000;

// ---------------------------------------------------------------------------
// Progress bar for a set of statuses
// ---------------------------------------------------------------------------

function StatusProgressBars({
  count,
  current,
  progress,
}: {
  count: number;
  current: number;
  progress: number;
}) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ px: 1, pt: 1 }}>
      {Array.from({ length: count }).map((_, i) => (
        <LinearProgress
          key={i}
          variant="determinate"
          value={i < current ? 100 : i === current ? progress : 0}
          sx={{
            flex: 1,
            height: 3,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.3)',
            '& .MuiLinearProgress-bar': { bgcolor: 'white' },
          }}
        />
      ))}
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// StatusViewer
// ---------------------------------------------------------------------------

export function StatusViewer() {
  const { viewingGroup, viewingIndex, isViewerOpen, closeViewer, setViewIndex, markViewed } =
    useStatusStore();

  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { mutate: viewStatus } = useViewStatus();
  const { mutate: reactToStatus } = useReactToStatus();
  const { mutate: replyToStatus, isPending: isReplying } = useReplyToStatus();

  const currentStatus: StatusSummary | undefined = viewingGroup?.statuses[viewingIndex];

  // Pause status auto-advance timer while user is actively typing a reply
  const isTypingReply = replyText.length > 0;
  const isTimerPaused = paused || isTypingReply;

  const goNext = useCallback(() => {
    if (!viewingGroup) return;
    if (viewingIndex < viewingGroup.statuses.length - 1) {
      setViewIndex(viewingIndex + 1);
    } else {
      closeViewer();
    }
  }, [viewingGroup, viewingIndex, setViewIndex, closeViewer]);

  const goPrev = useCallback(() => {
    if (viewingIndex > 0) {
      setViewIndex(viewingIndex - 1);
    }
  }, [viewingIndex, setViewIndex]);

  // Auto-advance
  useEffect(() => {
    if (!isViewerOpen || isTimerPaused || !currentStatus) return;

    setProgress(0);

    // Mark as viewed
    viewStatus(currentStatus._id, {
      onSuccess: () => markViewed(currentStatus._id),
    });

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / STATUS_DURATION_MS) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        goNext();
      }
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentStatus, isViewerOpen, isTimerPaused, goNext, markViewed, viewStatus]);

  const handleReaction = useCallback(
    (emoji: string) => {
      if (!currentStatus) return;
      reactToStatus({ statusId: currentStatus._id, reaction: emoji });
      setShowReactions(false);
    },
    [currentStatus, reactToStatus],
  );

  const handleSendReply = useCallback(() => {
    if (!replyText.trim() || !currentStatus) return;
    replyToStatus(
      { statusId: currentStatus._id, content: replyText.trim() },
      {
        onSuccess: () => {
          toast.success('Reply sent!');
          setReplyText('');
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Failed to send reply';
          toast.error(msg);
        },
      },
    );
  }, [currentStatus, replyText, replyToStatus]);

  if (!isViewerOpen || !viewingGroup || !currentStatus) return null;

  return (
    <Dialog
      open={isViewerOpen}
      onClose={closeViewer}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#000',
            color: 'white',
            borderRadius: 3,
            overflow: 'hidden',
            height: 600,
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* Top bar: progress bars + author info */}
      <Box sx={{ position: 'relative', zIndex: 10, pt: 'env(safe-area-inset-top, 0px)' }}>
        <StatusProgressBars
          count={viewingGroup.statuses.length}
          current={viewingIndex}
          progress={progress}
        />
        <Stack direction="row" spacing={1} sx={{ px: 2, pt: 1.5, pb: 1, alignItems: 'center' }}>
          <Avatar
            src={viewingGroup.author.avatar}
            alt={viewingGroup.author.displayName}
            sx={{ width: 36, height: 36, bgcolor: '#10C4A0' }}
          >
            {viewingGroup.author.displayName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
              {viewingGroup.author.displayName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {formatDistanceToNow(new Date(currentStatus.createdAt), { addSuffix: true })}
            </Typography>
          </Box>
          <IconButton size="small" onClick={closeViewer} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Main status content area */}
      <Box
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        sx={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: currentStatus.backgroundColor || '#1E293B',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Click zones for prev / next */}
        <Box
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '30%', zIndex: 2 }}
        />
        <Box
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          sx={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '30%', zIndex: 2 }}
        />

        {/* Media or Text content */}
        {currentStatus.type === 'image' || currentStatus.type === 'video' ? (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              component={currentStatus.type === 'video' ? 'video' : 'img'}
              src={currentStatus.media?.url}
              autoPlay={currentStatus.type === 'video'}
              loop={currentStatus.type === 'video'}
              playsInline
              controls={currentStatus.type === 'video'}
              sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            {currentStatus.content && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  right: 16,
                  bgcolor: 'rgba(0,0,0,0.65)',
                  backdropFilter: 'blur(8px)',
                  color: '#fff',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  textAlign: 'center',
                  zIndex: 3,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {currentStatus.content}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Typography
            variant="h5"
            align="center"
            sx={{
              px: 3,
              fontFamily: currentStatus.font || 'inherit',
              color: 'white',
              wordBreak: 'break-word',
            }}
          >
            {currentStatus.content}
          </Typography>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 1.5, pb: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <TextField
            placeholder="Reply to status…"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendReply();
              }
            }}
            variant="outlined"
            size="small"
            fullWidth
            disabled={isReplying}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                borderRadius: 4,
                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
              },
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      sx={{ color: 'white' }}
                      onClick={() => setShowReactions((p) => !p)}
                    >
                      <EmojiIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          {replyText ? (
            <IconButton
              disabled={isReplying}
              onClick={handleSendReply}
              sx={{ color: '#25D366', '&:hover': { bgcolor: 'rgba(37,211,102,0.15)' } }}
            >
              <SendIcon />
            </IconButton>
          ) : (
            <Stack direction="row" spacing={0.5}>
              <IconButton sx={{ color: 'white' }} size="small">
                <VisibilityIcon fontSize="small" />
              </IconButton>
              <IconButton sx={{ color: '#F44336' }} size="small">
                <FavoriteIcon fontSize="small" />
              </IconButton>
            </Stack>
          )}
        </Stack>

        {/* Inline reactions */}
        {showReactions && (
          <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: 'center' }}>
            {REACTIONS.map((r) => (
              <IconButton key={r} onClick={() => handleReaction(r)} sx={{ fontSize: 24, p: 0.5 }}>
                {r}
              </IconButton>
            ))}
          </Stack>
        )}
      </Box>
    </Dialog>
  );
}
