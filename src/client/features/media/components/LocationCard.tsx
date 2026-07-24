import { Box, Typography, Button } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import PlaceIcon from '@mui/icons-material/Place';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const C = {
  border: 'rgba(139,92,246,0.12)',
  txt1: '#F1F5F9',
  txt2: '#94A3B8',
  txt3: '#475569',
  bg: 'rgba(13,18,37,0.9)',
  accent: '#9B6DFF',
} as const;

export function LocationCard({
  latitude,
  longitude,
  name,
  address,
}: {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}) {
  const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

  return (
    <Box
      sx={{
        bgcolor: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: '12px',
        overflow: 'hidden',
        maxWidth: 280,
      }}
    >
      {/* Map placeholder — external static tile services are unreliable; use icon */}
      <Box
        sx={{
          width: '100%',
          height: 140,
          bgcolor: 'rgba(255,255,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MapIcon
          sx={{
            fontSize: 40,
            color: C.accent,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
          }}
        />
      </Box>

      {/* Info */}
      <Box sx={{ px: 1.25, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: 0.5 }}>
          <PlaceIcon sx={{ fontSize: 16, color: '#EF4444', mt: '1px', flexShrink: 0 }} />
          <Box>
            {name && (
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: C.txt1, lineHeight: 1.3 }}>
                {name}
              </Typography>
            )}
            {address && (
              <Typography sx={{ fontSize: 12, color: C.txt3, lineHeight: 1.3 }}>
                {address}
              </Typography>
            )}
            {!name && !address && (
              <Typography sx={{ fontSize: 12, color: C.txt3 }}>
                {latitude.toFixed(5)}, {longitude.toFixed(5)}
              </Typography>
            )}
          </Box>
        </Box>

        <Button
          component="a"
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          size="small"
          fullWidth
          endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
          sx={{
            fontSize: 12,
            color: C.accent,
            textTransform: 'none',
            borderRadius: '8px',
            border: `1px solid ${C.border}`,
            '&:hover': { borderColor: C.accent, bgcolor: 'rgba(155,109,255,0.07)' },
          }}
        >
          Open in Maps
        </Button>
      </Box>
    </Box>
  );
}
