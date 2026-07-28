import { useState } from 'react';
import { useNavigate, useLocation, Outlet, useMatch } from 'react-router-dom';
import {
  Box,
  Avatar,
  Tooltip,
  Typography,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
  Drawer,
  alpha,
} from '@mui/material';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import ExploreIcon from '@mui/icons-material/Explore';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import BlockIcon from '@mui/icons-material/Block';
import LockIcon from '@mui/icons-material/Lock';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { useAuthStore } from '@/store/authStore';
import { useSearchStore } from '@/store/searchStore';
import { useLogout } from '@/features/auth/queries';
import { LinkoraLogo } from '@/components/LinkoraLogo';
import { ROUTES } from '@/routes/index';
import ShieldIcon from '@mui/icons-material/Shield';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VerifiedIcon from '@mui/icons-material/Verified';
import ConversationList from '@/features/chat/components/ConversationList';
import { useChatSocket } from '@/features/chat/hooks/useChatSocket';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { GlobalSearch } from '@/features/search/components/GlobalSearch';
import { StatusFeed } from '@/features/status/components/StatusFeed';
import { AICopilotDrawer } from '@/components/AICopilotDrawer';
import { SubscriptionModal } from '@/features/settings/components/SubscriptionModal';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;

// ─── Design tokens ────────────────────────────────────────────────────────────

const STRIP_W = 62;
const PANEL_W = 360;

const C = {
  // ── Backgrounds ──────────────────────────────────────────────────────────
  strip: '#05060E', // near-pure obsidian
  panel: '#080C18', // deep midnight
  panelHdr: '#0B1022', // slightly lighter midnight
  main: '#060914', // true dark base
  // ── Borders ──────────────────────────────────────────────────────────────
  border: 'rgba(139,92,246,0.12)', // violet-tinted divider
  // ── Accent — electric violet + cyan ──────────────────────────────────────
  accent: '#9B6DFF', // vivid electric violet
  accentGlow: 'rgba(155,109,255,0.18)',
  accentDark: '#7C3AED', // deeper violet for gradients
  teal: '#22D3EE', // electric cyan
  gold: '#FBBF24', // amber gold highlight
  // ── Icons ────────────────────────────────────────────────────────────────
  icon: 'rgba(255,255,255,0.38)',
  iconHover: '#F1F5F9',
  // ── Search ───────────────────────────────────────────────────────────────
  searchBg: 'rgba(139,92,246,0.07)',
  // ── Status ───────────────────────────────────────────────────────────────
  badge: '#10B981', // emerald green
  // ── Text ─────────────────────────────────────────────────────────────────
  txt1: '#F1F5F9', // near-white
  txt2: '#94A3B8', // slate-blue secondary
  txt3: '#475569', // muted
} as const;

// ─── Nav items ─────────────────────────────────────────────────────────────────

const PRIMARY_NAV = [
  { label: 'Chats', icon: <ChatBubbleIcon sx={{ fontSize: 21 }} />, path: ROUTES.CHAT },
  { label: 'Groups', icon: <GroupsIcon sx={{ fontSize: 21 }} />, path: ROUTES.GROUPS },
  {
    label: 'Communities',
    icon: <Diversity3Icon sx={{ fontSize: 21 }} />,
    path: ROUTES.COMMUNITIES,
  },
  { label: 'Contacts', icon: <PeopleAltIcon sx={{ fontSize: 21 }} />, path: ROUTES.CONTACTS },
  { label: 'Friends', icon: <PersonAddAlt1Icon sx={{ fontSize: 21 }} />, path: ROUTES.FRIENDS },
  { label: 'Discover', icon: <ExploreIcon sx={{ fontSize: 21 }} />, path: ROUTES.DISCOVERY },
];

const SECONDARY_NAV = [
  { label: 'Profile', icon: <PersonIcon sx={{ fontSize: 21 }} />, path: ROUTES.PROFILE },
  { label: 'Privacy', icon: <LockIcon sx={{ fontSize: 21 }} />, path: ROUTES.PRIVACY_SETTINGS },
  { label: 'Blocked', icon: <BlockIcon sx={{ fontSize: 21 }} />, path: ROUTES.BLOCKING },
  { label: 'Settings', icon: <SettingsIcon sx={{ fontSize: 21 }} />, path: ROUTES.SETTINGS },
];

// ─── Single nav icon ──────────────────────────────────────────────────────────

function NavDot({
  item,
  active,
  onClick,
}: {
  item: { label: string; icon: React.ReactNode };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip title={item.label} placement="right">
      <span>
        <Box
          onClick={onClick}
          sx={{
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '14px',
            cursor: 'pointer',
            mb: 0.5,
            color: active ? C.accent : C.icon,
            bgcolor: active ? C.accentGlow : 'transparent',
            transition: 'all 0.18s ease',
            position: 'relative',
            '&:hover': {
              color: active ? C.accent : C.iconHover,
              bgcolor: active ? C.accentGlow : 'rgba(255,255,255,0.06)',
            },
            ...(active && {
              '&::before': {
                content: '""',
                position: 'absolute',
                left: -10,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 3,
                height: 22,
                borderRadius: '0 3px 3px 0',
                bgcolor: C.accent,
                boxShadow: `0 0 12px ${C.accent}, 0 0 24px ${alpha(C.accent, 0.4)}`,
              },
            }),
          }}
        >
          {item.icon}
        </Box>
      </span>
    </Tooltip>
  );
}

// ─── Icon strip ───────────────────────────────────────────────────────────────

function IconStrip({
  onNav,
  onSearchOpen,
  onAICopilotOpen,
  onUpgradeOpen,
}: {
  onNav: (p: string) => void;
  onSearchOpen: () => void;
  onAICopilotOpen: () => void;
  onUpgradeOpen: () => void;
}) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const isActive = (p: string) => location.pathname === p || location.pathname.startsWith(p + '/');

  return (
    <Box
      sx={{
        width: STRIP_W,
        minWidth: STRIP_W,
        height: '100%',
        bgcolor: C.strip,
        borderRight: `1px solid ${C.border}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 1.5,
        zIndex: 10,
        overflowY: 'auto',
        overflowX: 'hidden',
        flexShrink: 0,
        '&::-webkit-scrollbar': { width: 0, display: 'none' },
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '12px',
          mb: 2.5,
          flexShrink: 0,
          background: `linear-gradient(135deg, ${C.accentDark} 0%, ${C.accent} 50%, ${C.teal} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 20px rgba(124,58,237,0.55), 0 0 40px rgba(34,211,238,0.12)`,
        }}
      >
        <ChatBubbleIcon sx={{ fontSize: 17, color: '#fff' }} />
      </Box>

      {/* Primary nav */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
        {PRIMARY_NAV.map((it) => (
          <NavDot
            key={it.path}
            item={it}
            active={isActive(it.path)}
            onClick={() => onNav(it.path)}
          />
        ))}

        {/* Search — opens GlobalSearch dialog */}
        <Tooltip title="Search" placement="right">
          <Box
            onClick={onSearchOpen}
            sx={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '14px',
              cursor: 'pointer',
              mb: 0.5,
              color: C.icon,
              transition: 'all 0.18s ease',
              '&:hover': { color: C.iconHover, bgcolor: 'rgba(255,255,255,0.06)' },
            }}
          >
            <SearchIcon sx={{ fontSize: 21 }} />
          </Box>
        </Tooltip>

        {/* AI Copilot Trigger */}
        <Tooltip title="Linkora AI Copilot" placement="right">
          <Box
            onClick={() => onAICopilotOpen()}
            sx={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '14px',
              cursor: 'pointer',
              mb: 0.5,
              color: '#A78BFA',
              bgcolor: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.3)',
              transition: 'all 0.18s ease',
              '&:hover': {
                color: '#FFF',
                bgcolor: 'rgba(124,58,237,0.3)',
                boxShadow: '0 0 15px rgba(124,58,237,0.4)',
              },
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 20 }} />
          </Box>
        </Tooltip>

        {/* Upgrade Workspace */}
        <Tooltip title="Upgrade Workspace" placement="right">
          <Box
            onClick={() => onUpgradeOpen()}
            sx={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '14px',
              cursor: 'pointer',
              mb: 0.5,
              color: '#FBBF24',
              bgcolor: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.25)',
              transition: 'all 0.18s ease',
              '&:hover': { color: '#FFF', bgcolor: 'rgba(251,191,36,0.25)' },
            }}
          >
            <VerifiedIcon sx={{ fontSize: 20 }} />
          </Box>
        </Tooltip>
      </Box>

      {/* Secondary */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Notification bell — self-contained with its own drawer */}
        <Box sx={{ mb: 0.5 }}>
          <NotificationBell />
        </Box>

        {SECONDARY_NAV.map((it) => (
          <NavDot
            key={it.path}
            item={it}
            active={isActive(it.path)}
            onClick={() => onNav(it.path)}
          />
        ))}
        <Divider sx={{ width: 32, my: 1, borderColor: C.border }} />
        {ADMIN_EMAIL && user?.email === ADMIN_EMAIL && (
          <Tooltip title="Admin Panel" placement="right">
            <Box
              onClick={() => onNav(ROUTES.ADMIN)}
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                mb: 0.75,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: isActive(ROUTES.ADMIN) ? 'rgba(245,158,11,0.18)' : 'transparent',
                border: isActive(ROUTES.ADMIN)
                  ? '1px solid rgba(245,158,11,0.3)'
                  : '1px solid transparent',
                transition: 'all 0.18s',
                '&:hover': {
                  bgcolor: 'rgba(245,158,11,0.14)',
                  borderColor: 'rgba(245,158,11,0.25)',
                },
              }}
            >
              <ShieldIcon
                sx={{ fontSize: 18, color: isActive(ROUTES.ADMIN) ? '#F59E0B' : '#F59E0B80' }}
              />
            </Box>
          </Tooltip>
        )}
        <Tooltip title={`${user?.username ?? ''} · Sign out`} placement="right">
          <Avatar
            onClick={() => logout.mutate()}
            sx={{
              width: 34,
              height: 34,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              background: `linear-gradient(135deg, ${C.accentDark} 0%, ${C.accent} 100%)`,
              boxShadow: `0 2px 12px rgba(124,58,237,0.5), 0 0 20px rgba(155,109,255,0.2)`,
              transition: 'all 0.2s',
              mt: 0.5,
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: `0 4px 20px rgba(124,58,237,0.7), 0 0 30px rgba(34,211,238,0.2)`,
              },
            }}
          >
            {(user?.username ?? 'U').charAt(0).toUpperCase()}
          </Avatar>
        </Tooltip>
      </Box>
    </Box>
  );
}

// ─── Chat list panel wrapper (uses real ConversationList + StatusFeed) ──────────

function ChatListPanel() {
  const navigate = useNavigate();
  const convMatch = useMatch('/chat/:id');
  const groupMatch = useMatch('/chat/g/:groupId');

  const activeId =
    convMatch?.params.id ?? (groupMatch?.params.groupId ? `g:${groupMatch.params.groupId}` : null);

  return (
    <ConversationList
      onConversationSelect={(convId) => navigate(`${ROUTES.CHAT}/${convId}`)}
      activeId={activeId}
      headerSlot={<StatusFeed />}
    />
  );
}

// ─── Chat main empty state ────────────────────────────────────────────────────

function ChatWelcome() {
  return (
    <Box
      data-testid="page-chat"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        px: 4,
        background: `radial-gradient(ellipse at 30% 30%, ${alpha(C.accentDark, 0.12)} 0%, transparent 55%), radial-gradient(ellipse at 70% 70%, ${alpha(C.teal, 0.07)} 0%, transparent 50%)`,
      }}
    >
      <Box
        sx={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${alpha(C.accent, 0.12)} 0%, ${alpha(C.teal, 0.08)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1.5px solid ${alpha(C.accent, 0.28)}`,
          boxShadow: `0 8px 40px ${alpha(C.accentDark, 0.35)}, 0 0 60px ${alpha(C.teal, 0.1)}`,
          mb: 0.5,
        }}
      >
        <ChatBubbleIcon sx={{ fontSize: 40, color: alpha(C.accent, 0.5) }} />
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Typography
          sx={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.5px',
            mb: 0.75,
            background: `linear-gradient(135deg, #F1F5F9 0%, ${C.accent} 60%, ${C.teal} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Linkora for Desktop
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: C.txt2, lineHeight: 1.7, maxWidth: 280 }}>
          Select a conversation from the list or start a new one to begin messaging.
        </Typography>
      </Box>

      <Box
        sx={{
          mt: 0.5,
          px: 2,
          py: 0.75,
          borderRadius: '20px',
          border: `1px solid ${alpha(C.gold, 0.22)}`,
          background: `linear-gradient(135deg, ${alpha(C.gold, 0.06)} 0%, transparent 100%)`,
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
        }}
      >
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: C.gold,
            boxShadow: `0 0 8px ${C.gold}, 0 0 16px ${alpha(C.gold, 0.4)}`,
          }}
        />
        <Typography
          sx={{ fontSize: 11.5, color: alpha(C.gold, 0.85), letterSpacing: 0.3, fontWeight: 500 }}
        >
          End-to-end encrypted
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Desktop layout ───────────────────────────────────────────────────────────

function DesktopLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const openSearch = useSearchStore((s) => s.openSearch);
  const [aiCopilotOpen, setAiCopilotOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);

  const isChat =
    location.pathname === ROUTES.CHAT || location.pathname.startsWith(ROUTES.CHAT + '/');
  const hasConversation =
    location.pathname.startsWith(ROUTES.CHAT + '/') && location.pathname !== ROUTES.CHAT;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        display: 'flex',
        overflow: 'hidden',
        bgcolor: C.main,
      }}
    >
      {/* Global search dialog — opens via store, manages its own state */}
      <GlobalSearch />

      {/* AI Assistant Drawer */}
      <AICopilotDrawer open={aiCopilotOpen} onClose={() => setAiCopilotOpen(false)} />

      {/* Subscription Upgrade Modal */}
      <SubscriptionModal open={subscriptionOpen} onClose={() => setSubscriptionOpen(false)} />

      {/* Icon strip — always visible */}
      <IconStrip
        onNav={(p) => navigate(p)}
        onSearchOpen={openSearch}
        onAICopilotOpen={() => setAiCopilotOpen(true)}
        onUpgradeOpen={() => setSubscriptionOpen(true)}
      />

      {isChat ? (
        <>
          {/* Chat list panel */}
          <Box
            sx={{
              width: PANEL_W,
              minWidth: PANEL_W,
              flexShrink: 0,
              bgcolor: C.panel,
              borderRight: `1px solid ${C.border}`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <ChatListPanel />
          </Box>

          {/* Conversation area */}
          <Box
            component="main"
            sx={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              bgcolor: C.main,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {hasConversation ? <Outlet /> : <ChatWelcome />}
          </Box>
        </>
      ) : (
        /* Non-chat pages take full remaining width */
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: 'auto',
            bgcolor: C.main,
          }}
        >
          <Outlet />
        </Box>
      )}
    </Box>
  );
}

// ─── Mobile layout ────────────────────────────────────────────────────────────

function MobileLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openSearch = useSearchStore((s) => s.openSearch);
  const isActive = (p: string) => location.pathname === p || location.pathname.startsWith(p + '/');

  const inConversation =
    (location.pathname.startsWith('/chat/') && location.pathname !== '/chat') ||
    location.pathname.startsWith('/chat/g/');

  return (
    <Box
      sx={{
        width: '100%',
        height: '100dvh',
        maxHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: C.main,
        overflow: 'hidden',
      }}
    >
      {/* Global search dialog — opens via store, manages its own state */}
      <GlobalSearch />

      {/* Top bar — hidden inside active conversation for 100% full-screen mobile chat */}
      {!inConversation && (
        <Box
          sx={{
            height: 'calc(52px + env(safe-area-inset-top, 0px))',
            pt: 'env(safe-area-inset-top, 0px)',
            bgcolor: C.strip,
            borderBottom: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            px: 1.5,
            gap: 1,
            flexShrink: 0,
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              (e.currentTarget as HTMLElement).blur();
              setDrawerOpen(true);
            }}
            sx={{ color: C.icon, width: 40, height: 40 }}
          >
            <MenuIcon />
          </IconButton>
          <LinkoraLogo size={26} showWordmark wordmarkColor={C.txt1} wordmarkSize="1rem" />
          <Box sx={{ flex: 1 }} />
          {/* Search icon */}
          <IconButton
            size="small"
            onClick={openSearch}
            sx={{ color: C.icon, width: 40, height: 40 }}
          >
            <SearchIcon />
          </IconButton>
          {/* Notification bell — self-contained with its own drawer */}
          <NotificationBell />
        </Box>
      )}

      {/* Page content */}
      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Box>

      {/* Bottom tab bar — hidden inside active conversation for 100% full-screen mobile chat */}
      {!inConversation && (
        <Box
          sx={{
            height: 'calc(58px + env(safe-area-inset-bottom, 0px))',
            pb: 'env(safe-area-inset-bottom, 0px)',
            bgcolor: C.strip,
            borderTop: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            px: 0.5,
            flexShrink: 0,
            zIndex: 1100,
            position: 'relative',
          }}
        >
          {[...PRIMARY_NAV, SECONDARY_NAV[3]].map((it) => {
            const active = isActive(it.path);
            return (
              <Box
                key={it.path}
                onClick={() => navigate(it.path)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.2,
                  flex: 1,
                  px: 0.5,
                  py: 0.5,
                  minHeight: 44,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  color: active ? C.accent : C.icon,
                  transition: 'all 0.15s',
                  '&:active': { transform: 'scale(0.95)' },
                }}
              >
                {it.icon}
                <Typography
                  sx={{ fontSize: 9.5, fontWeight: active ? 600 : 400, color: 'inherit' }}
                >
                  {it.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { bgcolor: C.panel, width: 260, border: 'none' } } }}
      >
        <Box sx={{ p: 2.5, borderBottom: `1px solid ${C.border}` }}>
          <LinkoraLogo size={30} showWordmark wordmarkColor={C.txt1} wordmarkSize="1.0625rem" />
        </Box>
        <Box sx={{ p: 1.5 }}>
          {[...PRIMARY_NAV, ...SECONDARY_NAV].map((it) => {
            const active = isActive(it.path);
            return (
              <Box
                key={it.path}
                onClick={() => {
                  navigate(it.path);
                  setDrawerOpen(false);
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  mb: 0.25,
                  color: active ? C.accent : C.icon,
                  bgcolor: active ? C.accentGlow : 'transparent',
                  transition: 'all 0.15s',
                  '&:hover': {
                    bgcolor: active ? C.accentGlow : 'rgba(255,255,255,0.05)',
                    color: active ? C.accent : C.iconHover,
                  },
                }}
              >
                {it.icon}
                <Typography sx={{ fontSize: 14, fontWeight: active ? 600 : 400, color: 'inherit' }}>
                  {it.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Drawer>
    </Box>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function AppLayout() {
  useChatSocket(); // keep socket connected + DM event listeners alive across all pages
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
