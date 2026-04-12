import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  TextField,
  Autocomplete,
  Slider,
  IconButton,
  CircularProgress,
  Alert,
  useMediaQuery,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SendIcon from '@mui/icons-material/Send';
import { useState, useRef } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import { CORE_VALUE_META } from '../theme';

interface User { id: string; name: string; email: string }

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FilePreview {
  id: string;
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
}

const SLIDER_MARKS = [10, 20, 30, 40, 50].map((v) => ({ value: v, label: String(v) }));
const MAX_FILES = 3;

export function KudoComposerDialog({ open, onClose }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [recipient, setRecipient] = useState<User | null>(null);
  const [points, setPoints] = useState<number>(20);
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [fileError, setFileError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => (await api.get('/api/users')).data,
    enabled: open,
  });

  // ── File handlers ────────────────────────────────────────────────────────────

  function handleFileAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files ?? []);
    if (!newFiles.length) return;

    const canAdd = MAX_FILES - selectedFiles.length;

    if (canAdd <= 0) {
      setFileError(`Maximum ${MAX_FILES} files. Remove some before adding new ones.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const toAdd = newFiles.slice(0, canAdd);
    const skipped = newFiles.length - toAdd.length;

    const previews: FilePreview[] = toAdd.map((f) => ({
      id: `${Date.now()}-${Math.random()}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
      type: f.type.startsWith('video/') ? 'video' : 'image',
    }));

    setSelectedFiles((prev) => [...prev, ...previews]);
    setFileError(
      skipped > 0
        ? `${skipped} file(s) skipped — exceeded the ${MAX_FILES} file limit.`
        : '',
    );

    // Reset input so same file can be re-selected after removal
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleFileRemove(id: string) {
    setSelectedFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
    setFileError('');
  }

  // ── Dialog lifecycle ─────────────────────────────────────────────────────────

  function handleClose() {
    if (loading) return;
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setRecipient(null);
    setPoints(20);
    setTag('');
    setDescription('');
    setSelectedFiles([]);
    setFileError('');
    setError('');
    onClose();
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!recipient) { setError('Please select a recipient'); return; }
    if (!tag) { setError('Please select a Core Value'); return; }
    if (!description.trim()) { setError('Please write a description'); return; }

    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('recipientId', recipient.id);
      formData.append('points', String(points));
      formData.append('tag', tag);
      formData.append('description', description);
      selectedFiles.forEach(({ file }) => formData.append('media', file));

      await api.post('/api/kudos', formData);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['kudos-feed'] });
      handleClose();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Something went wrong';
      setError(typeof msg === 'string' ? msg : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: fullScreen ? 0 : 3,
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Title */}
      <DialogTitle sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        pb: 1, borderBottom: `1px solid ${alpha('#6c47ff', 0.08)}`,
      }}>
        <Typography variant="h6" fontWeight={700}>Give a Kudo</Typography>
        <IconButton size="small" onClick={handleClose} disabled={loading}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

        {/* Recipient */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 44, height: 44, fontSize: 18, flexShrink: 0 }}>
            {currentUser?.name?.[0]?.toUpperCase() ?? '?'}
          </Avatar>
          <Autocomplete
            sx={{ flex: 1 }}
            options={users}
            getOptionLabel={(u) => `${u.name} (${u.email})`}
            value={recipient}
            onChange={(_, v) => setRecipient(v)}
            renderInput={(params) => (
              <TextField {...params} placeholder="Send to who?" size="small" required />
            )}
          />
        </Box>

        {/* Description */}
        <TextField
          multiline minRows={3} maxRows={8} fullWidth
          placeholder="Share what you want to recognize..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          slotProps={{ htmlInput: { maxLength: 1000 } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '1rem',
              '& fieldset': { borderColor: alpha('#6c47ff', 0.15) },
              '&:hover fieldset': { borderColor: alpha('#6c47ff', 0.3) },
            },
          }}
        />

        {/* Core Value chip picker */}
        <Box>
          <Typography variant="body2" fontWeight={600} gutterBottom color="text.secondary">
            Core Value
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(CORE_VALUE_META).map(([value, meta]) => {
              const selected = tag === value;
              return (
                <Box
                  key={value}
                  component="button"
                  type="button"
                  onClick={() => setTag(value)}
                  sx={{
                    borderRadius: '20px', border: '2px solid',
                    borderColor: selected ? meta.color : alpha(meta.color, 0.3),
                    bgcolor: selected ? meta.bg : 'transparent',
                    px: 2, py: 0.75,
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.15s ease', outline: 'none',
                    '&:hover': { bgcolor: meta.bg, borderColor: meta.color },
                  }}
                >
                  <Typography variant="caption" fontWeight={700} sx={{ color: selected ? meta.color : 'text.secondary' }}>
                    {value}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Points slider */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary">Points to give</Typography>
            <Box sx={{
              px: 2, py: 0.25,
              background: 'linear-gradient(135deg, #6c47ff 0%, #8b6dff 100%)',
              borderRadius: '20px',
              display: 'inline-flex', alignItems: 'baseline', gap: 0.5,
            }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', lineHeight: 1.2 }}>{points}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>pts</Typography>
            </Box>
          </Box>
          <Slider
            value={points}
            onChange={(_, v) => setPoints(v as number)}
            min={10} max={50} step={5}
            marks={SLIDER_MARKS}
            sx={{
              color: '#6c47ff',
              '& .MuiSlider-thumb': { width: 20, height: 20 },
              '& .MuiSlider-markLabel': { fontSize: '0.7rem' },
            }}
          />
        </Box>

        {/* ── Media upload ─────────────────────────────────────── */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              Photos / Videos
              {selectedFiles.length > 0 && (
                <Box component="span" sx={{ ml: 0.75, color: selectedFiles.length >= MAX_FILES ? 'error.main' : 'text.secondary' }}>
                  ({selectedFiles.length}/{MAX_FILES})
                </Box>
              )}
            </Typography>
          </Box>

          {/* Hidden file input — shared by dropzone and "add more" button */}
          <input
            ref={fileInputRef}
            hidden
            multiple
            accept="image/*,video/*"
            type="file"
            onChange={handleFileAdd}
          />

          {/* Thumbnail strip */}
          {selectedFiles.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: fileError ? 0.75 : 0 }}>
              {selectedFiles.map(({ id, previewUrl, type, file }) => (
                <Box
                  key={id}
                  sx={{
                    position: 'relative', width: 90, height: 90, flexShrink: 0,
                    borderRadius: 2, overflow: 'visible',
                  }}
                >
                  {type === 'image' ? (
                    <Box
                      component="img"
                      src={previewUrl}
                      alt={file.name}
                      sx={{
                        width: 90, height: 90,
                        objectFit: 'contain', borderRadius: 2,
                        display: 'block',
                        border: `1.5px solid ${alpha('#1a1033', 0.1)}`,
                      }}
                    />
                  ) : (
                    <Box sx={{
                      width: 90, height: 90, borderRadius: 2, overflow: 'hidden',
                      position: 'relative', bgcolor: '#111',
                      border: `1.5px solid ${alpha('#1a1033', 0.1)}`,
                    }}>
                      <Box
                        component="video"
                        src={previewUrl}
                        muted
                        playsInline
                        sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                      />
                      {/* Play overlay */}
                      <Box sx={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: 'rgba(0,0,0,0.38)',
                        pointerEvents: 'none',
                      }}>
                        <PlayArrowIcon sx={{ color: '#fff', fontSize: 30 }} />
                      </Box>
                    </Box>
                  )}

                  {/* Remove button */}
                  <IconButton
                    size="small"
                    type="button"
                    onClick={() => handleFileRemove(id)}
                    sx={{
                      position: 'absolute', top: -8, right: -8,
                      width: 22, height: 22, p: 0,
                      bgcolor: 'error.main', color: '#fff',
                      border: '2px solid #fff',
                      zIndex: 1,
                      '&:hover': { bgcolor: 'error.dark' },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 12 }} />
                  </IconButton>
                </Box>
              ))}

              {/* Add more button */}
              {selectedFiles.length < MAX_FILES && (
                <Box
                  component="label"
                  sx={{
                    width: 90, height: 90, flexShrink: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 0.25,
                    border: '2px dashed',
                    borderColor: alpha('#1a1033', 0.2),
                    borderRadius: 2,
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: '#6c47ff',
                      bgcolor: alpha('#6c47ff', 0.04),
                    },
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AddIcon sx={{ fontSize: 22, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    Thêm
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Empty dropzone */}
          {selectedFiles.length === 0 && (
            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                border: '2px dashed',
                borderColor: alpha('#1a1033', 0.2),
                borderRadius: 2, p: 2,
                cursor: 'pointer', transition: 'all 0.15s ease',
                '&:hover': { borderColor: '#6c47ff', bgcolor: alpha('#6c47ff', 0.04) },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <AttachFileIcon sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" fontWeight={500} color="text.secondary">
                  Add photos / videos
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Max {MAX_FILES} files · Video ≤ 3 min
                </Typography>
              </Box>
            </Box>
          )}

          {/* File error */}
          {fileError && (
            <Typography
              variant="caption"
              color="error.main"
              sx={{ display: 'block', mt: 0.75 }}
            >
              ⚠ {fileError}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit" sx={{ flex: 1 }}>
          Cancel
        </Button>
        <Button
          variant="outlined"
          onClick={handleSubmit}
          disabled={loading || !recipient || !tag || !description.trim()}
          startIcon={loading ? undefined : <SendIcon />}
          sx={{ flex: 2 }}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Send Kudo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
