import {
  Container, Typography, Paper, Box, Chip, Divider,
  List, ListItem, ListItemText, CircularProgress, Avatar,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface LedgerEntry {
  id: string;
  delta: number;
  reason: string;
  createdAt: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  receivedBalance: number;
  givingBudget: { remaining: number; month: string } | null;
}

export function Profile() {
  const { data: profile, isLoading: loadingProfile } = useQuery<Profile>({
    queryKey: ['me'],
    queryFn: async () => (await api.get('/api/users/me')).data,
  });

  const { data: ledger = [], isLoading: loadingLedger } = useQuery<LedgerEntry[]>({
    queryKey: ['ledger'],
    queryFn: async () => (await api.get('/api/users/ledger')).data,
  });

  if (loadingProfile) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 8 }} />;

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>My Profile</Typography>

      {/* Banner + Avatar */}
      <Box sx={{ position: 'relative', mb: 8 }}>
        <Box sx={{
          height: 100,
          background: 'linear-gradient(135deg, #6c47ff 0%, #8b6dff 100%)',
          borderRadius: 3,
        }} />
        <Avatar sx={{
          width: 72, height: 72, fontSize: 28,
          backgroundColor: '#fff', color: 'primary.main', fontWeight: 700,
          border: '4px solid #fff',
          position: 'absolute', bottom: -44, left: 24,
          boxShadow: 3,
        }}>
          {profile?.name?.[0]?.toUpperCase()}
        </Avatar>
      </Box>

      <Box sx={{ px: 1, mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>{profile?.name}</Typography>
        <Typography variant="body2" color="text.secondary">{profile?.email}</Typography>
      </Box>

      {/* Stat cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Paper sx={{
          flex: 1, p: 2.5, textAlign: 'center',
          background: `linear-gradient(135deg, ${alpha('#6c47ff', 0.08)} 0%, ${alpha('#6c47ff', 0.02)} 100%)`,
          border: `1px solid ${alpha('#6c47ff', 0.12)}`,
        }}>
          <EmojiEventsIcon sx={{ color: 'primary.main', mb: 0.5 }} />
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {profile?.receivedBalance ?? 0}
          </Typography>
          <Typography variant="caption" color="text.secondary">Points Received</Typography>
        </Paper>

        {profile?.givingBudget && (
          <Paper sx={{
            flex: 1, p: 2.5, textAlign: 'center',
            background: `linear-gradient(135deg, ${alpha('#ff6b6b', 0.08)} 0%, ${alpha('#ff6b6b', 0.02)} 100%)`,
            border: `1px solid ${alpha('#ff6b6b', 0.12)}`,
          }}>
            <CardGiftcardIcon sx={{ color: 'secondary.main', mb: 0.5 }} />
            <Typography variant="h4" fontWeight={700} color="secondary.main">
              {profile.givingBudget.remaining}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Giving Budget Left
            </Typography>
          </Paper>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Point History */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>Point History</Typography>
      <Paper>
        {loadingLedger ? (
          <CircularProgress sx={{ display: 'block', mx: 'auto', my: 3 }} />
        ) : (
          <List dense disablePadding>
            {ledger.map((entry, idx) => (
              <ListItem
                key={entry.id}
                divider={idx < ledger.length - 1}
                sx={{ gap: 1.5, py: 1.5 }}
              >
                <Box sx={{
                  width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                  bgcolor: entry.delta > 0 ? alpha('#22c55e', 0.12) : alpha('#ef4444', 0.12),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {entry.delta > 0
                    ? <TrendingUpIcon sx={{ fontSize: 18, color: 'success.main' }} />
                    : <TrendingDownIcon sx={{ fontSize: 18, color: 'error.main' }} />
                  }
                </Box>
                <ListItemText
                  primary={entry.reason.replace(/_/g, ' ')}
                  secondary={new Date(entry.createdAt).toLocaleString()}
                  primaryTypographyProps={{ fontWeight: 500, variant: 'body2', color: 'text.primary' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <Chip
                  label={entry.delta > 0 ? `+${entry.delta}` : String(entry.delta)}
                  color={entry.delta > 0 ? 'success' : 'error'}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </ListItem>
            ))}
            {ledger.length === 0 && (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">No transactions yet</Typography>
              </Box>
            )}
          </List>
        )}
      </Paper>
    </Container>
  );
}
