import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Fade,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useKudosFeed } from '../../hooks/useKudosFeed';
import { useAuthStore } from '../../store/auth.store';
import { KudoCard } from './components/KudoCard/KudoCard';
import { KudoCardSkeleton } from './components/KudoCardSkeleton';
import { KudoComposerDialog } from './components/KudoComposerDialog/KudoComposerDialog';

export function Feed() {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useKudosFeed();
  const currentUser = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [composerOpen, setComposerOpen] = useState(false);

  useEffect(() => {
    if ((location.state as { openComposer?: boolean } | null)?.openComposer) {
      setComposerOpen(true);
      navigate('/', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const kudos = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Kudos Feed
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Celebrating wins across the team
          </Typography>
        </Box>
      </Box>

      {/* Compose trigger */}
      <Card onClick={() => setComposerOpen(true)} sx={{ mb: 3, cursor: 'pointer' }}>
        <CardContent sx={{ py: '12px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Avatar sx={{ width: 40, height: 40, fontSize: 16 }}>
              {currentUser?.name?.[0]?.toUpperCase() ?? '?'}
            </Avatar>
            <Box
              sx={(theme) => ({
                flex: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                borderRadius: 5,
                px: 2,
                py: 1,
                cursor: 'text',
              })}
            >
              <Typography variant="body2" color="text.secondary">
                Who do you want to recognize today?
              </Typography>
            </Box>
          </Box>

          <Box
            sx={(theme) => ({
              display: 'flex',
              gap: 1,
              borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
              pt: 1.5,
              mt: 0.5,
            })}
          >
            <Button
              size="small"
              startIcon={<span style={{ fontSize: 16 }}>📷</span>}
              sx={{ flex: 1, color: 'text.secondary', justifyContent: 'center' }}
              onClick={(e) => {
                e.stopPropagation();
                setComposerOpen(true);
              }}
            >
              Photo/Video
            </Button>
            <Button
              size="small"
              startIcon={<span style={{ fontSize: 16 }}>🏷️</span>}
              sx={{ flex: 1, color: 'text.secondary', justifyContent: 'center' }}
              onClick={(e) => {
                e.stopPropagation();
                setComposerOpen(true);
              }}
            >
              Core Value
            </Button>
            <Button
              size="small"
              startIcon={<AddReactionIcon sx={{ fontSize: 16 }} />}
              sx={{ flex: 1, color: 'text.secondary', justifyContent: 'center' }}
              onClick={(e) => {
                e.stopPropagation();
                setComposerOpen(true);
              }}
            >
              Give Kudos
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Loading skeletons */}
      {isLoading && Array.from({ length: 3 }).map((_, i) => <KudoCardSkeleton key={i} />)}

      {/* Kudo cards */}
      {kudos.map((kudo, index) => (
        <Fade
          key={kudo.id}
          in
          timeout={300}
          style={{ transitionDelay: `${Math.min(index * 50, 300)}ms` }}
        >
          <div>
            <KudoCard kudo={kudo} />
          </div>
        </Fade>
      ))}

      {/* Load more */}
      {hasNextPage && (
        <Box sx={{ textAlign: 'center', mt: 3, mb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            startIcon={isFetchingNextPage ? <CircularProgress size={16} /> : undefined}
            sx={{ borderRadius: '20px', px: 4 }}
          >
            {isFetchingNextPage ? 'Loading...' : 'Load more kudos'}
          </Button>
        </Box>
      )}

      {/* Empty state */}
      {!isLoading && kudos.length === 0 && (
        <Fade in timeout={400}>
          <Box
            sx={{
              textAlign: 'center',
              py: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={(theme) => ({
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <EmojiEventsIcon sx={{ fontSize: 40, color: 'primary.contrastText' }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              No kudos yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280 }}>
              Be the first to recognize a teammate.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddReactionIcon />}
              onClick={() => setComposerOpen(true)}
            >
              Send the first kudo
            </Button>
          </Box>
        </Fade>
      )}

      <KudoComposerDialog open={composerOpen} onClose={() => setComposerOpen(false)} />
    </Container>
  );
}
