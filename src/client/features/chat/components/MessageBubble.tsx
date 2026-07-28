import { useState, lazy, Suspense } from 'react';
import { Box, Typography, Avatar, IconButton, Tooltip, Paper } from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import BlockIcon from '@mui/icons-material/Block';
import type { Message } from '@shared/types';
import { VoiceNotePlayer } from '@/features/media/components/VoiceNotePlayer';
import { DocumentCard } from '@/features/media/components/DocumentCard';
import { ContactCard } from '@/features/media/components/ContactCard';
import { LocationCard } from '@/features/media/components/LocationCard';

const ImageViewer = lazy(() =>
  import('@/features/media/components/ImageViewer').then((m) => ({ default: m.ImageViewer })),
);

const LK = {
  sentBg: 'linear-gradient(135deg, rgba(124,58,237,0.22) 0%, rgba(99,102,241,0.18) 100%)',
  sentBorder: '1px solid rgba(139,92,246,0.3)',
  sentShadow: '0 4px 16px rgba(124,58,237,0.12)',
  rcvdBg: 'rgba(15,23,42,0.85)',
  rcvdBorder: '1px solid rgba(255,255,255,0.08)',
  rcvdShadow: '0 2px 10px rgba(0,0,0,0.3)',
  text: '#F1F5F9',
  timeTxt: '#94A3B8',
  statusCyan: '#06B6D4',
  accent: '#A78BFA',
  txt2: '#94A3B8',
  actionBg: '#0B1022',
  border: 'rgba(139,92,246,0.15)',
} as const;

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

function StatusIndicator({ status }: { status: Message['status'] }) {
  let label = 'sent';
  let color: string = LK.timeTxt;

  if (status === 'delivered') {
    label = 'delivered';
    color = '#94A3B8';
  } else if (status === 'read') {
    label = 'read';
    color = LK.statusCyan;
  }

  return (
    <Typography
      sx={{
        fontSize: '0.625rem',
        color,
        fontWeight: 600,
        letterSpacing: 0.2,
        textTransform: 'uppercase',
      }}
    >
      {label}
    </Typography>
  );
}

function formatMessageTime(ts: string): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ---------- MessageContent ----------

function MessageContent({ message, isMine: _isMine }: { message: Message; isMine: boolean }) {
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [viewerSrc, setViewerSrc] = useState('');

  if (message.deletedAt) {
    return (
      <Typography variant="body2" sx={{ color: LK.txt2, fontStyle: 'italic', fontSize: '0.82rem' }}>
        This message was deleted
      </Typography>
    );
  }

  const media = message.media?.[0];

  switch (message.type) {
    case 'image':
      return (
        <>
          <Box
            component="img"
            src={media?.url ?? media?.thumbnail ?? ''}
            alt="Image"
            onClick={() => {
              setViewerSrc(media?.url ?? '');
              setImageViewerOpen(true);
            }}
            sx={{
              maxWidth: 280,
              maxHeight: 280,
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'block',
              objectFit: 'cover',
              '&:hover': { opacity: 0.9 },
            }}
          />
          {message.content && (
            <Typography variant="body2" sx={{ mt: 0.75, color: LK.text, fontSize: '0.9rem' }}>
              {message.content}
            </Typography>
          )}
          <Suspense fallback={null}>
            <ImageViewer
              src={viewerSrc}
              open={imageViewerOpen}
              onClose={() => setImageViewerOpen(false)}
            />
          </Suspense>
        </>
      );

    case 'video':
      return (
        <Box sx={{ maxWidth: 280, borderRadius: '12px', overflow: 'hidden' }}>
          <video
            src={media?.url}
            controls
            poster={media?.thumbnail}
            style={{ width: '100%', maxHeight: 200, borderRadius: '12px', display: 'block' }}
          />
          {message.content && (
            <Typography variant="body2" sx={{ mt: 0.75, color: LK.text, fontSize: '0.9rem' }}>
              {message.content}
            </Typography>
          )}
        </Box>
      );

    case 'audio':
      return (
        <Box sx={{ maxWidth: 280 }}>
          <audio src={media?.url} controls style={{ width: '100%' }} />
          {message.content && (
            <Typography variant="body2" sx={{ mt: 0.75, color: LK.text, fontSize: '0.9rem' }}>
              {message.content}
            </Typography>
          )}
        </Box>
      );

    case 'voice_note':
      return (
        <VoiceNotePlayer
          url={media?.url ?? ''}
          duration={media?.duration}
          waveform={media?.waveform}
        />
      );

    case 'file':
      return (
        <DocumentCard
          url={media?.url ?? ''}
          name={media?.originalName ?? 'File'}
          size={media?.size}
          mimeType={media?.mimeType}
        />
      );

    case 'contact':
      return (
        <ContactCard
          displayName={message.content || 'Shared Contact'}
          phones={media?.url ? [{ number: media.url, type: 'mobile' }] : []}
        />
      );

    case 'location':
      return (
        <LocationCard latitude={0} longitude={0} name={message.content || 'Shared Location'} />
      );

    case 'sticker':
      return (
        <Box
          component="img"
          src={media?.url}
          alt="Sticker"
          sx={{ width: 140, height: 140, objectFit: 'contain' }}
        />
      );

    default:
      return (
        <Typography
          variant="body2"
          sx={{
            color: LK.text,
            fontSize: '0.9rem',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
          }}
        >
          {message.content}
        </Typography>
      );
  }
}

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  showAvatar?: boolean;
  replyMsg?: Message | null;
  onReply: (m: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onDelete: (messageId: string) => void;
}

export default function MessageBubble({
  message,
  isMine,
  showAvatar = true,
  replyMsg,
  onReply,
  onReact,
  onDelete,
}: MessageBubbleProps) {
  const [hovered, setHovered] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const isBubbleless = message.type === 'sticker';
  const isDeleted = Boolean(message.deletedAt);

  const bubbleBg = isMine ? LK.sentBg : LK.rcvdBg;
  const bubbleBorder = isMine ? LK.sentBorder : LK.rcvdBorder;
  const bubbleShadow = isMine ? LK.sentShadow : LK.rcvdShadow;

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setEmojiPickerOpen(false);
      }}
      sx={{
        display: 'flex',
        flexDirection: isMine ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 1,
        mb: showAvatar ? 1.5 : 0.5,
        px: 1,
      }}
    >
      {/* Avatar column */}
      {!isMine && (
        <Box sx={{ width: 32, flexShrink: 0 }}>
          {showAvatar && (
            <Avatar
              src={
                typeof message.sender?.avatar === 'string'
                  ? message.sender.avatar
                  : message.sender?.avatar?.url
              }
              sx={{
                width: 32,
                height: 32,
                fontSize: 13,
                bgcolor: '#7C3AED',
                border: '1px solid rgba(139,92,246,0.3)',
              }}
            >
              {message.sender?.username?.[0]?.toUpperCase()}
            </Avatar>
          )}
        </Box>
      )}

      {/* Bubble container */}
      <Box
        sx={{
          maxWidth: { xs: '85%', sm: '70%' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: isMine ? 'flex-end' : 'flex-start',
          position: 'relative',
        }}
      >
        {/* Sender name for group chats */}
        {!isMine && showAvatar && message.sender?.username && (
          <Typography
            sx={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: LK.accent,
              mb: 0.5,
              ml: 0.5,
            }}
          >
            {message.sender.username}
          </Typography>
        )}

        {/* Outer card wrapper */}
        <Box sx={{ position: 'relative' }}>
          {/* Action buttons (Reply / React / Delete) on hover */}
          {hovered && !isDeleted && (
            <Box
              sx={{
                position: 'absolute',
                top: -16,
                ...(isMine ? { left: -75 } : { right: -75 }),
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                bgcolor: LK.actionBg,
                border: `1px solid ${LK.border}`,
                borderRadius: '20px',
                px: 0.5,
                py: 0.25,
                zIndex: 10,
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              }}
            >
              <Tooltip title="React">
                <IconButton
                  size="small"
                  onClick={() => setEmojiPickerOpen((v) => !v)}
                  sx={{ color: '#94A3B8', p: 0.5, '&:hover': { color: '#FFF' } }}
                >
                  <AddReactionIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reply">
                <IconButton
                  size="small"
                  onClick={() => onReply(message)}
                  sx={{ color: '#94A3B8', p: 0.5, '&:hover': { color: '#FFF' } }}
                >
                  <ReplyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              {isMine && (
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() => onDelete(message._id)}
                    sx={{ color: '#F43F5E', p: 0.5, '&:hover': { color: '#FF6B6B' } }}
                  >
                    <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}

          {/* Quick emoji picker */}
          {emojiPickerOpen && (
            <Box
              sx={{
                position: 'absolute',
                bottom: '100%',
                mb: 0.5,
                ...(isMine ? { right: 0 } : { left: 0 }),
                display: 'flex',
                gap: 0.25,
                bgcolor: LK.actionBg,
                border: `1px solid ${LK.border}`,
                borderRadius: '14px',
                px: 0.75,
                py: 0.5,
                zIndex: 20,
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              }}
            >
              {QUICK_EMOJIS.map((emoji) => (
                <Box
                  key={emoji}
                  onClick={() => {
                    onReact(message._id, emoji);
                    setEmojiPickerOpen(false);
                  }}
                  sx={{
                    fontSize: 20,
                    cursor: 'pointer',
                    p: 0.375,
                    borderRadius: '6px',
                    transition: 'transform 0.1s',
                    '&:hover': { transform: 'scale(1.3)', bgcolor: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  {emoji}
                </Box>
              ))}
            </Box>
          )}

          {/* Stream Card */}
          {isDeleted ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 2,
                py: 1,
                borderRadius: '14px',
                bgcolor: 'rgba(15,23,42,0.6)',
                border: `1px solid ${LK.border}`,
              }}
            >
              <BlockIcon sx={{ fontSize: 14, color: LK.txt2 }} />
              <Typography sx={{ fontSize: '0.82rem', color: LK.txt2, fontStyle: 'italic' }}>
                This message was deleted
              </Typography>
            </Box>
          ) : isBubbleless ? (
            <MessageContent message={message} isMine={isMine} />
          ) : (
            <Paper
              elevation={0}
              sx={{
                background: bubbleBg,
                border: bubbleBorder,
                boxShadow: bubbleShadow,
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              {/* Reply preview */}
              {replyMsg && (
                <Box
                  sx={{
                    mx: 1.5,
                    mt: 1,
                    px: 1.25,
                    py: 0.75,
                    borderRadius: '8px',
                    bgcolor: 'rgba(0,0,0,0.3)',
                    borderLeft: `3px solid ${LK.accent}`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: LK.accent,
                      mb: 0.25,
                    }}
                  >
                    {replyMsg.sender?.username ?? 'Unknown'}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: LK.txt2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {replyMsg.content || 'Media'}
                  </Typography>
                </Box>
              )}

              {/* Message content */}
              <Box sx={{ px: 1.75, pt: replyMsg ? 0.75 : 1.25, pb: 0.5 }}>
                <MessageContent message={message} isMine={isMine} />
              </Box>

              {/* Card Footer Meta: time + status badge */}
              <Box
                sx={{
                  px: 1.5,
                  pb: 0.75,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: 0.75,
                }}
              >
                {message.editedAt && (
                  <Typography sx={{ fontSize: '0.625rem', color: LK.timeTxt }}>edited</Typography>
                )}
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    color: LK.timeTxt,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatMessageTime(message.createdAt)}
                </Typography>
                {isMine && <StatusIndicator status={message.status} />}
              </Box>
            </Paper>
          )}
        </Box>

        {/* Reaction badges */}
        {message.reactions.length > 0 && !isDeleted && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.375,
              mt: 0.5,
              justifyContent: isMine ? 'flex-end' : 'flex-start',
            }}
          >
            {message.reactions.map((r) => (
              <Box
                key={r.emoji}
                onClick={() => onReact(message._id, r.emoji)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.375,
                  px: 1,
                  py: 0.25,
                  bgcolor: LK.actionBg,
                  border: `1px solid ${LK.border}`,
                  borderRadius: '100px',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(124,58,237,0.15)' },
                }}
              >
                <Typography sx={{ fontSize: 13, lineHeight: 1.6 }}>{r.emoji}</Typography>
                {r.count > 1 && (
                  <Typography sx={{ fontSize: '0.6875rem', color: LK.txt2, fontWeight: 600 }}>
                    {r.count}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
