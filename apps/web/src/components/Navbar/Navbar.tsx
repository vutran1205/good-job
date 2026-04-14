import { AppBar, Toolbar, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { NavBrand } from './NavBrand';
import { NavTabs } from './NavTabs';
import { PointsBadges } from './PointsBadges';
import { ProfileButtonDesktop } from './ProfileButtonDesktop';
import { MobileMenu } from './MobileMenu';
import axios from 'axios';

export function Navbar() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  async function handleLogout() {
    await axios.post('/api/auth/logout', null, { withCredentials: true }).catch(() => {});
    logout();
    navigate('/login');
  }

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ minHeight: { xs: 56, sm: 60 }, px: { xs: 1.5, sm: 3 } }}>
        <NavBrand />
        <NavTabs />
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <PointsBadges />
          <ProfileButtonDesktop onLogout={handleLogout} />
          <MobileMenu onLogout={handleLogout} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
