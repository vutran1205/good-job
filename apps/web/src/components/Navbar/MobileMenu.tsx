import {
  Box,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Skeleton,
  Typography,
  ButtonBase,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { UserInfoBlock } from './UserInfoBlock';
import { NAV_ITEMS, PROFILE_ITEM } from './constants';

function ProfileMenuItem({ active, onNavigate }: { active: boolean; onNavigate: () => void }) {
  return (
    <MenuItem
      onClick={onNavigate}
      selected={active}
      sx={(theme) => ({
        gap: 1.5,
        py: 1.25,
        color: active ? 'primary.main' : 'text.primary',
        '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
        '&.Mui-selected:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
      })}
    >
      <ListItemIcon sx={{ minWidth: 'unset', color: active ? 'primary.main' : 'text.secondary' }}>
        {PROFILE_ITEM.icon}
      </ListItemIcon>
      <Typography variant="body2" fontWeight={active ? 700 : 500}>
        {PROFILE_ITEM.label}
      </Typography>
      {active && (
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
  );
}

interface Props {
  onLogout: () => Promise<void>;
}

export function MobileMenu({ onLogout }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(anchor);

  function close() {
    setAnchor(null);
  }

  if (!user) {
    return (
      <Skeleton
        variant="rounded"
        width={38}
        height={38}
        sx={{ display: { xs: 'flex', sm: 'none' }, borderRadius: 2 }}
      />
    );
  }

  return (
    <>
      <ButtonBase
        onClick={(e) => setAnchor(open ? null : e.currentTarget)}
        sx={(theme) => ({
          display: { xs: 'flex', sm: 'none' },
          alignItems: 'center',
          justifyContent: 'center',
          width: 38,
          height: 38,
          borderRadius: 2,
          color: open ? 'primary.main' : 'text.secondary',
          bgcolor: open ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.06),
            color: 'primary.main',
          },
        })}
      >
        <Box
          sx={{
            display: 'flex',
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(90deg)' : 'none',
          }}
        >
          {open ? <CloseIcon sx={{ fontSize: 20 }} /> : <MenuIcon sx={{ fontSize: 20 }} />}
        </Box>
      </ButtonBase>

      <Menu
        anchorEl={anchor}
        open={open}
        onClose={close}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { elevation: 0 } }}
      >
        <UserInfoBlock avatarSize={40} />

        <Divider />

        {NAV_ITEMS.map(({ path, label, icon }) => {
          const active = pathname === path;
          return (
            <MenuItem
              key={path}
              onClick={() => {
                close();
                navigate(path);
              }}
              selected={active}
              sx={(theme) => ({
                gap: 1.5,
                py: 1.25,
                color: active ? 'primary.main' : 'text.primary',
                '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                '&.Mui-selected:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
              })}
            >
              <ListItemIcon
                sx={{ minWidth: 'unset', color: active ? 'primary.main' : 'text.secondary' }}
              >
                {icon}
              </ListItemIcon>
              <Typography variant="body2" fontWeight={active ? 700 : 500}>
                {label}
              </Typography>
              {active && (
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
          );
        })}

        <Divider />

        <ProfileMenuItem
          active={pathname === PROFILE_ITEM.path}
          onNavigate={() => {
            close();
            navigate(PROFILE_ITEM.path);
          }}
        />

        <MenuItem
          onClick={() => {
            close();
            onLogout();
          }}
          sx={{ gap: 1.5, py: 1.25, color: 'error.main' }}
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
