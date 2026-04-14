import { Box, Card, CardContent, Skeleton } from '@mui/material';

export function KudoCardSkeleton() {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="55%" height={18} />
            <Skeleton width="25%" height={14} sx={{ mt: 0.5 }} />
          </Box>
          <Skeleton width={80} height={24} sx={{ borderRadius: 1 }} />
        </Box>
        <Skeleton width="100%" height={16} />
        <Skeleton width="88%" height={16} sx={{ mt: 0.75 }} />
        <Skeleton width="72%" height={16} sx={{ mt: 0.75 }} />
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} width={44} height={28} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
