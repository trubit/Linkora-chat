import { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Chip,
  Stack,
  Divider,
  Paper,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TranslateIcon from '@mui/icons-material/Translate';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import SummarizeIcon from '@mui/icons-material/Summarize';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

interface AICopilotDrawerProps {
  open: boolean;
  onClose: () => void;
  initialContext?: string;
  onApplyText?: (text: string) => void;
}

export function AICopilotDrawer({
  open,
  onClose,
  initialContext = '',
  onApplyText,
}: AICopilotDrawerProps) {
  const [inputText, setInputText] = useState(initialContext);
  const [activeTab, setActiveTab] = useState<'copilot' | 'translate' | 'summarize' | 'polish'>(
    'copilot',
  );
  const [selectedLanguage, setSelectedLanguage] = useState('Spanish');
  const [selectedTone, setSelectedTone] = useState('Professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (promptType: string) => {
    setIsGenerating(true);
    setAiResult('');

    // Simulate AI inference delay for responsive demo
    await new Promise((res) => setTimeout(res, 1200));

    let output: string;
    const source =
      inputText.trim() || 'Hello! Welcome to Linkora AI Copilot. How can I assist you today?';

    switch (promptType) {
      case 'summarize':
        output = `📌 **Key Summary:**\n• ${source.slice(0, 100)}...\n• High priority action item identified.\n• Next step: Align team on delivery schedule.`;
        break;
      case 'translate':
        output = `🌐 **${selectedLanguage} Translation:**\n${source} → (Translated cleanly to ${selectedLanguage} with natural phrasing)`;
        break;
      case 'polish':
        output = `✨ **${selectedTone} Refinement:**\n"Thank you for reaching out. I have reviewed the proposal and look forward to collaborating effectively."`;
        break;
      default:
        output = `🤖 **Linkora AI Response:**\nI analyzed your query: "${source}". Here is an optimized response ready to share with your workspace team.`;
        break;
    }

    setAiResult(output);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 420 },
            bgcolor: '#080C18',
            color: '#F1F5F9',
            borderLeft: '1px solid rgba(139, 92, 246, 0.2)',
            boxShadow: '-10px 0 40px rgba(0,0,0,0.6)',
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(139,92,246,0.15)',
          background:
            'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(6,182,212,0.06) 100%)',
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: 'rgba(124,58,237,0.2)',
              border: '1px solid rgba(124,58,237,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AutoAwesomeIcon sx={{ color: '#A78BFA', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ color: '#F1F5F9', fontWeight: 700 }}>
              Linkora AI Copilot
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              Enterprise Communication Intelligence
            </Typography>
          </Box>
        </Stack>

        <IconButton onClick={onClose} sx={{ color: '#94A3B8', '&:hover': { color: '#FFF' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Feature Tabs */}
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
          <Chip
            icon={<AutoAwesomeIcon style={{ fontSize: 16 }} />}
            label="Assistant"
            onClick={() => setActiveTab('copilot')}
            sx={{
              bgcolor: activeTab === 'copilot' ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'copilot' ? '#C4B5FD' : '#94A3B8',
              border:
                activeTab === 'copilot' ? '1px solid #7C3AED' : '1px solid rgba(255,255,255,0.08)',
              fontWeight: 600,
            }}
          />
          <Chip
            icon={<SummarizeIcon style={{ fontSize: 16 }} />}
            label="Summarize"
            onClick={() => setActiveTab('summarize')}
            sx={{
              bgcolor:
                activeTab === 'summarize' ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'summarize' ? '#C4B5FD' : '#94A3B8',
              border:
                activeTab === 'summarize'
                  ? '1px solid #7C3AED'
                  : '1px solid rgba(255,255,255,0.08)',
              fontWeight: 600,
            }}
          />
          <Chip
            icon={<TranslateIcon style={{ fontSize: 16 }} />}
            label="Translate"
            onClick={() => setActiveTab('translate')}
            sx={{
              bgcolor:
                activeTab === 'translate' ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'translate' ? '#C4B5FD' : '#94A3B8',
              border:
                activeTab === 'translate'
                  ? '1px solid #7C3AED'
                  : '1px solid rgba(255,255,255,0.08)',
              fontWeight: 600,
            }}
          />
          <Chip
            icon={<FormatQuoteIcon style={{ fontSize: 16 }} />}
            label="Polish"
            onClick={() => setActiveTab('polish')}
            sx={{
              bgcolor: activeTab === 'polish' ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'polish' ? '#C4B5FD' : '#94A3B8',
              border:
                activeTab === 'polish' ? '1px solid #7C3AED' : '1px solid rgba(255,255,255,0.08)',
              fontWeight: 600,
            }}
          />
        </Stack>
      </Box>

      {/* Input Area */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1 }}>
          Source Text / Prompt Context
        </Typography>
        <TextField
          multiline
          rows={4}
          fullWidth
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste conversation thread, draft email, or ask AI assistant..."
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(15,23,42,0.6)',
              borderRadius: '12px',
              color: '#F1F5F9',
              fontSize: '0.875rem',
              '& fieldset': { borderColor: 'rgba(139,92,246,0.2)' },
              '&:hover fieldset': { borderColor: '#7C3AED' },
              '&.Mui-focused fieldset': { borderColor: '#A78BFA' },
            },
          }}
        />

        {/* Options for Translate & Polish */}
        {activeTab === 'translate' && (
          <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
            {['Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Portuguese'].map((lang) => (
              <Chip
                key={lang}
                label={lang}
                size="small"
                onClick={() => setSelectedLanguage(lang)}
                sx={{
                  bgcolor: selectedLanguage === lang ? '#7C3AED' : 'rgba(255,255,255,0.05)',
                  color: '#FFF',
                  fontSize: '0.75rem',
                }}
              />
            ))}
          </Stack>
        )}

        {activeTab === 'polish' && (
          <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
            {['Professional', 'Casual', 'Executive', 'Persuasive', 'Concise'].map((tone) => (
              <Chip
                key={tone}
                label={tone}
                size="small"
                onClick={() => setSelectedTone(tone)}
                sx={{
                  bgcolor: selectedTone === tone ? '#7C3AED' : 'rgba(255,255,255,0.05)',
                  color: '#FFF',
                  fontSize: '0.75rem',
                }}
              />
            ))}
          </Stack>
        )}

        {/* Action Button */}
        <Button
          variant="contained"
          fullWidth
          disabled={isGenerating}
          onClick={() => handleGenerate(activeTab)}
          startIcon={
            isGenerating ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />
          }
          sx={{
            mt: 2,
            py: 1.2,
            borderRadius: '12px',
            fontWeight: 700,
            textTransform: 'none',
            background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
            boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)',
            },
          }}
        >
          {isGenerating ? 'AI Reasoning in Progress...' : `Run AI ${activeTab.toUpperCase()}`}
        </Button>
      </Box>

      <Divider sx={{ borderColor: 'rgba(139,92,246,0.12)', my: 1 }} />

      {/* Output / Results Box */}
      <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1 }}>
          AI Output Generation
        </Typography>

        {aiResult ? (
          <Paper
            sx={{
              p: 2,
              bgcolor: 'rgba(15,23,42,0.7)',
              borderRadius: '12px',
              border: '1px solid rgba(139,92,246,0.25)',
              position: 'relative',
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: '#F1F5F9', whiteSpace: 'pre-line', fontSize: '0.875rem' }}
            >
              {aiResult}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'flex-end' }}>
              <Tooltip title={copied ? 'Copied to Clipboard' : 'Copy Result'}>
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  sx={{ color: '#94A3B8', '&:hover': { color: '#FFF' } }}
                >
                  {copied ? (
                    <CheckIcon fontSize="small" color="success" />
                  ) : (
                    <ContentCopyIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              {onApplyText && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onApplyText(aiResult)}
                  startIcon={<SendIcon style={{ fontSize: 14 }} />}
                  sx={{
                    borderColor: 'rgba(124,58,237,0.4)',
                    color: '#A78BFA',
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    '&:hover': { borderColor: '#7C3AED', bgcolor: 'rgba(124,58,237,0.1)' },
                  }}
                >
                  Apply to Message
                </Button>
              )}
            </Stack>
          </Paper>
        ) : (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: '12px',
              border: '1px dashed rgba(255,255,255,0.1)',
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 32, color: 'rgba(167,139,250,0.3)', mb: 1 }} />
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Select an AI mode above and click Run to generate AI insights, translations, or smart
              replies.
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
