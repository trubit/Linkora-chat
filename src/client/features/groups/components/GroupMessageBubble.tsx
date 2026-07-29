import { Box, Typography, Avatar, alpha } from '@mui/material';
import type { GroupMessage } from '@shared/types';

const C = {
  sentBg: 'linear-gradient(135deg, rgba(124,58,237,0.22) 0%, rgba(99,102,241,0.18) 100%)',
  sentBorder: 'rgba(124,58,237,0.35)',
  rcvdBg: 'rgba(15,23,42,0.85)',
  rcvdBorder: 'rgba(255,255,255,0.08)',
  txt1: '#F1F5F9',
  txt2: '#94A3B8',
  accent: '#A78BFA',
  cyan: '#06B6D4',
  system: 'rgba(124,58,237,0.12)',
} as const;

interface Props {
  message: GroupMessage;
  isMine: boolean;
}

export default function GroupMessageBubble({ message, isMine }: Props) {
  const deleted = message.status === 'deleted';

  if (message.type === 'system') {
    return (
      <Box sx={{ textAlign: 'center', my: 0.75 }}>
        <Typography
          sx={{
            display: 'inline-block',
            px: 2,
            py: 0.5,
            bgcolor: C.system,
            borderRadius: '12px',
            color: C.txt2,
            fontSize: 12,
            border: '1px solid rgba(124,58,237,0.2)',
          }}
        >
          {message.content}
        </Typography>
      </Box>
    );
  }

  const senderName = message.sender?.displayName ?? 'Unknown';
  const senderAvatar = message.sender?.avatarUrl;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMine ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 0.75,
        mb: 0.5,
      }}
    >
      {!isMine && (
        <Avatar
          src={senderAvatar}
          sx={{ width: 28, height: 28, fontSize: 12, mb: 0.25, bgcolor: C.accent }}
        >
          {senderName[0]?.toUpperCase()}
        </Avatar>
      )}
      <Box sx={{ maxWidth: '70%' }}>
        {!isMine && (
          <Typography sx={{ color: C.accent, fontSize: 12, fontWeight: 700, mb: 0.25, ml: 1 }}>
            {senderName}
          </Typography>
        )}
        <Box
          sx={{
            px: 1.5,
            py: 1,
            background: isMine ? C.sentBg : C.rcvdBg,
            border: `1px solid ${isMine ? C.sentBorder : C.rcvdBorder}`,
            borderRadius: isMine ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
            boxShadow: isMine ? `0 4px 14px rgba(124,58,237,0.18)` : `0 2px 8px rgba(0,0,0,0.3)`,
          }}
        >
          {deleted ? (
            <Typography sx={{ color: C.txt2, fontSize: 14, fontStyle: 'italic' }}>
              This message was deleted
            </Typography>
          ) : (
            <Typography
              sx={{
                color: C.txt1,
                fontSize: 14,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {message.content}
            </Typography>
          )}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0.5,
              mt: 0.25,
            }}
          >
            <Typography sx={{ color: C.txt2, fontSize: 11 }}>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
            {isMine && (
              <Typography
                sx={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  color: C.cyan,
                  letterSpacing: '0.04em',
                }}
              >
                READ
              </Typography>
            )}
          </Box>
        </Box>
        {/* Reactions */}
        {message.reactions.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.25 }}>
            {message.reactions.map((r) => (
              <Box
                key={r.emoji}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.25,
                  bgcolor: alpha(C.accent, 0.1),
                  borderRadius: '10px',
                  px: 0.75,
                  py: 0.25,
                  fontSize: 12,
                  border: `1px solid ${alpha(C.accent, 0.2)}`,
                }}
              >
                <span>{r.emoji}</span>
                <Typography sx={{ fontSize: 11, color: C.txt2 }}>{r.count}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
