import { Box, Container, Typography, Grid, Stack, Button, Chip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/index';

const PLANS = [
  {
    name: 'Free Forever',
    price: '$0',
    period: '/month',
    desc: 'Perfect for individuals, friends, and small teams.',
    highlight: false,
    cta: 'Get Started Free',
    features: [
      'Unlimited Direct Messages & E2EE',
      'Up to 5 Public & Private Channels',
      'Voice & Video Rooms (Up to 10 users)',
      '1 GB File Attachment Storage',
      'Standard Multi-Device Web & Mobile Sync',
    ],
  },
  {
    name: 'Pro Team',
    price: '$12',
    period: '/user /month',
    desc: 'For growing teams, creator communities, and power users.',
    highlight: true,
    badge: 'MOST POPULAR',
    cta: 'Start 14-Day Free Trial',
    features: [
      'Everything in Free',
      'Unlimited Broadcast Channels & Members',
      'HD 4K Video Rooms & Screen Sharing',
      '50 GB High-Speed Cloud Storage',
      'Custom Emojis, Roles & Bot Integrations',
      'Priority 24/7 Support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'Dedicated infrastructure, SOC2 compliance, and SLA guarantees.',
    highlight: false,
    cta: 'Contact Sales',
    features: [
      'Everything in Pro Team',
      'Self-Hosted or Dedicated Cloud Node',
      'Custom E2EE Key Management System',
      'Audit Logs, SAML / SSO Integration',
      'Dedicated Customer Success Manager',
      '99.99% Uptime Service Level Agreement',
    ],
  },
];

export default function PricingSection() {
  const navigate = useNavigate();

  return (
    <Box
      id="pricing"
      sx={{
        py: { xs: 10, md: 16 },
        bgcolor: '#060914',
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Stack spacing={2} sx={{ mb: { xs: 6, md: 10 }, textAlign: 'center', alignItems: 'center' }}>
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#10C4A0',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            SIMPLE & TRANSPARENT PRICING
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '3rem' },
              fontWeight: 800,
              color: '#FFFFFF',
            }}
          >
            Start free, scale as you grow
          </Typography>
          <Typography sx={{ color: '#94A3B8', fontSize: '1.05rem', maxWidth: 600 }}>
            No credit card required for the free plan. Upgrade or cancel anytime.
          </Typography>
        </Stack>

        {/* Pricing Cards Grid */}
        <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
          {PLANS.map((plan, idx) => (
            <Grid key={idx} size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '24px',
                  bgcolor: plan.highlight ? 'rgba(15, 23, 42, 0.95)' : 'rgba(8, 12, 24, 0.7)',
                  border: plan.highlight
                    ? '2px solid #10C4A0'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: plan.highlight
                    ? '0 16px 60px rgba(16,196,160,0.2)'
                    : '0 8px 30px rgba(0,0,0,0.3)',
                  position: 'relative',
                }}
              >
                {plan.badge && (
                  <Chip
                    label={plan.badge}
                    sx={{
                      position: 'absolute',
                      top: -14,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: '#10C4A0',
                      color: '#05060E',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      px: 1.5,
                    }}
                  />
                )}

                <Box>
                  <Typography variant="h5" sx={{ fontSize: '1.35rem', fontWeight: 700, color: '#F1F5F9', mb: 1 }}>
                    {plan.name}
                  </Typography>

                  <Typography sx={{ fontSize: '0.875rem', color: '#94A3B8', mb: 3 }}>
                    {plan.desc}
                  </Typography>

                  <Stack direction="row" spacing={0.5} sx={{ mb: 3, alignItems: 'baseline' }}>
                    <Typography sx={{ fontSize: '3rem', fontWeight: 900, color: '#FFFFFF' }}>
                      {plan.price}
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: '#64748B' }}>
                      {plan.period}
                    </Typography>
                  </Stack>

                  <Button
                    variant={plan.highlight ? 'contained' : 'outlined'}
                    fullWidth
                    size="large"
                    onClick={() => navigate(ROUTES.REGISTER)}
                    sx={{
                      py: 1.5,
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.925rem',
                      ...(plan.highlight
                        ? {
                            bgcolor: '#10C4A0',
                            color: '#05060E',
                            boxShadow: '0 4px 20px rgba(16,196,160,0.4)',
                            '&:hover': { bgcolor: '#3DD4B8' },
                          }
                        : {
                            borderColor: 'rgba(255,255,255,0.18)',
                            color: '#F1F5F9',
                            '&:hover': { borderColor: '#10C4A0', bgcolor: 'rgba(16,196,160,0.1)' },
                          }),
                      mb: 4,
                    }}
                  >
                    {plan.cta}
                  </Button>

                  <Stack spacing={2}>
                    {plan.features.map((feat, fIdx) => (
                      <Stack key={fIdx} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <CheckIcon sx={{ fontSize: 18, color: '#10C4A0' }} />
                        <Typography sx={{ fontSize: '0.875rem', color: '#CBD5E1' }}>
                          {feat}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
