import { Box, Container, Typography, Grid, Stack, Chip, Divider, Link } from '@mui/material';
import { LinkoraLogo } from '@/components/LinkoraLogo';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/index';

export default function LandingFooter() {
  const navigate = useNavigate();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#05060E',
        pt: { xs: 8, md: 12 },
        pb: 6,
        borderTop: '1px solid rgba(139,92,246,0.12)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5} sx={{ mb: 8 }}>
          {/* Brand Column */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2.5}>
              <LinkoraLogo size={36} showWordmark wordmarkColor="#FFF" wordmarkSize="1.25rem" />
              <Typography sx={{ fontSize: '0.9rem', color: '#94A3B8', lineHeight: 1.7, maxWidth: 320 }}>
                The next-generation production real-time communication platform combining private messaging, broadcast channels, voice rooms, and workspace threads.
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#10B981',
                    boxShadow: '0 0 10px #10B981',
                  }}
                />
                <Typography sx={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 600 }}>
                  All Systems Operational · 99.99% Uptime
                </Typography>
              </Stack>
            </Stack>
          </Grid>

          {/* Product Links */}
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#F1F5F9', mb: 2, letterSpacing: 1 }}>
              PRODUCT
            </Typography>
            <Stack spacing={1.5}>
              <Link onClick={() => navigate(ROUTES.REGISTER)} sx={{ color: '#94A3B8', cursor: 'pointer', '&:hover': { color: '#10C4A0' } }}>
                Web App
              </Link>
              <Link href="#features" sx={{ color: '#94A3B8', '&:hover': { color: '#10C4A0' } }}>
                Features
              </Link>
              <Link href="#live-demo" sx={{ color: '#94A3B8', '&:hover': { color: '#10C4A0' } }}>
                Live Demo
              </Link>
              <Link href="#pricing" sx={{ color: '#94A3B8', '&:hover': { color: '#10C4A0' } }}>
                Pricing
              </Link>
            </Stack>
          </Grid>

          {/* Platform Security */}
          <Grid size={{ xs: 6, sm: 3, md: 3 }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#F1F5F9', mb: 2, letterSpacing: 1 }}>
              SECURITY & COMPLIANCE
            </Typography>
            <Stack spacing={1.5}>
              <Typography sx={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                Signal Protocol E2EE
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                Zero-Trust Encryption
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                SOC2 Type II Certified
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                GDPR & CCPA Compliant
              </Typography>
            </Stack>
          </Grid>

          {/* Account CTAs */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#F1F5F9', mb: 2, letterSpacing: 1 }}>
              GET STARTED NOW
            </Typography>
            <Stack spacing={1.5}>
              <Typography sx={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                Join thousands of teams and communities connecting on Linkora today.
              </Typography>
              <Chip
                label="Launch Linkora App"
                clickable
                onClick={() => navigate(ROUTES.LOGIN)}
                sx={{
                  bgcolor: '#10C4A0',
                  color: '#05060E',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  py: 2,
                  borderRadius: '10px',
                  '&:hover': { bgcolor: '#3DD4B8' },
                }}
              />
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 4 }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
            © {new Date().getFullYear()} Linkora Inc. All rights reserved. Encrypted & Secure.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Link sx={{ fontSize: '0.8rem', color: '#64748B', cursor: 'pointer', '&:hover': { color: '#94A3B8' } }}>
              Privacy Policy
            </Link>
            <Link sx={{ fontSize: '0.8rem', color: '#64748B', cursor: 'pointer', '&:hover': { color: '#94A3B8' } }}>
              Terms of Service
            </Link>
            <Link sx={{ fontSize: '0.8rem', color: '#64748B', cursor: 'pointer', '&:hover': { color: '#94A3B8' } }}>
              Security Whitepaper
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
