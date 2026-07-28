import { Box, Container, Typography, Grid, Paper, Stack, Chip } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import TerminalIcon from '@mui/icons-material/Terminal';
import ApiIcon from '@mui/icons-material/Api';
import SecurityIcon from '@mui/icons-material/Security';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';

export default function DeveloperSection() {
  return (
    <Box
      id="api"
      sx={{
        py: 12,
        bgcolor: '#080C18',
        color: '#F1F5F9',
        borderTop: '1px solid rgba(139,92,246,0.12)',
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip
            icon={<CodeIcon style={{ fontSize: 16, color: '#38BDF8' }} />}
            label="DEVELOPER & ENTERPRISE PLATFORM"
            sx={{
              bgcolor: 'rgba(56,189,248,0.15)',
              color: '#38BDF8',
              fontWeight: 700,
              border: '1px solid rgba(56,189,248,0.3)',
              mb: 2,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2rem', md: '3rem' },
              background: 'linear-gradient(135deg, #FFFFFF 0%, #38BDF8 50%, #A78BFA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Programmable Communication APIs & Webhooks
          </Typography>
          <Typography variant="body1" sx={{ color: '#94A3B8', maxWidth: 700, mx: 'auto' }}>
            Integrate real-time messaging, bot automations, custom CRM sync, and end-to-end
            encrypted webhooks with our REST & WebSocket APIs.
          </Typography>
        </Box>

        {/* Developer Grid */}
        <Grid container spacing={4} sx={{ alignItems: 'center' }}>
          {/* Code Snippet Box */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: '16px',
                bgcolor: '#05060E',
                border: '1px solid rgba(56,189,248,0.25)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: 'center',
                  mb: 2,
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  pb: 1.5,
                }}
              >
                <TerminalIcon sx={{ color: '#38BDF8', fontSize: 20 }} />
                <Typography
                  variant="caption"
                  sx={{ color: '#94A3B8', fontFamily: 'monospace', fontWeight: 700 }}
                >
                  POST /api/v1/messages/send
                </Typography>
              </Stack>

              <Typography
                variant="body2"
                component="pre"
                sx={{
                  color: '#38BDF8',
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '0.8125rem',
                  overflowX: 'auto',
                  m: 0,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {`import { LinkoraClient } from '@linkora/sdk';

const linkora = new LinkoraClient({
  apiKey: process.env.LINKORA_API_KEY,
  workspaceId: 'ws_enterprise_001',
});

// Broadcast AI notification to engineering channel
await linkora.messages.send({
  channelId: 'ch_devops',
  content: '🚀 Deployment v2.4 successfully promoted to production.',
  aiSummary: true,
});`}
              </Typography>
            </Paper>
          </Grid>

          {/* Features Checklist */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    bgcolor: 'rgba(56,189,248,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ApiIcon sx={{ color: '#38BDF8' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: '#F1F5F9', mb: 0.5, fontWeight: 700 }}>
                    REST & WebSocket Streaming
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    Ultra low-latency event sockets for instant bot notifications, CRM leads sync,
                    and active presence tracking.
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    bgcolor: 'rgba(167,139,250,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SecurityIcon sx={{ color: '#A78BFA' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: '#F1F5F9', mb: 0.5, fontWeight: 700 }}>
                    Enterprise Security & Compliance
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    SOC2 compliant architecture with TLS 1.3 in-transit and AES-256 at-rest
                    encryption for sensitive data.
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    bgcolor: 'rgba(52,211,153,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IntegrationInstructionsIcon sx={{ color: '#34D399' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: '#F1F5F9', mb: 0.5, fontWeight: 700 }}>
                    Zapier & Webhook Ecosystem
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    Connect Linkora seamlessly with 5,000+ apps including GitHub, Jira, Salesforce,
                    HubSpot, and Slack.
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
