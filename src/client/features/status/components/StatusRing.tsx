import { Box, Avatar, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import type { StatusGroupSummary } from '@shared/types/status.js';

interface StatusRingProps {
  group?: StatusGroupSummary;
  isOwn?: boolean;
  hasUnseen?: boolean;
  onClick: () => void;
  onAddClick?: () => void;
  size?: number;
  label?: string;
}

export function StatusRing({
  group,
  isOwn = false,
  hasUnseen = false,
  onClick,
  onAddClick,
  size = 56,
  label,
}: StatusRingProps) {
  const ringColor = hasUnseen ? '#25D366' : '#ccc';
  const ringWidth = hasUnseen ? 2.5 : 1.5;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        width: size + 16,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: size + 8,
          height: size + 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Ring */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `${ringWidth}px solid ${ringColor}`,
          }}
        />
        {/* Avatar */}
        <Avatar
          src={group?.author?.avatar}
          sx={{
            width: size - 4,
            height: size - 4,
            bgcolor: 'primary.main',
          }}
        >
          {group?.author?.displayName?.[0] ?? '?'}
        </Avatar>
        {/* Add badge for own story — clicking opens creator even when statuses exist */}
        {isOwn && (
          <Box
            onClick={(e) => {
              if (onAddClick) {
                e.stopPropagation();
                onAddClick();
              }
            }}
            sx={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              width: 18,
              height: 18,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid',
              borderColor: 'background.paper',
              cursor: onAddClick ? 'pointer' : 'default',
              zIndex: 1,
            }}
          >
            <AddIcon sx={{ fontSize: 12, color: 'white' }} />
          </Box>
        )}
      </Box>
      {label && (
        <Typography variant="caption" noWrap sx={{ mt: 0.5, maxWidth: size + 8, fontSize: 11 }}>
          {label}
        </Typography>
      )}
    </Box>
  );
}
