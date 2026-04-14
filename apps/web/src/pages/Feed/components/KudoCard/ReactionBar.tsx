import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';
import { useAuthStore } from '../../../../store/auth.store';
import type { Reaction } from './types';

const QUICK_EMOJIS = ['👏', '❤️', '😂', '🔥', '🙌'];
type ReactionToggleResponse = { action: 'added' | 'removed'; reaction: Reaction };

interface Props {
  kudoId: string;
  initialReactions: Reaction[];
}

export function ReactionBar({ kudoId, initialReactions }: Props) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);

  useEffect(() => {
    setReactions(initialReactions);
  }, [initialReactions]);

  async function toggleReaction(emoji: string) {
    const { data } = await api.post<ReactionToggleResponse>(`/api/kudos/${kudoId}/reactions`, {
      emoji,
    });

    if (data.action === 'removed') {
      setReactions((prev) => prev.filter((r) => r.id !== data.reaction.id));
      return;
    }

    setReactions((prev) => [
      ...prev.filter(
        (r) => !(r.user.id === data.reaction.user.id && r.emoji === data.reaction.emoji),
      ),
      data.reaction,
    ]);
  }

  const reactionCounts = reactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      {QUICK_EMOJIS.map((emoji) => {
        const count = reactionCounts[emoji] ?? 0;
        const reactedByMe = reactions.some((r) => r.emoji === emoji && r.user.id === currentUserId);
        return (
          <Box
            key={emoji}
            component="button"
            type="button"
            aria-pressed={reactedByMe}
            onClick={() => void toggleReaction(emoji)}
            sx={(theme) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              border: '1.5px solid',
              borderColor: reactedByMe
                ? theme.palette.primary.main
                : alpha(theme.palette.primary.main, 0.2),
              bgcolor: reactedByMe ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              borderRadius: '20px',
              px: 1.25,
              py: 0.375,
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
              outline: 'none',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderColor: theme.palette.primary.main,
              },
              '&:active': { animation: 'pop 0.2s ease' },
            })}
          >
            <span>{emoji}</span>
            {count > 0 && (
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1 }}
              >
                {count}
              </Typography>
            )}
          </Box>
        );
      })}
    </>
  );
}
