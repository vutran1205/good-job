import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  Avatar,
  IconButton,
  TextField,
  Collapse,
  Stack,
  Divider,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import { useState } from 'react';
import { api } from '../lib/api';
import { CORE_VALUE_META } from '../theme';

interface Media { id: string; type: string; url: string; status: string }
interface UserRef { id: string; name: string }
interface Reaction { id: string; emoji: string; user: UserRef }
interface Comment { id: string; text?: string; mediaUrl?: string; user: UserRef; createdAt: string }

interface KudoCardProps {
  kudo: {
    id: string;
    points: number;
    description: string;
    tag: string;
    createdAt: string;
    sender: UserRef;
    recipient: UserRef;
    media: Media[];
    reactions: Reaction[];
    comments: Comment[];
  };
}

const QUICK_EMOJIS = ['👏', '🔥', '💪', '❤️', '🚀'];

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

export function KudoCard({ kudo }: KudoCardProps) {
  const theme = useTheme();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [reactions, setReactions] = useState<Reaction[]>(kudo.reactions);
  const [comments, setComments] = useState<Comment[]>(kudo.comments);

  const tagMeta = CORE_VALUE_META[kudo.tag] ?? { color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.12) };

  async function addReaction(emoji: string) {
    const { data } = await api.post(`/api/kudos/${kudo.id}/reactions`, { emoji });
    setReactions((prev) => [...prev.filter((r) => r.id !== data.id), data]);
  }

  async function addComment() {
    if (!commentText.trim()) return;
    const { data } = await api.post(`/api/kudos/${kudo.id}/comments`, { text: commentText });
    setComments((prev) => [...prev, data]);
    setCommentText('');
  }

  const reactionCounts = reactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

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
          left: 0, top: 0, bottom: 0,
          width: 4,
          backgroundColor: tagMeta.color,
          borderRadius: '16px 0 0 16px',
        },
      }}
    >
      <CardContent sx={{ pl: 3 }}>
        {/* Header: Avatar + sender→recipient + timestamp + tag */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
          <Avatar sx={{ width: 40, height: 40, fontSize: 16, flexShrink: 0 }}>
            {kudo.sender.name[0].toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ lineHeight: 1.4 }}>
              <Box component="span" sx={{ fontWeight: 700 }}>{kudo.sender.name}</Box>
              <Box component="span" sx={{ color: 'text.secondary', mx: 0.5, fontWeight: 400 }}>gave kudos to</Box>
              <Box component="span" sx={{ fontWeight: 700 }}>{kudo.recipient.name}</Box>
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
            <Box key={m.id} component="img" src={m.url} sx={{ mt: 1, maxWidth: '100%', borderRadius: 2 }} />
          ) : m.status === 'ready' ? (
            <Box key={m.id} component="video" src={m.url} controls sx={{ mt: 1, maxWidth: '100%', borderRadius: 2 }} />
          ) : (
            <Box key={m.id} sx={(theme) => ({
              mt: 1, p: 2, borderRadius: 2,
              bgcolor: alpha(theme.palette.warning.main, 0.08),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
            })}>
              <Typography variant="caption" color="warning.main">⏳ Video is processing...</Typography>
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

      {/* Reactions + comments toggle */}
      <CardActions sx={{ flexWrap: 'wrap', gap: 0.5, px: 2, pb: 1.5, pt: 0 }}>
        {QUICK_EMOJIS.map((emoji) => {
          const count = reactionCounts[emoji] ?? 0;
          return (
            <Box
              key={emoji}
              component="button"
              type="button"
              onClick={() => addReaction(emoji)}
              sx={(theme) => ({
                display: 'inline-flex', alignItems: 'center', gap: 0.5,
                border: '1.5px solid',
                borderColor: count > 0 ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.2),
                bgcolor: count > 0 ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                borderRadius: '20px', px: 1.25, py: 0.375,
                cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit',
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
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>
                  {count}
                </Typography>
              )}
            </Box>
          );
        })}

        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          <IconButton
            size="small"
            onClick={() => setShowComments((v) => !v)}
            sx={(theme) => ({
              color: showComments ? 'primary.main' : 'text.secondary',
              bgcolor: showComments ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
              borderRadius: 2,
              gap: 0.5,
            })}
          >
            <ChatBubbleOutlineIcon fontSize="small" />
            {comments.length > 0 && (
              <Typography variant="caption" sx={{ fontWeight: 600 }}>{comments.length}</Typography>
            )}
          </IconButton>
        </Box>
      </CardActions>

      {/* Comments section */}
      <Collapse in={showComments}>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Stack spacing={1.5} sx={{ mb: 1.5 }}>
            {comments.map((c) => (
              <Box key={c.id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 12, flexShrink: 0 }}>
                  {c.user.name[0].toUpperCase()}
                </Avatar>
                <Box sx={(theme) => ({
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                  borderRadius: '0 10px 10px 10px',
                  px: 1.5, py: 0.75, flex: 1,
                })}>
                  <Typography variant="caption" fontWeight={700} color="text.primary">
                    {c.user.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.25 }}>{c.text}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>

          {/* Comment input */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && addComment()}
            />
            <IconButton
              color="primary"
              size="small"
              onClick={addComment}
              disabled={!commentText.trim()}
              sx={(theme) => ({
                bgcolor: commentText.trim() ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
              })}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Collapse>
    </Card>
  );
}
