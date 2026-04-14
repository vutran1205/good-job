import { Card, CardContent, CardActions, Typography, Chip, Box, Avatar } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { CORE_VALUE_META } from '../../../../theme';
import { formatRelativeTime } from '../../../../utils/time';
import { ReactionBar } from './ReactionBar';
import { CommentSection } from './CommentSection';
import type { KudoData } from './types';

interface Props {
  kudo: KudoData;
}

export function KudoCard({ kudo }: Props) {
  const theme = useTheme();
  const [showComments, setShowComments] = useState(false);

  const tagMeta = CORE_VALUE_META[kudo.tag] ?? {
    color: theme.palette.primary.main,
    bg: alpha(theme.palette.primary.main, 0.12),
  };

  return (
    <Card
      sx={{
        mb: 2,
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeSlideUp 0.3s ease both',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: tagMeta.color,
          borderRadius: '16px 0 0 16px',
        },
      }}
    >
      <CardContent sx={{ pl: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
          <Avatar sx={{ width: 40, height: 40, fontSize: 16, flexShrink: 0 }}>
            {kudo.sender.name[0].toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ lineHeight: 1.4 }}>
              <Box component="span" sx={{ fontWeight: 700 }}>
                {kudo.sender.name}
              </Box>
              <Box component="span" sx={{ color: 'text.secondary', mx: 0.5, fontWeight: 400 }}>
                gave kudos to
              </Box>
              <Box component="span" sx={{ fontWeight: 700 }}>
                {kudo.recipient.name}
              </Box>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatRelativeTime(kudo.createdAt)}
            </Typography>
          </Box>
          <Chip
            label={kudo.tag}
            size="small"
            sx={{
              bgcolor: tagMeta.bg,
              color: tagMeta.color,
              fontWeight: 700,
              fontSize: '0.7rem',
              borderRadius: '6px',
              flexShrink: 0,
              border: `1px solid ${alpha(tagMeta.color, 0.2)}`,
            }}
          />
        </Box>

        {/* Description */}
        <Typography variant="body1" sx={{ mb: 1.5, lineHeight: 1.6 }}>
          {kudo.description}
        </Typography>

        {/* Media */}
        {kudo.media.map((m) =>
          m.type === 'image' ? (
            <Box
              key={m.id}
              component="img"
              src={m.url}
              sx={{ mt: 1, maxWidth: '100%', borderRadius: 2 }}
            />
          ) : m.status === 'ready' ? (
            <Box
              key={m.id}
              component="video"
              src={m.url}
              controls
              sx={{ mt: 1, maxWidth: '100%', borderRadius: 2 }}
            />
          ) : (
            <Box
              key={m.id}
              sx={(theme) => ({
                mt: 1,
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.warning.main, 0.08),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              })}
            >
              <Typography variant="caption" color="warning.main">
                ⏳ Video is processing...
              </Typography>
            </Box>
          ),
        )}

        {/* Points badge */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
          <Chip
            label={`+${kudo.points} pts`}
            size="small"
            sx={(theme) => ({
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              color: theme.palette.primary.contrastText,
              fontWeight: 700,
              fontSize: '0.75rem',
            })}
          />
        </Box>
      </CardContent>

      {/* Reactions + comment toggle */}
      <CardActions sx={{ flexWrap: 'wrap', gap: 0.5, px: 2, pb: 1.5, pt: 0 }}>
        <ReactionBar kudoId={kudo.id} initialReactions={kudo.reactions} />
        <CommentSection
          kudoId={kudo.id}
          initialComments={kudo.comments}
          open={showComments}
          onToggle={() => setShowComments((v) => !v)}
        />
      </CardActions>
    </Card>
  );
}
