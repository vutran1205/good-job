import { Box, Typography } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNavigate } from 'react-router-dom';

export function NavBrand() {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate('/')}
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <Box
        sx={(theme) => ({
          width: 30,
          height: 30,
          borderRadius: 1.5,
          flexShrink: 0,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <EmojiEventsIcon sx={{ fontSize: 18, color: 'primary.contrastText' }} />
      </Box>
      <Typography
        variant="subtitle1"
        fontWeight={700}
        sx={{ letterSpacing: '-0.4px', color: 'text.primary' }}
      >
        Good Job
      </Typography>
    </Box>
  );
}
