import { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useWallpaperStore, WALLPAPER_PRESETS } from '@/store/wallpaperStore';

interface WallpaperSelectorProps {
  open: boolean;
  onClose: () => void;
}

function compressImageForWallpaper(file: File, maxDim = 1280, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(e.target?.result as string);
        ctx.drawImage(img, 0, 0, width, height);
        const compressedUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function WallpaperSelector({ open, onClose }: WallpaperSelectorProps) {
  const { wallpaper: currentWallpaper, setWallpaper, resetWallpaper } = useWallpaperStore();
  const [selectedId, setSelectedId] = useState(currentWallpaper.id);
  const [customUrlInput, setCustomUrlInput] = useState(currentWallpaper.customUrl || '');
  const [uploadPreview, setUploadPreview] = useState<string | null>(
    currentWallpaper.type === 'custom' ? currentWallpaper.customUrl || null : null,
  );
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleResetDefault = () => {
    resetWallpaper();
    setSelectedId(WALLPAPER_PRESETS[0].id);
    setUploadPreview(null);
    setCustomUrlInput('');
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    try {
      setIsCompressing(true);
      const dataUrl = await compressImageForWallpaper(file);
      setUploadPreview(dataUrl);
      setCustomUrlInput(dataUrl);
      setSelectedId('custom');
    } catch {
      alert('Failed to process image file. Please try another image.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleApply = () => {
    if (selectedId === 'custom') {
      const imgUrl = uploadPreview || customUrlInput.trim();
      if (imgUrl) {
        setWallpaper({
          id: 'custom',
          name: 'Custom Uploaded Wallpaper',
          type: 'custom',
          customUrl: imgUrl,
          style: {
            backgroundImage: `url("${imgUrl}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          },
        });
      }
    } else {
      const found = WALLPAPER_PRESETS.find((p) => p.id === selectedId);
      if (found) {
        setWallpaper(found);
      }
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#0B1022',
            color: '#F1F5F9',
            borderRadius: '20px',
            border: '1px solid rgba(139,92,246,0.2)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          },
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          m: 0,
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography component="span" variant="h6" sx={{ fontWeight: 700, color: '#FFF' }}>
          Choose or Upload Chat Wallpaper
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: '#94A3B8', '&:hover': { color: '#FFF' } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.08)', py: 2.5 }}>
        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
          Select a preset wallpaper pattern, upload an image from your computer/device, or paste an
          image URL.
        </Typography>

        {/* ── Preset Wallpapers Grid ── */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#FFF', mb: 1.5 }}>
          Preset Designs
        </Typography>
        <Grid container spacing={2}>
          {WALLPAPER_PRESETS.map((wp) => {
            const isSelected = selectedId === wp.id;
            return (
              <Grid size={{ xs: 6, sm: 4 }} key={wp.id}>
                <Box
                  onClick={() => setSelectedId(wp.id)}
                  sx={{
                    height: 100,
                    borderRadius: '14px',
                    cursor: 'pointer',
                    position: 'relative',
                    border: isSelected ? '2px solid #10C4A0' : '1px solid rgba(255,255,255,0.12)',
                    boxShadow: isSelected ? '0 0 16px rgba(16,196,160,0.4)' : 'none',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    p: 1,
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      borderColor: '#10C4A0',
                    },
                    ...wp.style,
                  }}
                >
                  {isSelected && (
                    <Box sx={{ position: 'absolute', top: 8, right: 8, color: '#10C4A0' }}>
                      <CheckCircleIcon fontSize="small" />
                    </Box>
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: '#FFF',
                      bgcolor: 'rgba(0,0,0,0.7)',
                      px: 1,
                      py: 0.5,
                      borderRadius: '6px',
                      backdropFilter: 'blur(4px)',
                      fontSize: '0.72rem',
                    }}
                  >
                    {wp.name}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* ── Upload from Device Section ── */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#FFF', mb: 1 }}>
            Upload Custom Image from Device
          </Typography>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              p: 2.5,
              borderRadius: '14px',
              border:
                selectedId === 'custom' && uploadPreview
                  ? '2px solid #10C4A0'
                  : '2px dashed rgba(255,255,255,0.2)',
              bgcolor: 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#10C4A0',
                bgcolor: 'rgba(16,196,160,0.04)',
              },
            }}
          >
            {isCompressing ? (
              <Box
                sx={{
                  py: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <CircularProgress size={32} sx={{ color: '#10C4A0' }} />
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  Optimizing & compressing image for mobile…
                </Typography>
              </Box>
            ) : uploadPreview ? (
              <Box
                sx={{
                  width: '100%',
                  height: 110,
                  borderRadius: '10px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <img
                  src={uploadPreview}
                  alt="Wallpaper preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    bgcolor: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  Click to Change Uploaded Image
                </Box>
              </Box>
            ) : (
              <>
                <CloudUploadIcon sx={{ fontSize: 36, color: '#10C4A0' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#FFF' }}>
                  Click to select & upload image file
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  Supports PNG, JPG, WEBP, GIF
                </Typography>
              </>
            )}
          </Box>
        </Box>

        {/* ── Custom Image URL Input ── */}
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 500, color: '#94A3B8', mb: 0.5, display: 'block' }}
          >
            Or paste an Image URL:
          </Typography>
          <TextField
            size="small"
            fullWidth
            placeholder="https://example.com/wallpaper.jpg"
            value={customUrlInput}
            onChange={(e) => {
              setCustomUrlInput(e.target.value);
              setUploadPreview(e.target.value);
              setSelectedId('custom');
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.04)',
                color: '#FFF',
                borderRadius: '10px',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                '&:hover fieldset': { borderColor: '#10C4A0' },
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 2.5, justifyContent: 'space-between' }}>
        <Button
          onClick={handleResetDefault}
          sx={{ color: '#F43F5E', '&:hover': { bgcolor: 'rgba(244,63,94,0.1)' } }}
        >
          Restore Default
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} sx={{ color: '#94A3B8' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleApply}
            sx={{
              borderRadius: '10px',
              px: 3,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #10C4A0 0%, #0D9E80 100%)',
              boxShadow: '0 4px 14px rgba(16,196,160,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #3DD4B8 0%, #10C4A0 100%)',
              },
            }}
          >
            Apply Wallpaper
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
