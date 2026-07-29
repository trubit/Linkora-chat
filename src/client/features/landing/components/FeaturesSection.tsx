import { Box, Container, Typography, Grid, Stack } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CampaignIcon from '@mui/icons-material/Campaign';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import LayersIcon from '@mui/icons-material/Layers';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SyncAltIcon from '@mui/icons-material/SyncAlt';

const FEATURES = [
  {
    icon: LockIcon,
    title: 'End-to-End Encrypted',
    subtitle: 'Zero-Trust Encryption Standard',
    desc: 'All private chats, media files, and calls are secured with military-grade Signal protocol encryption. No one—not even Linkora—can read your communications.',
    color: '#7C3AED',
    bgGlow: 'rgba(124,58,237,0.12)',
    badgeText: 'Signal Protocol 256-Bit E2EE',
    codeSnippet: 'encrypt(msg, ratchetKey) ➔ [Ciphertext]',
  },
  {
    icon: CampaignIcon,
    title: 'Broadcast & Channels',
    subtitle: 'Mass Global Broadcasting',
    desc: 'Create public and private channels with unlimited subscribers, rich formatted media, instant subscriber metrics, and admin permissions.',
    color: '#38BDF8',
    bgGlow: 'rgba(56,189,248,0.12)',
    badgeText: 'Unlimited Subscribers Channel',
    codeSnippet: 'broadcast.emit(channelId, payload)',
  },
  {
    icon: RecordVoiceOverIcon,
    title: 'Voice & Video Hubs',
    subtitle: 'Ultra Low-Latency WebRTC Hubs',
    desc: 'Jump into crystal-clear low-latency voice channels and HD video rooms anytime with screen sharing, noise suppression, and role controls.',
    color: '#9B6DFF',
    bgGlow: 'rgba(155,109,255,0.12)',
    badgeText: '48kHz WebRTC Opus HD Audio',
    codeSnippet: 'webrtc.joinVoiceRoom(roomId, opusCodec)',
  },
  {
    icon: LayersIcon,
    title: 'Workspaces & Threads',
    subtitle: 'Structured Thread Engine',
    desc: 'Organize project discussions with threaded conversations, pinned announcements, document previews, global search, and custom notification rules.',
    color: '#F59E0B',
    bgGlow: 'rgba(245,158,11,0.12)',
    badgeText: 'Threaded Reply Engine',
    codeSnippet: 'thread.reply(parentMessageId, content)',
  },
  {
    icon: PhotoCameraIcon,
    title: 'Linkora Live Pulse',
    subtitle: 'Real-Time Enterprise Broadcasts',
    desc: 'Share ephemeral pulse updates, company broadcasts, and multimedia announcements with custom workspace visibility and 24-hour expiration settings.',
    color: '#EC4899',
    bgGlow: 'rgba(236,72,153,0.12)',
    badgeText: '24h Live Broadcast Stories',
    codeSnippet: 'pulse.broadcast({ media, visibility: "team" })',
  },
  {
    icon: SyncAltIcon,
    title: 'Instant Multi-Device Sync',
    subtitle: 'WebSocket State Machine',
    desc: 'Seamlessly transition between desktop, tablet, and mobile devices with sub-10ms real-time state synchronization and offline message queueing.',
    color: '#22C55E',
    bgGlow: 'rgba(34,197,94,0.12)',
    badgeText: 'WebSocket Sub-10ms Sync',
    codeSnippet: 'ws.syncState({ deviceId, ackSeq: 4096 })',
  },
];

export default function FeaturesSection() {
  return (
    <Box
      id="features"
      sx={{
        py: { xs: 10, md: 16 },
        position: 'relative',
        bgcolor: '#060914',
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Stack
          spacing={2}
          sx={{ mb: { xs: 6, md: 10 }, textAlign: 'center', alignItems: 'center' }}
        >
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#7C3AED',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            ENTERPRISE ARCHITECTURE
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '3rem' },
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            Everything you love in one unified suite.
          </Typography>
          <Typography
            sx={{
              fontSize: '1.1rem',
              color: '#94A3B8',
              maxWidth: 680,
              lineHeight: 1.6,
            }}
          >
            No more switching between separate apps for personal chats, community groups, voice
            channels, and workplace threads.
          </Typography>
        </Stack>

        {/* Feature Cards Grid */}
        <Grid container spacing={3.5}>
          {FEATURES.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
                <Box
                  className="glass-card"
                  sx={{
                    p: 3.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': {
                      borderColor: item.color,
                      boxShadow: `0 12px 40px ${item.bgGlow}`,
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Box>
                    {/* Top Icon & Subtitle Badge */}
                    <Stack
                      direction="row"
                      sx={{ mb: 2.5, justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '14px',
                          bgcolor: item.bgGlow,
                          border: `1px solid ${item.color}40`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconComp sx={{ fontSize: 24, color: item.color }} />
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          color: item.color,
                          bgcolor: item.bgGlow,
                          px: 1.25,
                          py: 0.5,
                          borderRadius: '8px',
                        }}
                      >
                        {item.subtitle}
                      </Typography>
                    </Stack>

                    <Typography
                      variant="h5"
                      sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#F1F5F9', mb: 1 }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      sx={{ fontSize: '0.9rem', color: '#94A3B8', lineHeight: 1.6, mb: 3 }}
                    >
                      {item.desc}
                    </Typography>
                  </Box>

                  {/* Feature Technical Preview Box */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '14px',
                      bgcolor: 'rgba(5, 8, 18, 0.9)',
                      border: `1px solid ${item.color}30`,
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                      <Typography sx={{ fontSize: '0.725rem', fontWeight: 700, color: item.color }}>
                        {item.badgeText}
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        color: '#CBD5E1',
                        bgcolor: 'rgba(255,255,255,0.03)',
                        p: 1,
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      {item.codeSnippet}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
