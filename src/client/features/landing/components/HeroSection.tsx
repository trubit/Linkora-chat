import { Box, Container, Typography, Button, Stack, Chip, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import BoltIcon from '@mui/icons-material/Bolt';
import GroupsIcon from '@mui/icons-material/Groups';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import LockIcon from '@mui/icons-material/Lock';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { LinkoraLogo } from '@/components/LinkoraLogo';
import { ROUTES } from '@/routes/index';

const TRUST_BADGES = [
  { icon: LockIcon, label: 'End-to-End Encrypted' },
  { icon: BoltIcon, label: '< 10ms Real-Time Sync' },
  { icon: GroupsIcon, label: 'Unlimited Communities' },
  { icon: SecurityIcon, label: 'SOC2 & GDPR Compliant' },
];

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: 'relative',
        pt: { xs: 12, md: 18 },
        pb: { xs: 10, md: 16 },
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #05060E 0%, #080C18 50%, #060914 100%)',
      }}
    >
      {/* Ambient background glows */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: 1200,
          height: 600,
          background: `
            radial-gradient(ellipse at 50% 20%, rgba(124,58,237,0.22) 0%, transparent 60%),
            radial-gradient(ellipse at 20% 40%, rgba(16,196,160,0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 45%, rgba(34,211,238,0.15) 0%, transparent 50%)
          `,
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Grid pattern overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          opacity: 0.7,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={4} sx={{ alignItems: 'center', textAlign: 'center' }}>
          {/* Release Pill Badge */}
          <Chip
            label="🚀 Linkora 2.0 Released — WhatsApp + Telegram + Discord + Slack Unified"
            clickable
            onClick={() => navigate(ROUTES.REGISTER)}
            sx={{
              px: 1,
              py: 2.2,
              borderRadius: '24px',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              fontWeight: 600,
              bgcolor: 'rgba(124, 58, 237, 0.12)',
              color: '#A78BFA',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 4px 20px rgba(124,58,237,0.15)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(124, 58, 237, 0.22)',
                borderColor: '#9B6DFF',
                transform: 'translateY(-1px)',
              },
            }}
          />

          {/* Main Headline */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.75rem', md: '4.75rem' },
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              maxWidth: 960,
              color: '#FFFFFF',
            }}
          >
            One messaging platform for{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #10C4A0 0%, #22D3EE 50%, #9B6DFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              chats, channels & teams.
            </Box>
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 400,
              color: '#94A3B8',
              maxWidth: 720,
              lineHeight: 1.6,
            }}
          >
            Experience lightning-fast end-to-end encrypted messaging, high-capacity channels, voice
            rooms, and team collaboration — built with modern real-time WebSockets.
          </Typography>

          {/* CTA Action Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ width: { xs: '100%', sm: 'auto' }, pt: 1 }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(ROUTES.REGISTER)}
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 4,
                py: 1.8,
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10C4A0 0%, #0D9E80 100%)',
                boxShadow: '0 8px 30px rgba(16,196,160,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3DD4B8 0%, #10C4A0 100%)',
                  boxShadow: '0 12px 40px rgba(16,196,160,0.5)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Get Started Free
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate(ROUTES.LOGIN)}
              startIcon={<PlayCircleOutlinedIcon />}
              sx={{
                px: 3.5,
                py: 1.8,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '14px',
                color: '#F1F5F9',
                borderColor: 'rgba(255,255,255,0.18)',
                bgcolor: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  borderColor: '#9B6DFF',
                  bgcolor: 'rgba(155,109,255,0.12)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Sign In to Linkora
            </Button>
          </Stack>

          {/* Trust Badges Bar */}
          <Stack
            direction="row"
            sx={{ pt: 2, pb: 1, flexWrap: 'wrap', justifyContent: 'center', gap: 2.5 }}
          >
            {TRUST_BADGES.map(({ icon: IconComponent, label }) => (
              <Stack key={label} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <IconComponent sx={{ fontSize: 18, color: '#10C4A0' }} />
                <Typography sx={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 500 }}>
                  {label}
                </Typography>
              </Stack>
            ))}
          </Stack>

          {/* Interactive UI Mockup Hero Preview */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 1060,
              mt: 4,
              borderRadius: '24px',
              border: '1px solid rgba(139,92,246,0.25)',
              background: 'rgba(8, 12, 24, 0.85)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 50px rgba(124,58,237,0.15)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Top Bar Window Controls */}
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                bgcolor: '#05060E',
                borderBottom: '1px solid rgba(139,92,246,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#EF4444' }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10B981' }} />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <LinkoraLogo
                  size={20}
                  showWordmark
                  wordmarkColor="#94A3B8"
                  wordmarkSize="0.85rem"
                />
                <Chip
                  label="LIVE APPNODE"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    bgcolor: 'rgba(16,196,160,0.15)',
                    color: '#10C4A0',
                  }}
                />
              </Stack>
              <Typography sx={{ fontSize: '0.75rem', color: '#475569' }}>v2.4.0-prod</Typography>
            </Box>

            {/* Application Interface Mock Body */}
            <Box
              sx={{
                display: 'flex',
                height: { xs: 380, sm: 460, md: 520 },
                textAlign: 'left',
              }}
            >
              {/* Sidebar Channels List */}
              <Box
                sx={{
                  width: { xs: 80, sm: 220, md: 280 },
                  bgcolor: '#080C18',
                  borderRight: '1px solid rgba(139,92,246,0.12)',
                  p: { xs: 1, sm: 2 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#475569',
                    letterSpacing: 1,
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  ACTIVE CONVERSATIONS
                </Typography>

                {/* Conversation Items Mock */}
                {[
                  {
                    name: 'Design Core Team',
                    msg: 'New UI component library updated!',
                    time: '12:44 PM',
                    badge: 3,
                    active: true,
                    initials: 'DC',
                    gradient: 'linear-gradient(135deg, #10C4A0 0%, #0D9E80 100%)',
                  },
                  {
                    name: 'Sarah Jenkins',
                    msg: 'The E2EE handshake protocol passed tests',
                    time: '11:20 AM',
                    badge: 0,
                    active: false,
                    initials: 'SJ',
                    gradient: 'linear-gradient(135deg, #7C3AED 0%, #9B6DFF 100%)',
                  },
                  {
                    name: 'DevOps & Infrastructure',
                    msg: 'Deployment to US-East successful',
                    time: '09:15 AM',
                    badge: 0,
                    active: false,
                    initials: 'DI',
                    gradient: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
                  },
                ].map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.25,
                      borderRadius: '12px',
                      bgcolor: item.active ? 'rgba(155,109,255,0.12)' : 'transparent',
                      border: item.active ? '1px solid rgba(155,109,255,0.25)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      cursor: 'pointer',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 38,
                        height: 38,
                        background: item.gradient,
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      {item.initials}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
                      <Stack
                        direction="row"
                        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <Typography
                          sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9' }}
                          noWrap
                        >
                          {item.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>
                          {item.time}
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontSize: '0.775rem', color: '#94A3B8' }} noWrap>
                        {item.msg}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Chat Stream Main Mock */}
              <Box
                sx={{
                  flex: 1,
                  bgcolor: '#060914',
                  p: { xs: 2, sm: 3 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {/* Chat Stream Header */}
                <Box
                  sx={{
                    pb: 1.5,
                    borderBottom: '1px solid rgba(139,92,246,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        background: 'linear-gradient(135deg, #10C4A0 0%, #0D9E80 100%)',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      DC
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontSize: '0.925rem', fontWeight: 700, color: '#F1F5F9' }}>
                        Design Core Team
                      </Typography>
                      <Typography sx={{ fontSize: '0.725rem', color: '#10C4A0' }}>
                        ● 14 Members Online · Signal HD Voice
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    icon={
                      <LockIcon sx={{ fontSize: '14px !important', color: '#10C4A0 !important' }} />
                    }
                    label="E2EE Encrypted"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(16,196,160,0.1)',
                      color: '#10C4A0',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>

                {/* Message Bubble Mock List */}
                <Stack spacing={2} sx={{ py: 2, flex: 1, justifyContent: 'flex-end' }}>
                  <Box sx={{ alignSelf: 'flex-start', maxWidth: '75%' }}>
                    <Box
                      sx={{
                        p: 1.75,
                        borderRadius: '16px 16px 16px 4px',
                        bgcolor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <Typography sx={{ fontSize: '0.85rem', color: '#F1F5F9', lineHeight: 1.5 }}>
                        Hey team! The new Linkora UI design system update has officially dropped
                        with glassmorphism cards and smooth theme transitions! 🎨
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.675rem', color: '#64748B', mt: 0.5, ml: 1 }}>
                      Alex Chen · 12:42 PM
                    </Typography>
                  </Box>

                  <Box sx={{ alignSelf: 'flex-end', maxWidth: '75%' }}>
                    <Box
                      sx={{
                        p: 1.75,
                        borderRadius: '16px 16px 4px 16px',
                        background: 'linear-gradient(135deg, #7C3AED 0%, #9B6DFF 100%)',
                        boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
                      }}
                    >
                      <Typography sx={{ fontSize: '0.85rem', color: '#FFFFFF', lineHeight: 1.5 }}>
                        Awesome! Test coverage is at 98% and socket connections feel instant across
                        desktop and mobile. 🚀
                      </Typography>
                    </Box>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ mt: 0.5, mr: 1, justifyContent: 'flex-end', alignItems: 'center' }}
                    >
                      <Typography sx={{ fontSize: '0.675rem', color: '#64748B' }}>
                        12:44 PM
                      </Typography>
                      <DoneAllIcon sx={{ fontSize: 14, color: '#10C4A0' }} />
                    </Stack>
                  </Box>
                </Stack>

                {/* Composer Bar Mock */}
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: '14px',
                    bgcolor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography sx={{ fontSize: '0.85rem', color: '#64748B', ml: 1 }}>
                    Type a message or share files...
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      borderRadius: '8px',
                      bgcolor: '#10C4A0',
                      color: '#05060E',
                      fontWeight: 700,
                      minWidth: 32,
                      px: 1.5,
                      '&:hover': { bgcolor: '#3DD4B8' },
                    }}
                  >
                    Send
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
