import { useState, useRef, useEffect } from 'react';
import { Box, Container, Typography, Stack, Button, TextField, Avatar, Chip, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import LockIcon from '@mui/icons-material/Lock';
import RefreshIcon from '@mui/icons-material/Refresh';

interface DemoMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const PRESET_PROMPTS = [
  'What is Linkora?',
  'How does E2EE security work?',
  'Can I create broadcast channels?',
  'Does Linkora support voice rooms?',
];

const BOT_RESPONSES: Record<string, string> = {
  'What is Linkora?':
    'Linkora is the next-generation real-time communication platform combining private messaging, broadcast channels, voice servers, and workspace threads into one unified app! ⚡',
  'How does E2EE security work?':
    'All direct messages and private voice sessions use end-to-end Signal protocol encryption. Your keys never leave your device! 🔒',
  'Can I create broadcast channels?':
    'Yes! You can create public or private channels with unlimited subscribers, admin controls, and media attachments. 📢',
  'Does Linkora support voice rooms?':
    'Absolutely! Linkora includes low-latency WebRTC voice & video rooms with noise suppression and screen sharing. 🎙️',
  default:
    'Thanks for testing Linkora! Linkora uses real-time WebSockets to deliver sub-10ms message latency across all devices. Feel free to click "Get Started Free" to create your account! 🚀',
};

export default function LiveDemoSection() {
  const [messages, setMessages] = useState<DemoMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Welcome to the Linkora interactive sandbox! Try asking a question or select a quick prompt below. 👋',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: DemoMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Simulate real-time bot response with typing delay
    setTimeout(() => {
      const responseText = BOT_RESPONSES[query] || BOT_RESPONSES.default;
      const botMsg: DemoMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleReset = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'Sandbox reset! Ask another question to test the real-time response system.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <Box
      id="live-demo"
      sx={{
        py: { xs: 10, md: 16 },
        bgcolor: '#060914',
        position: 'relative',
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Stack spacing={2} sx={{ mb: 5, textAlign: 'center', alignItems: 'center' }}>
          <Chip
            label="INTERACTIVE SANDBOX"
            sx={{
              fontWeight: 700,
              bgcolor: 'rgba(16,196,160,0.15)',
              color: '#10C4A0',
              fontSize: '0.75rem',
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.875rem', sm: '2.75rem' },
              fontWeight: 800,
              color: '#FFFFFF',
            }}
          >
            Try Linkora right now
          </Typography>
          <Typography sx={{ color: '#94A3B8', fontSize: '1rem', maxWidth: 580 }}>
            Experience real-time instant messaging responsiveness directly in your browser.
          </Typography>
        </Stack>

        {/* Live Chat Widget Box */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '24px',
            bgcolor: '#080C18',
            border: '1px solid rgba(139,92,246,0.25)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            overflow: 'hidden',
          }}
        >
          {/* Header Bar */}
          <Box
            sx={{
              px: 3,
              py: 2,
              bgcolor: '#05060E',
              borderBottom: '1px solid rgba(139,92,246,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: '#10C4A0', width: 36, height: 36, color: '#05060E' }}>
                <SmartToyIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: '0.925rem', fontWeight: 700, color: '#F1F5F9' }}>
                  Linkora Assistant
                </Typography>
                <Typography sx={{ fontSize: '0.725rem', color: '#10C4A0' }}>
                  ● Active Sandbox Server
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip
                icon={<LockIcon sx={{ fontSize: '13px !important', color: '#10C4A0 !important' }} />}
                label="Encrypted"
                size="small"
                sx={{ bgcolor: 'rgba(16,196,160,0.12)', color: '#10C4A0', fontSize: '0.7rem', fontWeight: 600 }}
              />
              <Button
                size="small"
                onClick={handleReset}
                startIcon={<RefreshIcon />}
                sx={{ color: '#94A3B8', fontSize: '0.75rem' }}
              >
                Reset
              </Button>
            </Stack>
          </Box>

          {/* Messages Stream Container */}
          <Box
            sx={{
              p: 3,
              height: 380,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              bgcolor: '#060914',
            }}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <Box
                  key={msg.id}
                  sx={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isUser
                        ? 'linear-gradient(135deg, #7C3AED 0%, #9B6DFF 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: isUser ? '0 4px 20px rgba(124,58,237,0.3)' : 'none',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.9rem', color: '#FFFFFF', lineHeight: 1.5 }}>
                      {msg.text}
                    </Typography>
                  </Box>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ mt: 0.5, px: 0.5, justifyContent: isUser ? 'flex-end' : 'flex-start', alignItems: 'center' }}
                  >
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>{msg.timestamp}</Typography>
                    {isUser && <DoneAllIcon sx={{ fontSize: 14, color: '#10C4A0' }} />}
                  </Stack>
                </Box>
              );
            })}

            {/* Typing Indicator Animation */}
            {isTyping && (
              <Box sx={{ alignSelf: 'flex-start' }}>
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderRadius: '16px',
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                  }}
                >
                  <Typography sx={{ fontSize: '0.8rem', color: '#10C4A0', fontWeight: 600 }}>
                    Linkora typing...
                  </Typography>
                </Box>
              </Box>
            )}
            <div ref={chatBottomRef} />
          </Box>

          {/* Quick Preset Prompts */}
          <Box sx={{ px: 3, pt: 1.5, pb: 1, bgcolor: '#080C18', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
              {PRESET_PROMPTS.map((prompt) => (
                <Chip
                  key={prompt}
                  label={prompt}
                  clickable
                  onClick={() => handleSend(prompt)}
                  sx={{
                    fontSize: '0.75rem',
                    bgcolor: 'rgba(155, 109, 255, 0.1)',
                    color: '#A78BFA',
                    border: '1px solid rgba(155, 109, 255, 0.2)',
                    '&:hover': { bgcolor: 'rgba(155, 109, 255, 0.2)', borderColor: '#9B6DFF' },
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Message Input Controls */}
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            sx={{
              p: 2,
              bgcolor: '#05060E',
              borderTop: '1px solid rgba(139,92,246,0.12)',
              display: 'flex',
              gap: 1.5,
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Type your message to test..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.04)',
                  borderRadius: '12px',
                  color: '#F1F5F9',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: '#10C4A0' },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!input.trim()}
              sx={{
                borderRadius: '12px',
                px: 2.5,
                bgcolor: '#10C4A0',
                color: '#05060E',
                fontWeight: 700,
                '&:hover': { bgcolor: '#3DD4B8' },
              }}
            >
              <SendIcon sx={{ fontSize: 20 }} />
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
