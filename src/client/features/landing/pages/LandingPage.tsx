import { Box, Container, Stack, Button, useScrollTrigger } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LinkoraLogo } from '@/components/LinkoraLogo';
import { ROUTES } from '@/routes/index';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import AIShowcaseSection from '../components/AIShowcaseSection';
import PlatformComparison from '../components/PlatformComparison';
import TestimonialsSection from '../components/TestimonialsSection';
import DeveloperSection from '../components/DeveloperSection';
import PricingSection from '../components/PricingSection';
import LandingFooter from '../components/LandingFooter';

export default function LandingPage() {
  const navigate = useNavigate();
  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 20 });

  return (
    <Box sx={{ bgcolor: '#060914', color: '#F1F5F9', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Sticky Top Navigation Bar */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          py: 1.75,
          transition: 'all 0.3s ease',
          bgcolor: scrolled ? 'rgba(5, 6, 14, 0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(139,92,246,0.15)' : '1px solid transparent',
          boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Logo */}
            <Box onClick={() => navigate(ROUTES.LANDING)} sx={{ cursor: 'pointer' }}>
              <LinkoraLogo size={34} showWordmark wordmarkColor="#FFF" wordmarkSize="1.15rem" />
            </Box>

            {/* Desktop Navigation Links */}
            <Stack direction="row" spacing={3.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button
                href="#features"
                sx={{ color: '#94A3B8', fontWeight: 500, '&:hover': { color: '#10C4A0' } }}
              >
                Features
              </Button>
              <Button
                href="#ai-suite"
                sx={{ color: '#94A3B8', fontWeight: 500, '&:hover': { color: '#A78BFA' } }}
              >
                AI Assistant
              </Button>
              <Button
                href="#api"
                sx={{ color: '#94A3B8', fontWeight: 500, '&:hover': { color: '#38BDF8' } }}
              >
                Developers
              </Button>
              <Button
                href="#pricing"
                sx={{ color: '#94A3B8', fontWeight: 500, '&:hover': { color: '#10C4A0' } }}
              >
                Pricing
              </Button>
            </Stack>

            {/* CTA Buttons */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Button
                variant="text"
                onClick={() => navigate(ROUTES.LOGIN)}
                sx={{
                  color: '#F1F5F9',
                  fontWeight: 600,
                  px: 2,
                  '&:hover': { color: '#10C4A0', bgcolor: 'rgba(16,196,160,0.08)' },
                }}
              >
                Sign In
              </Button>

              <Button
                variant="contained"
                onClick={() => navigate(ROUTES.REGISTER)}
                sx={{
                  borderRadius: '12px',
                  px: 2.5,
                  py: 1,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  background: 'linear-gradient(135deg, #10C4A0 0%, #0D9E80 100%)',
                  boxShadow: '0 4px 20px rgba(16,196,160,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #3DD4B8 0%, #10C4A0 100%)',
                    boxShadow: '0 6px 28px rgba(16,196,160,0.45)',
                  },
                }}
              >
                Launch App
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Main Landing Sections */}
      <HeroSection />
      <FeaturesSection />
      <AIShowcaseSection />
      <PlatformComparison />
      <DeveloperSection />
      <TestimonialsSection />
      <PricingSection />
      <LandingFooter />
    </Box>
  );
}
