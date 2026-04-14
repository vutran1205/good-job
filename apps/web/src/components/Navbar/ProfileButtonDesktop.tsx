import {
  Avatar,
  Box,
  ListItemIcon,
  Menu,
  MenuItem,
  Skeleton,
  Typography,
  ButtonBase,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { PROFILE_ITEM } from './constants';

interface Props {
  onLogout: () => Promise<void>;
}

export function ProfileButtonDesktop({ onLogout }: Props) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(anchor);
  const isActive = pathname === PROFILE_ITEM.path || open;
  const profileActive = pathname === PROFILE_ITEM.path;

  function close() {
    setAnchor(null);
  }

  if (!user) {
    return (
      <Skeleton
        variant="rounded"
        width={130}
        height={44}
        sx={{ display: { xs: 'none', sm: 'flex' }, borderRadius: 1 }}
      />
    );
  }

  return (
    <>
      <ButtonBase
        onClick={(e) => setAnchor(open ? null : e.currentTarget)}
        sx={(theme) => ({
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.625,
          border: '1.5px solid',
          borderColor: isActive
            ? alpha(theme.palette.primary.main, 0.4)
            : alpha(theme.palette.primary.main, 0.15),
          borderRadius: 1,
          bgcolor: isActive ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
          transition: 'all 0.15s ease',
        })}
      >
        <Typography component="p" align="right">
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Hello,
          </Typography>
          <Typography variant="body2" fontWeight={700} color="text.primary">
            {user.name}
          </Typography>
        </Typography>
        <Avatar sx={{ width: 40, height: 40, fontSize: 16, flexShrink: 0 }}>
          {user.name[0].toUpperCase()}
        </Avatar>
      </ButtonBase>

      <Menu
        anchorEl={anchor}
        open={open}
        onClose={close}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { elevation: 0 } }}
      >
        <MenuItem
          onClick={() => {
            close();
            navigate(PROFILE_ITEM.path);
          }}
          selected={profileActive}
          sx={(theme) => ({
            gap: 1.5,
            px: 2.5,
            py: 1.25,
            color: profileActive ? 'primary.main' : 'text.primary',
            '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
            '&.Mui-selected:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
          })}
        >
          <ListItemIcon
            sx={{ minWidth: 'unset', color: profileActive ? 'primary.main' : 'text.secondary' }}
          >
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" fontWeight={profileActive ? 700 : 500}>
            My Profile
          </Typography>
          {profileActive && (
            <Box
              sx={{
                ml: 'auto',
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                flexShrink: 0,
              }}
            />
          )}
        </MenuItem>
        <MenuItem
          onClick={() => {
            close();
            onLogout();
          }}
          sx={{ gap: 1.5, px: 2.5, py: 1.25, color: 'error.main' }}
        >
          <ListItemIcon sx={{ minWidth: 'unset', color: 'error.main' }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" fontWeight={500}>
            Logout
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
