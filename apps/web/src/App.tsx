import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { useCurrentUser } from './hooks/useCurrentUser';
import { Navbar } from './components/Navbar';
import { GlobalSnackbar } from './components/GlobalSnackbar';
import { Feed } from './pages/Feed';
import { Rewards } from './pages/Rewards';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Box } from '@mui/material';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const token = useAuthStore((s) => s.token);
  useCurrentUser();

  return (
    <>
      {token && <Navbar />}
      <GlobalSnackbar />
      <Box component="main" sx={{ pt: token ? 8 : 0 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/send" element={<ProtectedRoute><Navigate to="/" state={{ openComposer: true }} replace /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </Box>
    </>
  );
}
