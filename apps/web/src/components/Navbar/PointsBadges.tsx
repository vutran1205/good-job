import { Box, Typography, Skeleton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useAuthStore } from '../../store/auth.store';

export function PointsBadges() {
  const user = useAuthStore((s) => s.user);

  return (
    <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.75, mr: 1.25 }}>
      {!user ? (
        <>
          <Skeleton variant="rounded" width={58} height={36} sx={{ borderRadius: 1.5 }} />
          <Skeleton variant="rounded" width={58} height={36} sx={{ borderRadius: 1.5 }} />
        </>
      ) : (
        <>
          <Box
            sx={(theme) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              px: 1,
              py: 0.5,
              borderRadius: 1.5,
              minWidth: 52,
              bgcolor: alpha(theme.palette.primary.main, 0.07),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            })}
          >
            <Typography
              variant="caption"
              sx={{ display: 'block', fontWeight: 700, color: 'primary.main', lineHeight: 1.3 }}
            >
              {user.receivedBalance ?? 0}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '0.6rem', lineHeight: 1 }}
            >
              received
            </Typography>
          </Box>
          {user.givingBudget && (
            <Box
              sx={(theme) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                px: 1,
                py: 0.5,
                borderRadius: 1.5,
                minWidth: 52,
                bgcolor: alpha(theme.palette.secondary.main, 0.07),
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
              })}
            >
              <Typography
                variant="caption"
                sx={{ display: 'block', fontWeight: 700, color: 'secondary.dark', lineHeight: 1.3 }}
              >
                {user.givingBudget.remaining}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.6rem', lineHeight: 1 }}
              >
                to give
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
