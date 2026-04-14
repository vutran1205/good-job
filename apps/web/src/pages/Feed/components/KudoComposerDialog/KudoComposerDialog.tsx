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
import SendIcon from '@mui/icons-material/Send';
import { useState } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '../../../../hooks/useDebounce';
import { api } from '../../../../lib/api';
import { useAuthStore } from '../../../../store/auth.store';
import { CORE_VALUE_META } from '../../../../theme';
import { FileUploadSection } from './FileUploadSection';
import type { FilePreview } from './types';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const SLIDER_MARKS = [10, 20, 30, 40, 50].map((v) => ({ value: v, label: String(v) }));

export function KudoComposerDialog({ open, onClose }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  const [recipient, setRecipient] = useState<User | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [points, setPoints] = useState<number>(20);
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [fileError, setFileError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 300);

  const { data: users = [], isFetching: fetchingUsers } = useQuery<User[]>({
    queryKey: ['users', debouncedSearch],
    queryFn: async () =>
      (await api.get('/api/users', { params: { q: debouncedSearch, limit: 20 } })).data,
    enabled: open,
  });

  function handleFilesAdd(newPreviews: FilePreview[], validationError: string) {
    setSelectedFiles((prev) => [...prev, ...newPreviews]);
    setFileError(validationError);
  }

  function handleFileRemove(id: string) {
    setSelectedFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
    setFileError('');
  }

  function handleClose() {
    if (loading) return;
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setRecipient(null);
    setSearchInput('');
    setPoints(20);
    setTag('');
    setDescription('');
    setSelectedFiles([]);
    setFileError('');
    setError('');
    onClose();
  }

  async function handleSubmit() {
    if (!recipient) {
      setError('Please select a recipient');
      return;
    }
    if (!tag) {
      setError('Please select a Core Value');
      return;
    }
    if (!description.trim()) {
      setError('Please write a description');
      return;
    }

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

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: fullScreen ? 0 : 3, overflow: 'hidden' } } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Give a Kudo
        </Typography>
        <IconButton size="small" onClick={handleClose} disabled={loading}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Recipient */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 44, height: 44, fontSize: 18, flexShrink: 0 }}>
            {currentUser?.name?.[0]?.toUpperCase() ?? '?'}
          </Avatar>
          <Autocomplete
            sx={{ flex: 1 }}
            options={users}
            getOptionLabel={(u) => u.name}
            filterOptions={(x) => x}
            loading={fetchingUsers}
            noOptionsText={searchInput ? 'No users found' : 'Type a name or email to search'}
            value={recipient}
            onChange={(_, v) => setRecipient(v)}
            inputValue={searchInput}
            onInputChange={(_, v) => setSearchInput(v)}
            renderOption={(props, u) => (
              <Box component="li" {...props} key={u.id} sx={{ gap: 1.5 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 12, flexShrink: 0 }}>
                  {u.name[0].toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {u.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {u.email}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Send to who?"
                size="small"
                required
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {fetchingUsers && <CircularProgress size={14} sx={{ mr: 1 }} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
          />
        </Box>

        {/* Description */}
        <TextField
          multiline
          minRows={3}
          maxRows={8}
          fullWidth
          placeholder="Share what you want to recognize..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          slotProps={{ htmlInput: { maxLength: 1000 } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '1rem',
              '& fieldset': { borderColor: alpha(theme.palette.primary.main, 0.15) },
              '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.3) },
            },
          }}
        />

        {/* Core Value picker */}
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
                    borderRadius: '20px',
                    border: '2px solid',
                    borderColor: selected ? meta.color : alpha(meta.color, 0.3),
                    bgcolor: selected ? meta.bg : 'transparent',
                    px: 2,
                    py: 0.75,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                    outline: 'none',
                    '&:hover': { bgcolor: meta.bg, borderColor: meta.color },
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{ color: selected ? meta.color : 'text.secondary' }}
                  >
                    {value}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Points slider */}
        <Box>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
          >
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              Points to give
            </Typography>
            <Box
              sx={{
                px: 2,
                py: 0.25,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: 0.5,
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: 'primary.contrastText', lineHeight: 1.2 }}
              >
                {points}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: alpha(theme.palette.primary.contrastText, 0.8) }}
              >
                pts
              </Typography>
            </Box>
          </Box>
          <Slider
            value={points}
            onChange={(_, v) => setPoints(v as number)}
            min={10}
            max={50}
            step={1}
            marks={SLIDER_MARKS}
            sx={{
              color: 'primary.main',
              '& .MuiSlider-thumb': { width: 20, height: 20 },
              '& .MuiSlider-markLabel': { fontSize: '0.7rem' },
            }}
          />
        </Box>

        {/* File upload */}
        <FileUploadSection
          files={selectedFiles}
          error={fileError}
          onAdd={handleFilesAdd}
          onRemove={handleFileRemove}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit" sx={{ flex: 1 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
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
