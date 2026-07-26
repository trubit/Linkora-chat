import { Navigate, Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/routes/index';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;

export function AdminGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!ADMIN_EMAIL || user?.email !== ADMIN_EMAIL) return <Navigate to={ROUTES.CHAT} replace />;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0, width: '100%', position: 'relative', overflow: 'hidden' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
