import {
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { rewardEmoji } from '../../../utils/reward';

export interface RewardItem {
  id: string;
  name: string;
  pointCost: number;
  description?: string;
  stock: number | null;
}

interface Props {
  reward: RewardItem;
  balance: number;
  isRedeeming: boolean;
  onRedeem: (id: string) => void;
}

export function RewardCard({ reward, balance, isRedeeming, onRedeem }: Props) {
  const outOfStock = reward.stock !== null && reward.stock <= 0;
  const cannotAfford = balance < reward.pointCost;
  const isDisabled = outOfStock || cannotAfford || isRedeeming;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: outOfStock ? 0.6 : 1,
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h3" sx={{ mb: 1, opacity: outOfStock ? 0.4 : 1 }}>
          {rewardEmoji(reward.name)}
        </Typography>
        <Typography variant="h6" gutterBottom>
          {reward.name}
        </Typography>
        {reward.description && (
          <Typography variant="body2" color="text.secondary">
            {reward.description}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip
            label={`${reward.pointCost} pts`}
            color={cannotAfford ? 'default' : 'primary'}
            size="small"
          />
          {reward.stock !== null && (
            <Chip
              label={outOfStock ? 'Out of stock' : `${reward.stock} left`}
              color={outOfStock ? 'error' : reward.stock <= 3 ? 'warning' : 'success'}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        <Button
          variant="outlined"
          size="small"
          disabled={isDisabled}
          onClick={() => onRedeem(reward.id)}
          title={cannotAfford ? `Need ${reward.pointCost - balance} more pts` : undefined}
        >
          {isRedeeming ? <CircularProgress size={16} /> : 'Redeem'}
        </Button>
      </CardActions>
    </Card>
  );
}
