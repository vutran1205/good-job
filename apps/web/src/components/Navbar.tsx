import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ButtonBase,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import axios from 'axios';

const NAV_ITEMS = [
  { path: '/',        label: 'Feed',    icon: <AddReactionIcon fontSize="small" /> },
  { path: '/rewards', label: 'Rewards', icon: <CardGiftcardIcon fontSize="small" /> },
];

export function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();

  const [navAnchor, setNavAnchor]     = useState<null | HTMLElement>(null);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const navOpen     = Boolean(navAnchor);
  const profileOpen = Boolean(profileAnchor);

  function closeAll() {
    setNavAnchor(null);
    setProfileAnchor(null);
  }

  async function handleLogout() {
    closeAll();
    await axios.post('/api/auth/logout', null, { withCredentials: true }).catch(() => {});
    logout();
    navigate('/login');
  }

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ minHeight: { xs: 56, sm: 60 }, px: { xs: 1.5, sm: 3 }, gap: 1 }}>

        {/* ── Left: Brand ──────────────────────────────────── */}
        <Box
          onClick={() => navigate('/')}
          sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', userSelect: 'none' }}
        >
          <Box sx={{
            width: 30, height: 30, borderRadius: 1.5, flexShrink: 0,
            background: 'linear-gradient(135deg, #6c47ff 0%, #8b6dff 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <EmojiEventsIcon sx={{ fontSize: 18, color: '#fff' }} />
          </Box>
          <Typography
            variant="subtitle1" fontWeight={700}
            sx={{ letterSpacing: '-0.4px', color: 'text.primary', display: { xs: 'none', sm: 'block' } }}
          >
            Good Job
          </Typography>
        </Box>

        {/* ── Right: Profile card + Hamburger ─────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Profile card */}
          {user && (
            <ButtonBase
              onClick={(e) => setProfileAnchor(profileOpen ? null : e.currentTarget)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                px: 0.75, py: 0.625,
                border: '1.5px solid',
                borderColor: profileOpen ? alpha('#6c47ff', 0.4) : alpha('#6c47ff', 0.15),
                borderRadius: 3,
                bgcolor: profileOpen ? alpha('#6c47ff', 0.06) : 'transparent',
                transition: 'all 0.15s ease',
                '&:hover': { borderColor: alpha('#6c47ff', 0.35), bgcolor: alpha('#6c47ff', 0.05) },
              }}
            >
              <Avatar sx={{ width: 30, height: 30, fontSize: 12, flexShrink: 0 }}>
                {user.name[0].toUpperCase()}
              </Avatar>

              {/* Name + points (sm+) */}
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography component="span" sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
                  {user.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.25 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.375, bgcolor: alpha('#6c47ff', 0.1), borderRadius: 0.75, px: 0.625, py: 0.125 }}>
                    <EmojiEventsOutlinedIcon sx={{ fontSize: 10, color: '#6c47ff' }} />
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#6c47ff', lineHeight: 1 }}>
                      {user.receivedBalance ?? 0}
                    </Typography>
                  </Box>
                  {user.givingBudget && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.375, bgcolor: alpha('#ff6b6b', 0.1), borderRadius: 0.75, px: 0.625, py: 0.125 }}>
                      <CardGiftcardIcon sx={{ fontSize: 10, color: '#e04545' }} />
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#e04545', lineHeight: 1 }}>
                        {user.givingBudget.remaining}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </ButtonBase>
          )}

          {/* Hamburger button */}
          <ButtonBase
            onClick={(e) => setNavAnchor(navOpen ? null : e.currentTarget)}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 38, height: 38, borderRadius: 2,
              color: navOpen ? 'primary.main' : 'text.secondary',
              bgcolor: navOpen ? alpha('#6c47ff', 0.08) : 'transparent',
              transition: 'all 0.15s ease',
              '&:hover': { bgcolor: alpha('#6c47ff', 0.06), color: 'primary.main' },
            }}
          >
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.2s ease',
              transform: navOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            }}>
              {navOpen
                ? <CloseIcon sx={{ fontSize: 20 }} />
                : <MenuIcon sx={{ fontSize: 20 }} />
              }
            </Box>
          </ButtonBase>
        </Box>
      </Toolbar>

      {/* ── Hamburger nav dropdown ───────────────────────────── */}
      <Menu
        anchorEl={navAnchor}
        open={navOpen}
        onClose={() => setNavAnchor(null)}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1, minWidth: 180,
              border: `1px solid ${alpha('#6c47ff', 0.1)}`,
              boxShadow: '0 8px 32px rgba(108,71,255,0.12)',
              borderRadius: 2,
              overflow: 'visible',
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: -6, left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: 12, height: 12,
                backgroundColor: '#fff',
                border: `1px solid ${alpha('#6c47ff', 0.1)}`,
                borderBottom: 'none', borderRight: 'none',
              },
            },
          },
        }}
      >
        {NAV_ITEMS.map(({ path, label, icon }) => {
          const active = pathname === path;
          return (
            <MenuItem
              key={path}
              onClick={() => { setNavAnchor(null); navigate(path); }}
              selected={active}
              sx={{
                gap: 1.5, py: 1.25,
                color: active ? 'primary.main' : 'text.primary',
                '&.Mui-selected': { bgcolor: alpha('#6c47ff', 0.06) },
                '&.Mui-selected:hover': { bgcolor: alpha('#6c47ff', 0.1) },
              }}
            >
              <ListItemIcon sx={{ minWidth: 'unset', color: active ? 'primary.main' : 'text.secondary' }}>
                {icon}
              </ListItemIcon>
              <Typography variant="body2" fontWeight={active ? 700 : 500}>
                {label}
              </Typography>
              {active && (
                <Box sx={{
                  ml: 'auto', width: 6, height: 6, borderRadius: '50%',
                  bgcolor: 'primary.main', flexShrink: 0,
                }} />
              )}
            </MenuItem>
          );
        })}
      </Menu>

      {/* ── Profile dropdown ─────────────────────────────────── */}
      <Menu
        anchorEl={profileAnchor}
        open={profileOpen}
        onClose={() => setProfileAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1, minWidth: 210,
              border: `1px solid ${alpha('#6c47ff', 0.1)}`,
              boxShadow: '0 8px 32px rgba(108,71,255,0.12)',
              borderRadius: 2,
              overflow: 'visible',
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: -6, right: 18,
                width: 12, height: 12,
                backgroundColor: '#fff',
                border: `1px solid ${alpha('#6c47ff', 0.1)}`,
                borderBottom: 'none', borderRight: 'none',
                transform: 'rotate(45deg)',
              },
            },
          },
        }}
      >
        {/* User info */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" fontWeight={700} color="text.primary">{user?.name}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {user?.email ?? ''}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box sx={{ flex: 1, textAlign: 'center', py: 0.75, borderRadius: 1.5, bgcolor: alpha('#6c47ff', 0.07), border: `1px solid ${alpha('#6c47ff', 0.1)}` }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6c47ff', lineHeight: 1 }}>
                {user?.receivedBalance ?? 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>received</Typography>
            </Box>
            {user?.givingBudget && (
              <Box sx={{ flex: 1, textAlign: 'center', py: 0.75, borderRadius: 1.5, bgcolor: alpha('#ff6b6b', 0.07), border: `1px solid ${alpha('#ff6b6b', 0.1)}` }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#e04545', lineHeight: 1 }}>
                  {user.givingBudget.remaining}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>to give</Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Divider />

        <MenuItem onClick={() => { closeAll(); navigate('/profile'); }} sx={{ gap: 1.5, py: 1.25 }}>
          <ListItemIcon sx={{ minWidth: 'unset' }}>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" fontWeight={500}>My Profile</Typography>
        </MenuItem>

        <MenuItem onClick={handleLogout} sx={{ gap: 1.5, py: 1.25, color: 'error.main' }}>
          <ListItemIcon sx={{ minWidth: 'unset', color: 'error.main' }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" fontWeight={500}>Logout</Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
