import {
  Box,
  Typography,
  Avatar,
  TextField,
  IconButton,
  Collapse,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import axios from 'axios';
import { api } from '../../../../lib/api';
import { useAuthStore } from '../../../../store/auth.store';
import { useNotificationStore } from '../../../../store/notification.store';
import type { Comment, Reaction } from './types';

const COMMENT_EMOJIS = ['❤️'];
type CommentReactionToggleResponse = { action: 'added' | 'removed'; reaction: Reaction };

interface Props {
  kudoId: string;
  initialComments: Comment[];
  open: boolean;
  onToggle: () => void;
}

interface SelectedMedia {
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
}

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm)(?:$|[?#])/i.test(url);
}

function getSelectedMediaType(file: File): SelectedMedia['type'] {
  if (file.type.startsWith('video/')) return 'video';
  return /\.(mp4|mov|webm)$/i.test(file.name) ? 'video' : 'image';
}

export function CommentSection({ kudoId, initialComments, open, onToggle }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const showNotification = useNotificationStore((s) => s.show);
  const [commentText, setCommentText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const canSubmit = !!commentText.trim() || !!selectedMedia;

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  useEffect(() => {
    return () => {
      if (selectedMedia?.previewUrl) URL.revokeObjectURL(selectedMedia.previewUrl);
    };
  }, [selectedMedia?.previewUrl]);

  function handleMediaChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validFile =
      file.type.startsWith('image/') ||
      file.type.startsWith('video/') ||
      /\.(jpe?g|png|gif|webp|mp4|mov|webm)$/i.test(file.name);

    if (!validFile) {
      showNotification('Please choose an image or video file', 'error');
      e.target.value = '';
      return;
    }

    setSelectedMedia({
      file,
      previewUrl: URL.createObjectURL(file),
      type: getSelectedMediaType(file),
    });
    e.target.value = '';
  }

  function clearSelectedMedia() {
    setSelectedMedia(null);
  }

  async function addComment() {
    const text = commentText.trim();
    if (!text && !selectedMedia) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (text) formData.append('text', text);
      if (selectedMedia) formData.append('media', selectedMedia.file);

      const { data } = await api.post<Comment>(`/api/kudos/${kudoId}/comments`, formData);
      setComments((prev) => [...prev, data]);
      setCommentText('');
      clearSelectedMedia();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Comment failed';
      showNotification(typeof msg === 'string' ? msg : 'Comment failed', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleCommentReaction(commentId: string, emoji: string) {
    try {
      const { data } = await api.post<CommentReactionToggleResponse>(
        `/api/kudos/comments/${commentId}/reactions`,
        { emoji },
      );

      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id !== commentId) return comment;

          if (data.action === 'removed') {
            return {
              ...comment,
              reactions: (comment.reactions ?? []).filter((r) => r.id !== data.reaction.id),
            };
          }

          return {
            ...comment,
            reactions: [
              ...(comment.reactions ?? []).filter(
                (r) => !(r.user.id === data.reaction.user.id && r.emoji === data.reaction.emoji),
              ),
              data.reaction,
            ],
          };
        }),
      );
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Reaction failed';
      showNotification(typeof msg === 'string' ? msg : 'Reaction failed', 'error');
    }
  }

  return (
    <>
      {/* Toggle button — rendered inside CardActions by parent */}
      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
        <IconButton
          size="small"
          onClick={onToggle}
          sx={(theme) => ({
            color: open ? 'primary.main' : 'text.secondary',
            bgcolor: open ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
            borderRadius: 2,
            gap: 0.5,
          })}
        >
          <ChatBubbleOutlineIcon fontSize="small" />
          {comments.length > 0 && (
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {comments.length}
            </Typography>
          )}
        </IconButton>
      </Box>

      {/* Collapsible comment list + input */}
      <Collapse in={open} sx={{ width: '100%' }}>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Stack spacing={1.5} sx={{ mb: 1.5 }}>
            {comments.map((c) => (
              <Box key={c.id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 12, flexShrink: 0 }}>
                  {c.user.name[0].toUpperCase()}
                </Avatar>
                <Box
                  sx={(theme) => ({
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                    borderRadius: '0 10px 10px 10px',
                    px: 1.5,
                    py: 0.75,
                    flex: 1,
                  })}
                >
                  <Typography variant="caption" fontWeight={700} color="text.primary">
                    {c.user.name}
                  </Typography>
                  {c.text && (
                    <Typography variant="body2" sx={{ mt: 0.25 }}>
                      {c.text}
                    </Typography>
                  )}
                  {c.mediaUrl &&
                    (isVideoUrl(c.mediaUrl) ? (
                      <Box
                        component="video"
                        src={c.mediaUrl}
                        controls
                        sx={{
                          mt: c.text ? 1 : 0.5,
                          width: '100%',
                          maxHeight: 260,
                          borderRadius: 2,
                          bgcolor: 'common.black',
                        }}
                      />
                    ) : (
                      <Box
                        component="img"
                        src={c.mediaUrl}
                        alt="Comment attachment"
                        sx={{
                          mt: c.text ? 1 : 0.5,
                          maxWidth: '100%',
                          maxHeight: 260,
                          borderRadius: 2,
                          display: 'block',
                        }}
                      />
                    ))}
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                    {COMMENT_EMOJIS.map((emoji) => {
                      const reactions = c.reactions ?? [];
                      const count = reactions.filter((r) => r.emoji === emoji).length;
                      const reactedByMe = reactions.some(
                        (r) => r.emoji === emoji && r.user.id === currentUserId,
                      );

                      return (
                        <Box
                          key={emoji}
                          component="button"
                          type="button"
                          aria-pressed={reactedByMe}
                          onClick={() => void toggleCommentReaction(c.id, emoji)}
                          sx={(theme) => ({
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.35,
                            border: '1px solid',
                            borderColor: reactedByMe
                              ? theme.palette.primary.main
                              : alpha(theme.palette.primary.main, 0.16),
                            bgcolor: reactedByMe
                              ? alpha(theme.palette.primary.main, 0.1)
                              : 'background.paper',
                            borderRadius: 3,
                            px: 0.75,
                            py: 0.125,
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontFamily: 'inherit',
                            lineHeight: 1.4,
                            color: reactedByMe ? 'primary.main' : 'text.secondary',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                            },
                          })}
                        >
                          <span>{emoji}</span>
                          {count > 0 && (
                            <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1 }}>
                              {count}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>

          {selectedMedia && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1,
                p: 1,
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                {selectedMedia.type === 'video' ? (
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: 2,
                      overflow: 'hidden',
                      position: 'relative',
                      bgcolor: 'common.black',
                    }}
                  >
                    <Box
                      component="video"
                      src={selectedMedia.previewUrl}
                      muted
                      playsInline
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0,0,0,0.28)',
                      }}
                    >
                      <PlayArrowIcon sx={{ color: 'common.white', fontSize: 28 }} />
                    </Box>
                  </Box>
                ) : (
                  <Box
                    component="img"
                    src={selectedMedia.previewUrl}
                    alt={selectedMedia.file.name}
                    sx={{
                      width: 72,
                      height: 72,
                      objectFit: 'cover',
                      borderRadius: 2,
                      display: 'block',
                    }}
                  />
                )}
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="caption" fontWeight={700} color="text.primary" noWrap>
                  {selectedMedia.file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {selectedMedia.type === 'video' ? 'Video' : 'Image'}
                </Typography>
              </Box>
              <IconButton size="small" onClick={clearSelectedMedia} disabled={submitting}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <input
              ref={fileInputRef}
              hidden
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
            />
            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={submitting}
              sx={(theme) => ({
                bgcolor: selectedMedia ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                color: selectedMedia ? 'primary.main' : 'text.secondary',
              })}
            >
              <AttachFileIcon fontSize="small" />
            </IconButton>
            <TextField
              size="small"
              fullWidth
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={submitting}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void addComment();
                }
              }}
            />
            <IconButton
              color="primary"
              size="small"
              onClick={() => void addComment()}
              disabled={!canSubmit || submitting}
              sx={(theme) => ({
                bgcolor: canSubmit ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
              })}
            >
              {submitting ? <CircularProgress size={16} /> : <SendIcon fontSize="small" />}
            </IconButton>
          </Box>
        </Box>
      </Collapse>
    </>
  );
}
