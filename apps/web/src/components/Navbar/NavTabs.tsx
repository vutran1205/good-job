import { Box, Typography, ButtonBase } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from './constants';

export function NavTabs() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.5 }}>
      {NAV_ITEMS.map(({ path, label, icon }) => {
        const active = pathname === path;
        return (
          <ButtonBase
            key={path}
            onClick={() => navigate(path)}
            sx={(theme) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.25,
              px: 2.5,
              py: 0.625,
              borderRadius: 1,
              color: active ? 'primary.main' : 'text.secondary',
              bgcolor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              transition: 'all 0.15s ease',
              '&:hover': {
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.06),
              },
            })}
          >
            <Box sx={{ display: 'flex', color: 'inherit', mb: 0.5 }}>{icon}</Box>
            <Typography
              sx={{
                fontSize: '0.8rem',
                fontWeight: active ? 700 : 500,
                color: 'inherit',
                lineHeight: 1,
              }}
            >
              {label}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
