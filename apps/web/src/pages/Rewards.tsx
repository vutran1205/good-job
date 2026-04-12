import {
  Container, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, CircularProgress, Box,
} from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useNotificationStore } from '../store/notification.store';
import { useAuthStore } from '../store/auth.store';

interface RewardItem {
  id: string;
  name: string;
  pointCost: number;
  description?: string;
  stock: number | null;
}

function rewardEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('coffee')) return '☕';
  if (lower.includes('book')) return '📚';
  if (lower.includes('movie') || lower.includes('cinema')) return '🎬';
  if (lower.includes('food') || lower.includes('meal')) return '🍽️';
  if (lower.includes('voucher') || lower.includes('coupon')) return '🎫';
  if (lower.includes('tech') || lower.includes('gadget')) return '💻';
  if (lower.includes('gift')) return '🎁';
  return '🏆';
}

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
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Reward Catalog</Typography>

      <Grid container spacing={2}>
        {rewards.map((r) => {
          const outOfStock = r.stock !== null && r.stock <= 0;
          const cannotAfford = balance < r.pointCost;
          const isDisabled = outOfStock || cannotAfford || redeeming === r.id;

          return (
            <Grid item xs={12} sm={6} md={4} key={r.id}>
              <Card
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: outOfStock ? 0.6 : 1 }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h3" sx={{ mb: 1, opacity: outOfStock ? 0.4 : 1 }}>
                    {rewardEmoji(r.name)}
                  </Typography>
                  <Typography variant="h6" gutterBottom>{r.name}</Typography>
                  {r.description && (
                    <Typography variant="body2" color="text.secondary">{r.description}</Typography>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    <Chip label={`${r.pointCost} pts`} color={cannotAfford ? 'default' : 'primary'} size="small" />
                    {r.stock !== null && (
                      <Chip
                        label={outOfStock ? 'Out of stock' : `${r.stock} left`}
                        color={outOfStock ? 'error' : r.stock <= 3 ? 'warning' : 'success'}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    disabled={isDisabled}
                    onClick={() => handleRedeem(r.id)}
                    title={cannotAfford ? `Need ${r.pointCost - balance} more pts` : undefined}
                  >
                    {redeeming === r.id ? <CircularProgress size={16} /> : 'Redeem'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
