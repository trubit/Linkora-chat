import { useState } from 'react';
import { Box, Container, Typography, Grid, Paper, Stack, Chip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TranslateIcon from '@mui/icons-material/Translate';
import SummarizeIcon from '@mui/icons-material/Summarize';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

export default function AIShowcaseSection() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: 'Smart Meeting Minutes & Summaries',
      icon: <SummarizeIcon sx={{ color: '#A78BFA' }} />,
      desc: 'Instantly condense multi-hour workspace chats or recorded calls into actionable bullet points, decisions, and assigned tasks.',
      sampleInput:
        'Meeting Transcript (45 min):\nJohn: We need to release v2.4 by Friday.\nSarah: I finished the API integration tests.\nAlex: I will complete the UI review tomorrow.',
      sampleOutput:
        '📌 Summary & Action Items:\n• Target Release Date: Friday (v2.4)\n• Sarah: API Integration Tests complete ✅\n• Alex: Complete UI review by tomorrow ⏳',
    },
    {
      title: 'Instant 50+ Language Translation',
      icon: <TranslateIcon sx={{ color: '#38BDF8' }} />,
      desc: 'Break down global team barriers. Incoming messages are translated seamlessly in real-time without context switching.',
      sampleInput:
        'Spanish Client: "Hola equipo, ¿cuándo estará lista la actualización del panel de control?"',
      sampleOutput:
        'Translated (English): "Hello team, when will the control panel update be ready?"',
    },
    {
      title: 'Executive Tone & Style Polishing',
      icon: <FormatQuoteIcon sx={{ color: '#34D399' }} />,
      desc: 'Refine your drafts to match executive, casual, persuasive, or diplomatic tones before hitting send.',
      sampleInput: 'Draft: "hey can u send that report asap need it for client meeting"',
      sampleOutput:
        'Executive Tone: "Hello team, could you please share the latest report at your earliest convenience? Thank you."',
    },
  ];

  return (
    <Box
      id="ai-suite"
      sx={{
        py: 12,
        bgcolor: '#060914',
        color: '#F1F5F9',
        borderTop: '1px solid rgba(139,92,246,0.12)',
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip
            icon={<AutoAwesomeIcon style={{ fontSize: 16, color: '#A78BFA' }} />}
            label="LINKORA AI INTELLIGENCE"
            sx={{
              bgcolor: 'rgba(124,58,237,0.15)',
              color: '#A78BFA',
              fontWeight: 700,
              border: '1px solid rgba(124,58,237,0.3)',
              mb: 2,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2rem', md: '3rem' },
              background: 'linear-gradient(135deg, #FFFFFF 0%, #A78BFA 50%, #38BDF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Built-in AI Assistant to Supercharge Work
          </Typography>
          <Typography variant="body1" sx={{ color: '#94A3B8', maxWidth: 700, mx: 'auto' }}>
            Empower your organization with real-time translation, automated thread summaries, and
            smart composition directly inside your communication flow.
          </Typography>
        </Box>

        {/* Feature Selector & Demo Grid */}
        <Grid container spacing={4} sx={{ alignItems: 'center' }}>
          {/* Feature List */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              {features.map((feat, idx) => (
                <Paper
                  key={idx}
                  onClick={() => setActiveFeature(idx)}
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    borderRadius: '16px',
                    bgcolor: activeFeature === idx ? 'rgba(124,58,237,0.15)' : 'rgba(15,23,42,0.4)',
                    border:
                      activeFeature === idx
                        ? '2px solid #7C3AED'
                        : '1px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      borderColor: '#A78BFA',
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
                        bgcolor: 'rgba(15,23,42,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {feat.icon}
                    </Box>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ color: '#F1F5F9', mb: 0.5, fontSize: '1.05rem', fontWeight: 700 }}
                      >
                        {feat.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.875rem' }}>
                        {feat.desc}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Grid>

          {/* Live Interactive Simulator Display */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper
              sx={{
                p: 3.5,
                borderRadius: '20px',
                bgcolor: '#080C18',
                border: '1px solid rgba(139,92,246,0.25)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2.5 }}>
                <AutoAwesomeIcon sx={{ color: '#A78BFA', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ color: '#A78BFA', fontWeight: 700 }}>
                  Interactive AI Playground
                </Typography>
              </Stack>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.8 }}>
                  Input Context
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(15,23,42,0.8)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#94A3B8',
                      fontFamily: 'monospace',
                      fontSize: '0.8125rem',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {features[activeFeature].sampleInput}
                  </Typography>
                </Paper>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#34D399', display: 'block', mb: 0.8 }}>
                  AI Generated Output
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(16,185,129,0.06)',
                    border: '1px solid rgba(16,185,129,0.25)',
                    borderRadius: '12px',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#F1F5F9',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {features[activeFeature].sampleOutput}
                  </Typography>
                </Paper>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
