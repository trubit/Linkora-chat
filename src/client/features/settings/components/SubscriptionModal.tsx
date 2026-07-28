import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Grid,
  Paper,
  Chip,
  Stack,
  Switch,
  FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import BusinessIcon from '@mui/icons-material/Business';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  currentTier?: 'free' | 'pro' | 'business' | 'enterprise';
}

export function SubscriptionModal({ open, onClose, currentTier = 'free' }: SubscriptionModalProps) {
  const [annualBilling, setAnnualBilling] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'business' | 'enterprise'>('pro');

  const plans = [
    {
      id: 'pro',
      name: 'Pro Creator',
      icon: <RocketLaunchIcon sx={{ color: '#A78BFA' }} />,
      monthlyPrice: '$15',
      annualPrice: '$12',
      badge: 'POPULAR',
      description: 'Ideal for creators, power communicators, and freelancers.',
      features: [
        'Verified Gold Identity Badge',
        'Unlimited AI Copilot Usage',
        'Real-time Audio & Text Translation',
        '100 GB Encrypted Cloud Storage',
        'HD Screen Sharing & Recording',
        'Custom Wallpaper & Theme Studio',
      ],
    },
    {
      id: 'business',
      name: 'Business Team',
      icon: <BusinessIcon sx={{ color: '#38BDF8' }} />,
      monthlyPrice: '$35',
      annualPrice: '$29',
      badge: 'SCALE',
      description: 'Built for high-growth startups, agencies, and enterprises.',
      features: [
        'Everything in Pro Creator',
        'Custom Workspace Subdomain',
        'Admin Role & Access Governance',
        'CRM & Zapier Integrations',
        'Audit Logs & Compliance Export',
        '24/7 Priority SLA Support',
      ],
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#080C18',
            color: '#F1F5F9',
            borderRadius: '20px',
            border: '1px solid rgba(139,92,246,0.25)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
          },
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                bgcolor: 'rgba(124,58,237,0.2)',
                border: '1px solid rgba(124,58,237,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <VerifiedIcon sx={{ color: '#A78BFA', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: '#F1F5F9', fontWeight: 800 }}>
                Upgrade Linkora Workspace
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                Unlock AI power features, verified identity, and team collaboration.
              </Typography>
            </Box>
          </Stack>

          <IconButton onClick={onClose} sx={{ color: '#94A3B8', '&:hover': { color: '#FFF' } }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Billing Cycle Toggle */}
        <Box
          sx={{
            display: 'flex',
            justify: 'center',
            alignItems: 'center',
            mb: 4,
            p: 1,
            bgcolor: 'rgba(15,23,42,0.6)',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.06)',
            maxWidth: 360,
            mx: 'auto',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: annualBilling ? '#94A3B8' : '#FFF',
              mr: 1,
              fontWeight: annualBilling ? 500 : 700,
            }}
          >
            Monthly
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={annualBilling}
                onChange={(e) => setAnnualBilling(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#A78BFA' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#7C3AED' },
                }}
              />
            }
            label=""
          />
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                color: annualBilling ? '#FFF' : '#94A3B8',
                fontWeight: annualBilling ? 700 : 500,
              }}
            >
              Annual Billing
            </Typography>
            <Chip
              label="Save 20%"
              size="small"
              sx={{
                bgcolor: 'rgba(16,185,129,0.2)',
                color: '#34D399',
                fontSize: '0.6875rem',
                fontWeight: 700,
                height: 20,
              }}
            />
          </Stack>
        </Box>

        {/* Plans Grid */}
        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid key={plan.id} size={{ xs: 12, md: 6 }}>
              <Paper
                onClick={() => setSelectedPlan(plan.id as 'pro' | 'business')}
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  borderRadius: '16px',
                  bgcolor:
                    selectedPlan === plan.id ? 'rgba(124,58,237,0.12)' : 'rgba(15,23,42,0.5)',
                  border:
                    selectedPlan === plan.id
                      ? '2px solid #7C3AED'
                      : '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  '&:hover': {
                    borderColor: '#A78BFA',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {plan.badge && (
                  <Chip
                    label={plan.badge}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      bgcolor: '#7C3AED',
                      color: '#FFF',
                      fontWeight: 800,
                      fontSize: '0.6875rem',
                    }}
                  />
                )}

                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                  {plan.icon}
                  <Typography variant="h6" sx={{ color: '#F1F5F9', fontWeight: 800 }}>
                    {plan.name}
                  </Typography>
                </Stack>

                <Typography
                  variant="body2"
                  sx={{ color: '#94A3B8', minHeight: 40, mb: 2, fontSize: '0.8125rem' }}
                >
                  {plan.description}
                </Typography>

                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'baseline', mb: 2.5 }}>
                  <Typography variant="h3" sx={{ color: '#F1F5F9', fontWeight: 900 }}>
                    {annualBilling ? plan.annualPrice : plan.monthlyPrice}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    / user / month
                  </Typography>
                </Stack>

                <Stack spacing={1.2} sx={{ mb: 3 }}>
                  {plan.features.map((feature, i) => (
                    <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <CheckCircleIcon sx={{ color: '#34D399', fontSize: 16 }} />
                      <Typography variant="body2" sx={{ color: '#E2E8F0', fontSize: '0.8125rem' }}>
                        {feature}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                <Button
                  variant={selectedPlan === plan.id ? 'contained' : 'outlined'}
                  fullWidth
                  sx={{
                    py: 1.2,
                    borderRadius: '12px',
                    fontWeight: 700,
                    textTransform: 'none',
                    background:
                      selectedPlan === plan.id
                        ? 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)'
                        : 'transparent',
                    borderColor: selectedPlan === plan.id ? 'transparent' : 'rgba(139,92,246,0.3)',
                    color: '#FFF',
                    '&:hover': {
                      background:
                        selectedPlan === plan.id
                          ? 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)'
                          : 'rgba(124,58,237,0.1)',
                    },
                  }}
                >
                  {currentTier === plan.id ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Footer Guarantee */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            🔒 30-day money-back guarantee. Cancel or change plans anytime in workspace settings.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
