import { Box, Container, Typography, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const COMPARISON_ROWS = [
  {
    feature: 'End-to-End Encryption (Default)',
    linkora: true,
    whatsapp: true,
    telegram: false, // secret chats only
    discord: false,
    slack: false,
  },
  {
    feature: 'Unlimited Broadcast Channels',
    linkora: true,
    whatsapp: false,
    telegram: true,
    discord: false,
    slack: false,
  },
  {
    feature: 'HD Voice & Video Rooms (No Time Limit)',
    linkora: true,
    whatsapp: false,
    telegram: false,
    discord: true,
    slack: false,
  },
  {
    feature: 'Threaded Workspaces & File Search',
    linkora: true,
    whatsapp: false,
    telegram: false,
    discord: false,
    slack: true,
  },
  {
    feature: '24h Expiry Status / Story Feeds',
    linkora: true,
    whatsapp: true,
    telegram: true,
    discord: false,
    slack: false,
  },
  {
    feature: 'All-in-One Unified App Architecture',
    linkora: true,
    whatsapp: false,
    telegram: false,
    discord: false,
    slack: false,
  },
];

export default function PlatformComparison() {
  return (
    <Box
      sx={{
        py: { xs: 10, md: 14 },
        bgcolor: '#080C18',
        borderTop: '1px solid rgba(139,92,246,0.12)',
        borderBottom: '1px solid rgba(139,92,246,0.12)',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={2} sx={{ mb: { xs: 5, md: 8 }, textAlign: 'center', alignItems: 'center' }}>
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#9B6DFF',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            THE ALL-IN-ONE BENCHMARK
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '2.75rem' },
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            Why choose between fragmented apps?
          </Typography>
          <Typography
            sx={{
              fontSize: '1.05rem',
              color: '#94A3B8',
              maxWidth: 640,
            }}
          >
            Linkora consolidates private messaging, channels, voice servers, and workspace collaboration into a single, high-performance platform.
          </Typography>
        </Stack>

        {/* Comparison Table */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '20px',
            background: 'rgba(6, 9, 20, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139,92,246,0.2)',
            overflow: 'hidden',
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(15, 23, 42, 0.9)' }}>
              <TableRow>
                <TableCell sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: '0.95rem', py: 2.5, pl: 3 }}>
                  Capability / Feature
                </TableCell>
                <TableCell align="center" sx={{ py: 2.5 }}>
                  <Chip
                    label="Linkora"
                    sx={{
                      fontWeight: 800,
                      bgcolor: '#10C4A0',
                      color: '#05060E',
                      fontSize: '0.85rem',
                      px: 1,
                    }}
                  />
                </TableCell>
                <TableCell align="center" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.9rem' }}>
                  WhatsApp
                </TableCell>
                <TableCell align="center" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.9rem' }}>
                  Telegram
                </TableCell>
                <TableCell align="center" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.9rem' }}>
                  Discord
                </TableCell>
                <TableCell align="center" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.9rem' }}>
                  Slack
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {COMPARISON_ROWS.map((row, idx) => (
                <TableRow
                  key={idx}
                  sx={{
                    '&:nth-of-type(odd)': { bgcolor: 'rgba(255, 255, 255, 0.015)' },
                    '&:hover': { bgcolor: 'rgba(155, 109, 255, 0.05)' },
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <TableCell sx={{ color: '#E2E8F0', fontWeight: 600, fontSize: '0.9rem', py: 2.2, pl: 3 }}>
                    {row.feature}
                  </TableCell>

                  {/* Linkora column */}
                  <TableCell align="center" sx={{ bgcolor: 'rgba(16, 196, 160, 0.05)' }}>
                    <CheckCircleIcon sx={{ color: '#10C4A0', fontSize: 24 }} />
                  </TableCell>

                  {/* WhatsApp */}
                  <TableCell align="center">
                    {row.whatsapp ? (
                      <CheckCircleIcon sx={{ color: '#64748B', fontSize: 22 }} />
                    ) : (
                      <CancelIcon sx={{ color: '#334155', fontSize: 20 }} />
                    )}
                  </TableCell>

                  {/* Telegram */}
                  <TableCell align="center">
                    {row.telegram ? (
                      <CheckCircleIcon sx={{ color: '#64748B', fontSize: 22 }} />
                    ) : (
                      <CancelIcon sx={{ color: '#334155', fontSize: 20 }} />
                    )}
                  </TableCell>

                  {/* Discord */}
                  <TableCell align="center">
                    {row.discord ? (
                      <CheckCircleIcon sx={{ color: '#64748B', fontSize: 22 }} />
                    ) : (
                      <CancelIcon sx={{ color: '#334155', fontSize: 20 }} />
                    )}
                  </TableCell>

                  {/* Slack */}
                  <TableCell align="center">
                    {row.slack ? (
                      <CheckCircleIcon sx={{ color: '#64748B', fontSize: 22 }} />
                    ) : (
                      <CancelIcon sx={{ color: '#334155', fontSize: 20 }} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}
