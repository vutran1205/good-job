import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { useCurrentUser } from './hooks/useCurrentUser';
import { Navbar } from './components/Navbar/Navbar';
import { GlobalSnackbar } from './components/GlobalSnackbar';
import { Feed } from './pages/Feed/Feed';
import { Rewards } from './pages/Rewards/Rewards';
import { Profile } from './pages/Profile/Profile';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import { Box } from '@mui/material';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <Navigate to="/" replace /> : <>{children}</>;
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
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/send"
            element={
              <ProtectedRoute>
                <Navigate to="/" state={{ openComposer: true }} replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rewards"
            element={
              <ProtectedRoute>
                <Rewards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Box>
    </>
  );
}
