import {
  Box, Container, Typography, Button, CircularProgress,
  Skeleton, Card, CardContent, Avatar, Fade,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useKudosFeed } from '../hooks/useKudosFeed';
import { KudoCard } from '../components/KudoCard';
import { KudoComposerDialog } from '../components/KudoComposerDialog';
import { useAuthStore } from '../store/auth.store';

function KudoCardSkeleton() {
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

export function Feed() {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useKudosFeed();
  const currentUser = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [composerOpen, setComposerOpen] = useState(false);

  // Auto-open composer if navigated here with state flag
  useEffect(() => {
    if ((location.state as { openComposer?: boolean } | null)?.openComposer) {
      setComposerOpen(true);
      // Clear the state so refresh doesn't re-open
      navigate('/', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const kudos = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Kudos Feed</Typography>
          <Typography variant="body2" color="text.secondary">
            Celebrating wins across the team
          </Typography>
        </Box>
      </Box>

      {/* Facebook-style compose trigger */}
      <Card
        onClick={() => setComposerOpen(true)}
        sx={{
          mb: 3, cursor: 'pointer',
          '&:hover': { transform: 'translateY(-2px)' },
        }}
      >
        <CardContent sx={{ py: '12px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Avatar sx={{ width: 40, height: 40, fontSize: 16 }}>
              {currentUser?.name?.[0]?.toUpperCase() ?? '?'}
            </Avatar>
            <Box
              sx={{
                flex: 1,
                bgcolor: alpha('#6c47ff', 0.05),
                border: `1px solid ${alpha('#6c47ff', 0.15)}`,
                borderRadius: 5,
                px: 2, py: 1,
                cursor: 'text',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Who do you want to recognize today?
              </Typography>
            </Box>
          </Box>

          {/* Quick action buttons */}
          <Box sx={{
            display: 'flex', gap: 1,
            borderTop: `1px solid ${alpha('#6c47ff', 0.08)}`,
            pt: 1.5, mt: 0.5,
          }}>
            <Button
              size="small"
              startIcon={<span style={{ fontSize: 16 }}>📷</span>}
              sx={{ flex: 1, color: 'text.secondary', justifyContent: 'center' }}
              onClick={(e) => { e.stopPropagation(); setComposerOpen(true); }}
            >
              Photo/Video
            </Button>
            <Button
              size="small"
              startIcon={<span style={{ fontSize: 16 }}>🏷️</span>}
              sx={{ flex: 1, color: 'text.secondary', justifyContent: 'center' }}
              onClick={(e) => { e.stopPropagation(); setComposerOpen(true); }}
            >
              Core Value
            </Button>
            <Button
              size="small"
              startIcon={<AddReactionIcon sx={{ fontSize: 16 }} />}
              sx={{ flex: 1, color: 'text.secondary', justifyContent: 'center' }}
              onClick={(e) => { e.stopPropagation(); setComposerOpen(true); }}
            >
              Give Kudos
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Loading skeletons */}
      {isLoading && (
        <>
          {Array.from({ length: 3 }).map((_, i) => (
            <KudoCardSkeleton key={i} />
          ))}
        </>
      )}

      {/* Kudo cards with staggered fade-in */}
      {kudos.map((kudo, index) => (
        <Fade
          key={kudo.id}
          in={true}
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
          <Box sx={{
            textAlign: 'center', py: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}>
            <Box sx={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6c47ff 0%, #8b6dff 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <EmojiEventsIcon sx={{ fontSize: 40, color: '#fff' }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>No kudos yet</Typography>
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

      {/* Composer Dialog */}
      <KudoComposerDialog open={composerOpen} onClose={() => setComposerOpen(false)} />
    </Container>
  );
}
