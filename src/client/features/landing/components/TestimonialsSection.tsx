import { Box, Container, Typography, Grid, Stack, Avatar, Rating } from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

const TESTIMONIALS = [
  {
    name: 'Elena Rostova',
    role: 'VP of Product',
    company: 'HyperScale Systems',
    initials: 'ER',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
    text: 'Linkora allowed us to replace multiple fragmented tools across our 450-person distributed team into one secure platform. Our team loves the sub-10ms sync speed!',
    rating: 5,
  },
  {
    name: 'Marcus Vance',
    role: 'Lead Architect',
    company: 'FinTech Secure Labs',
    initials: 'MV',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #9B6DFF 100%)',
    text: 'The Signal protocol E2EE implementation in Linkora is rock-solid. Having native zero-trust encryption combined with broadcast channels and voice rooms is a game changer.',
    rating: 5,
  },
  {
    name: 'Sophia Patel',
    role: 'Community Lead',
    company: 'DevUniverse Community',
    initials: 'SP',
    gradient: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
    text: 'We grew our developer community to 45,000 members on Linkora channels. The UI is sleek, modern, and lightyears ahead of legacy chat apps.',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <Box
      sx={{
        py: { xs: 10, md: 16 },
        bgcolor: '#080C18',
        position: 'relative',
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
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
            TRUSTED BY LEADERS & TEAMS
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '3rem' },
              fontWeight: 800,
              color: '#FFFFFF',
            }}
          >
            Loved by product teams & communities
          </Typography>
        </Stack>

        {/* Testimonials Grid */}
        <Grid container spacing={3.5}>
          {TESTIMONIALS.map((item, idx) => (
            <Grid key={idx} size={{ xs: 12, md: 4 }}>
              <Box
                className="glass-card"
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '20px',
                  background: 'rgba(6, 9, 20, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Box>
                  <Stack
                    direction="row"
                    sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Rating value={item.rating} readOnly precision={0.5} size="small" />
                    <FormatQuoteIcon sx={{ fontSize: 32, color: 'rgba(155, 109, 255, 0.3)' }} />
                  </Stack>

                  <Typography
                    sx={{ fontSize: '0.975rem', color: '#E2E8F0', lineHeight: 1.7, mb: 3 }}
                  >
                    &ldquo;{item.text}&rdquo;
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      background: item.gradient,
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                    }}
                  >
                    {item.initials}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: '0.925rem', fontWeight: 700, color: '#F1F5F9' }}>
                      {item.name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.775rem', color: '#94A3B8' }}>
                      {item.role} · {item.company}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
