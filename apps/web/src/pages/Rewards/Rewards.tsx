import { Container, Typography, Grid, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useNotificationStore } from '../../store/notification.store';
import { useAuthStore } from '../../store/auth.store';
import { RewardCard, type RewardItem } from './components/RewardCard';

export function Rewards() {
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((s) => s.show);
  const balance = useAuthStore((s) => s.user?.receivedBalance ?? 0);

  const { data: rewards = [], isLoading } = useQuery<RewardItem[]>({
    queryKey: ['rewards'],
    queryFn: async () => (await api.get('/api/rewards')).data,
  });

  async function handleRedeem(rewardId: string) {
    setRedeeming(rewardId);
    try {
      await api.post(`/api/rewards/${rewardId}/redeem`, {});
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      showNotification('🎁 Redeemed successfully!', 'success');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Redemption failed';
      showNotification(typeof msg === 'string' ? msg : 'Redemption failed', 'error');
    } finally {
      setRedeeming(null);
    }
  }

  if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 8 }} />;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Reward Catalog
      </Typography>
      <Grid container spacing={2}>
        {rewards.map((reward) => (
          <Grid item xs={12} sm={6} md={4} key={reward.id}>
            <RewardCard
              reward={reward}
              balance={balance}
              isRedeeming={redeeming === reward.id}
              onRedeem={handleRedeem}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
