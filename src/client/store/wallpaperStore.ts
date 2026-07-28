import { create } from 'zustand';

export interface WallpaperConfig {
  id: string;
  name: string;
  type: 'preset' | 'custom';
  style: React.CSSProperties;
  customUrl?: string;
}

export const WALLPAPER_PRESETS: WallpaperConfig[] = [
  {
    id: 'linkora-obsidian',
    name: 'Linkora Obsidian Nebula',
    type: 'preset',
    style: {
      backgroundColor: '#060914',
      backgroundImage:
        'radial-gradient(rgba(124,58,237,0.22) 1.5px, transparent 1.5px), radial-gradient(rgba(6,182,212,0.12) 1.5px, transparent 1.5px)',
      backgroundSize: '32px 32px',
      backgroundPosition: '0 0, 16px 16px',
    },
  },
  {
    id: 'emerald-matrix',
    name: 'Emerald Matrix',
    type: 'preset',
    style: {
      background: 'linear-gradient(135deg, #041713 0%, #0B382F 100%)',
      backgroundImage:
        'radial-gradient(rgba(34,211,238,0.2) 1.5px, transparent 0), linear-gradient(0deg, rgba(16,196,160,0.06) 1px, transparent 1px)',
      backgroundSize: '24px 24px, 100% 24px',
    },
  },
  {
    id: 'violet-starlight',
    name: 'Violet Galaxy',
    type: 'preset',
    style: {
      background: 'linear-gradient(135deg, #090616 0%, #1A0D36 100%)',
      backgroundImage:
        'radial-gradient(rgba(155,109,255,0.25) 1.5px, transparent 0), radial-gradient(rgba(255,255,255,0.1) 1px, transparent 0)',
      backgroundSize: '28px 28px, 14px 14px',
      backgroundPosition: '0 0, 7px 7px',
    },
  },
  {
    id: 'cyberpunk-grid',
    name: 'Cyber Neon Grid',
    type: 'preset',
    style: {
      backgroundColor: '#030812',
      backgroundImage:
        'linear-gradient(rgba(34,211,238,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.1) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
    },
  },
  {
    id: 'deep-ocean',
    name: 'Deep Ocean Blue',
    type: 'preset',
    style: {
      background: 'linear-gradient(180deg, #030F1C 0%, #0A2644 100%)',
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 0)',
      backgroundSize: '20px 20px',
    },
  },
  {
    id: 'pitch-black',
    name: 'OLED Pitch Black',
    type: 'preset',
    style: {
      backgroundColor: '#000000',
    },
  },
];

export interface WallpaperState {
  wallpaper: WallpaperConfig;
  setWallpaper: (config: WallpaperConfig) => void;
  resetWallpaper: () => void;
}

const STORAGE_KEY = 'linkora_room_wallpaper';

const getInitialWallpaper = (): WallpaperConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  return WALLPAPER_PRESETS[0];
};

export const useWallpaperStore = create<WallpaperState>((set) => ({
  wallpaper: getInitialWallpaper(),
  setWallpaper: (config) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch {
        // memory fallback
      }
    }
    set({ wallpaper: config });
  },
  resetWallpaper: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    set({ wallpaper: WALLPAPER_PRESETS[0] });
  },
}));
