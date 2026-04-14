import { Box, Typography, Avatar } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useAuthStore } from '../../store/auth.store';

interface Props {
  avatarSize?: number;
}

export function UserInfoBlock({ avatarSize = 30 }: Props) {
  const user = useAuthStore((s) => s.user);

  return (
    <Box sx={{ px: 2, py: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: avatarSize > 30 ? 1.25 : 0 }}>
        {avatarSize > 30 && (
          <Avatar
            sx={{
              width: avatarSize,
              height: avatarSize,
              fontSize: avatarSize * 0.4,
              flexShrink: 0,
            }}
          >
            {user?.name[0].toUpperCase()}
          </Avatar>
        )}
        <Box>
          <Typography variant="body2" fontWeight={700} color="text.primary">
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {user?.email ?? ''}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mt: avatarSize > 30 ? 0 : 1 }}>
        <Box
          sx={(theme) => ({
            flex: 1,
            flexDirection: 'column',
            textAlign: 'center',
            py: 0.75,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.primary.main, 0.07),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          })}
        >
          <Typography
            variant="caption"
            sx={{ display: 'block', fontWeight: 700, color: 'primary.main', lineHeight: 1 }}
          >
            {user?.receivedBalance ?? 0}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
            received
          </Typography>
        </Box>
        {user?.givingBudget && (
          <Box
            sx={(theme) => ({
              flex: 1,
              flexDirection: 'column',
              textAlign: 'center',
              py: 0.75,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.secondary.main, 0.07),
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
            })}
          >
            <Typography
              variant="caption"
              sx={{ display: 'block', fontWeight: 700, color: 'secondary.dark', lineHeight: 1 }}
            >
              {user?.givingBudget?.remaining}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              to give
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
