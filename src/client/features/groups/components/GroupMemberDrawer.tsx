import {
  Drawer,
  Box,
  Typography,
  Avatar,
  CircularProgress,
  IconButton,
  Chip,
  alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useGroupMembers } from '../queries/index';

const C = {
  panel: '#080C18',
  border: 'rgba(255,255,255,0.08)',
  accent: '#7C3AED',
  txt1: '#F1F5F9',
  txt2: '#94A3B8',
} as const;

const ROLE_COLORS: Record<string, string> = {
  owner: '#F59E0B',
  admin: '#06B6D4',
  moderator: '#7C3AED',
  member: '#94A3B8',
  guest: '#64748B',
};

interface Props {
  open: boolean;
  onClose: () => void;
  groupId: string;
}

export default function GroupMemberDrawer({ open, onClose, groupId }: Props) {
  const { data, isLoading } = useGroupMembers(open ? groupId : null);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: { sx: { width: 300, bgcolor: C.panel, borderLeft: `1px solid ${C.border}` } },
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <Typography sx={{ color: C.txt1, fontWeight: 700, fontSize: 16 }}>Members</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: C.txt2 }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {isLoading && (
          <Box sx={{ textAlign: 'center', pt: 4 }}>
            <CircularProgress size={24} sx={{ color: C.accent }} />
          </Box>
        )}
        {data?.members.map((m) => (
          <Box
            key={m.userId}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1,
              '&:hover': { bgcolor: alpha(C.accent, 0.05) },
            }}
          >
            <Avatar
              src={m.avatarUrl}
              sx={{ width: 38, height: 38, fontSize: 15, bgcolor: C.accent }}
            >
              {m.displayName[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ color: C.txt1, fontSize: 14, fontWeight: 600 }} noWrap>
                {m.displayName}
              </Typography>
              {m.customTitle && (
                <Typography sx={{ color: C.txt2, fontSize: 12 }} noWrap>
                  {m.customTitle}
                </Typography>
              )}
            </Box>
            <Chip
              label={m.role}
              size="small"
              sx={{
                bgcolor: alpha(ROLE_COLORS[m.role] ?? '#8696A0', 0.15),
                color: ROLE_COLORS[m.role] ?? '#8696A0',
                fontSize: 11,
                fontWeight: 700,
                height: 20,
                border: `1px solid ${alpha(ROLE_COLORS[m.role] ?? '#8696A0', 0.3)}`,
              }}
            />
          </Box>
        ))}
      </Box>
    </Drawer>
  );
}
