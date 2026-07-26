import { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  IconButton,
  Tabs,
  Tab,
  Stack,
  Chip,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import TitleIcon from '@mui/icons-material/Title';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useCreateStatus } from '../queries/index';

interface StatusCreatorProps {
  open: boolean;
  onClose: () => void;
}

const BG_COLORS = [
  '#075E54', '#128C7E', '#25D366',
  '#7C3AED', '#9B6DFF', '#1D4ED8',
  '#DC2626', '#EA580C', '#D97706',
  '#0F172A', '#1E293B', '#374151',
];

const PRIVACY_OPTIONS = [
  { value: 'all_contacts', label: 'All contacts' },
  { value: 'contacts_except', label: 'Contacts except…' },
  { value: 'only_share_with', label: 'Only share with…' },
] as const;

export function StatusCreator({ open, onClose }: StatusCreatorProps) {
  const [tab, setTab] = useState<'text' | 'media'>('text');
  const [text, setText] = useState('');
  const [bg, setBg] = useState(BG_COLORS[0]);
  const [privacy, setPrivacy] = useState<'all_contacts' | 'contacts_except' | 'only_share_with'>(
    'all_contacts',
  );

  // Media upload state
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaMime, setMediaMime] = useState<string>('image/jpeg');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createStatus, isPending } = useCreateStatus();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      alert('Please select an image (PNG, JPG) or video file (MP4, WEBM).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setMediaUrl(dataUrl);
        setMediaType(isVideo ? 'video' : 'image');
        setMediaMime(file.type);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePost = () => {
    if (tab === 'text') {
      if (!text.trim()) return;
      createStatus(
        { type: 'text', content: text.trim(), backgroundColor: bg, privacy },
        {
          onSuccess: () => resetAndClose(),
        },
      );
    } else {
      if (!mediaUrl) return;
      createStatus(
        {
          type: mediaType,
          content: text.trim() || undefined,
          media: {
            url: mediaUrl,
            mimeType: mediaMime,
          },
          privacy,
        },
        {
          onSuccess: () => resetAndClose(),
        },
      );
    }
  };

  const resetAndClose = () => {
    setText('');
    setBg(BG_COLORS[0]);
    setMediaUrl(null);
    setTab('text');
    onClose();
  };

  const handleClose = () => {
    if (isPending) return;
    resetAndClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: 3, bgcolor: '#0B1022', color: '#FFF' } } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700, fontSize: 17, color: '#FFF' }}>
            Add Status Update
          </Typography>
          <Chip
            icon={<AccessTimeIcon sx={{ fontSize: '14px !important', color: '#10C4A0' }} />}
            label="24 Hours"
            size="small"
            sx={{ bgcolor: 'rgba(16,196,160,0.12)', color: '#10C4A0', fontWeight: 600, fontSize: '0.72rem' }}
          />
        </Stack>
        <IconButton size="small" onClick={handleClose} disabled={isPending} sx={{ color: '#94A3B8' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={tab}
        onChange={(_e, v) => setTab(v)}
        variant="fullWidth"
        sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <Tab icon={<TitleIcon />} iconPosition="start" label="Text Status" value="text" sx={{ color: '#94A3B8' }} />
        <Tab icon={<PhotoCameraIcon />} iconPosition="start" label="Photo / Video" value="media" sx={{ color: '#94A3B8' }} />
      </Tabs>

      <DialogContent sx={{ pt: 2 }}>
        {tab === 'text' ? (
          <>
            {/* Text Preview */}
            <Box
              sx={{
                width: '100%',
                height: 200,
                borderRadius: 2,
                bgcolor: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                transition: 'background-color 0.2s',
                overflow: 'hidden',
                p: 2,
              }}
            >
              <Typography
                sx={{
                  color: '#fff',
                  fontSize: text ? 22 : 15,
                  fontWeight: 600,
                  textAlign: 'center',
                  opacity: text ? 1 : 0.5,
                  textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                  wordBreak: 'break-word',
                }}
              >
                {text || 'Start typing your status…'}
              </Typography>
            </Box>

            {/* Text input */}
            <TextField
              autoFocus
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              slotProps={{
                htmlInput: { maxLength: 700 },
              }}
              helperText={`${text.length}/700`}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.04)',
                  color: '#FFF',
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                },
              }}
            />

            {/* Background colour picker */}
            <Typography variant="caption" sx={{ color: '#94A3B8', mb: 0.75, display: 'block' }}>
              Background color
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
              {BG_COLORS.map((c) => (
                <Box
                  key={c}
                  onClick={() => setBg(c)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: c,
                    cursor: 'pointer',
                    border: bg === c ? '3px solid #fff' : '2px solid transparent',
                    boxShadow: bg === c ? `0 0 0 2px ${c}` : 'none',
                    transition: 'all 0.15s',
                  }}
                />
              ))}
            </Box>
          </>
        ) : (
          /* Media Upload Tab */
          <>
            <input
              type="file"
              accept="image/*,video/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                width: '100%',
                height: 220,
                borderRadius: 2,
                border: mediaUrl ? '1px solid rgba(16,196,160,0.5)' : '2px dashed rgba(255,255,255,0.2)',
                bgcolor: 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                mb: 2,
                '&:hover': {
                  borderColor: '#10C4A0',
                  bgcolor: 'rgba(16,196,160,0.04)',
                },
              }}
            >
              {mediaUrl ? (
                mediaType === 'video' ? (
                  <Box
                    component="video"
                    src={mediaUrl}
                    controls
                    autoPlay
                    loop
                    muted
                    sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Box
                    component="img"
                    src={mediaUrl}
                    alt="Status media preview"
                    sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )
              ) : (
                <Stack spacing={1} sx={{ alignItems: 'center' }}>
                  <CloudUploadIcon sx={{ fontSize: 44, color: '#10C4A0' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#FFF' }}>
                    Click to select Photo or Short Video
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    Supports JPG, PNG, WEBP, MP4, WEBM
                  </Typography>
                </Stack>
              )}
            </Box>

            {/* Optional Caption */}
            <TextField
              fullWidth
              size="small"
              placeholder="Add a caption..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.04)',
                  color: '#FFF',
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                },
              }}
            />
          </>
        )}

        {/* Privacy */}
        <Typography variant="caption" sx={{ color: '#94A3B8', mb: 0.75, display: 'block' }}>
          Who can see this?
        </Typography>
        <ToggleButtonGroup
          value={privacy}
          exclusive
          onChange={(_e, v) => { if (v) setPrivacy(v); }}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
        >
          {PRIVACY_OPTIONS.map((opt) => (
            <ToggleButton key={opt.value} value={opt.value} sx={{ fontSize: 11, py: 0.5, color: '#94A3B8' }}>
              {opt.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose} disabled={isPending} variant="outlined" sx={{ color: '#94A3B8' }}>
          Cancel
        </Button>
        <Button
          onClick={handlePost}
          disabled={(tab === 'text' && !text.trim()) || (tab === 'media' && !mediaUrl) || isPending}
          variant="contained"
          startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{
            minWidth: 100,
            background: 'linear-gradient(135deg, #10C4A0 0%, #0D9E80 100%)',
            fontWeight: 700,
          }}
        >
          {isPending ? 'Posting…' : 'Share Status'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
