import { Box, Typography, IconButton } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useRef } from 'react';
import type { FilePreview } from './types';

const MAX_FILES = 3;

interface Props {
  files: FilePreview[];
  error: string;
  onAdd: (newPreviews: FilePreview[], validationError: string) => void;
  onRemove: (id: string) => void;
}

export function FileUploadSection({ files, error, onAdd, onRemove }: Props) {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files ?? []);
    if (!newFiles.length) return;

    const canAdd = MAX_FILES - files.length;
    if (canAdd <= 0) {
      onAdd([], `Maximum ${MAX_FILES} files. Remove some before adding new ones.`);
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

    onAdd(
      previews,
      skipped > 0 ? `${skipped} file(s) skipped — exceeded the ${MAX_FILES} file limit.` : '',
    );

    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          Photos / Videos
          {files.length > 0 && (
            <Box
              component="span"
              sx={{ ml: 0.75, color: files.length >= MAX_FILES ? 'error.main' : 'text.secondary' }}
            >
              ({files.length}/{MAX_FILES})
            </Box>
          )}
        </Typography>
      </Box>

      <input
        ref={fileInputRef}
        hidden
        multiple
        accept="image/*,video/*"
        type="file"
        onChange={handleFileChange}
      />

      {/* Thumbnail strip */}
      {files.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: error ? 0.75 : 0 }}>
          {files.map(({ id, previewUrl, type, file }) => (
            <Box
              key={id}
              sx={{
                position: 'relative',
                width: 90,
                height: 90,
                flexShrink: 0,
                borderRadius: 2,
                overflow: 'visible',
              }}
            >
              {type === 'image' ? (
                <Box
                  component="img"
                  src={previewUrl}
                  alt={file.name}
                  sx={{
                    width: 90,
                    height: 90,
                    objectFit: 'contain',
                    borderRadius: 2,
                    display: 'block',
                    border: `1.5px solid ${alpha(theme.palette.common.white, 0.12)}`,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 90,
                    height: 90,
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative',
                    bgcolor: 'common.black',
                    border: `1.5px solid ${alpha(theme.palette.common.white, 0.12)}`,
                  }}
                >
                  <Box
                    component="video"
                    src={previewUrl}
                    muted
                    playsInline
                    sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0,0,0,0.38)',
                      pointerEvents: 'none',
                    }}
                  >
                    <PlayArrowIcon sx={{ color: 'common.white', fontSize: 30 }} />
                  </Box>
                </Box>
              )}

              <IconButton
                size="small"
                type="button"
                onClick={() => onRemove(id)}
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  width: 22,
                  height: 22,
                  p: 0,
                  bgcolor: 'error.main',
                  color: 'error.contrastText',
                  border: '2px solid',
                  borderColor: 'background.default',
                  zIndex: 1,
                  '&:hover': { bgcolor: 'error.dark' },
                }}
              >
                <CloseIcon sx={{ fontSize: 12 }} />
              </IconButton>
            </Box>
          ))}

          {/* Add more button */}
          {files.length < MAX_FILES && (
            <Box
              component="label"
              sx={{
                width: 90,
                height: 90,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.25,
                border: '2px dashed',
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                borderRadius: 2,
                cursor: 'pointer',
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
      {files.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            border: '2px dashed',
            borderColor: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            borderRadius: 2,
            p: 2,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
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

      {error && (
        <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 0.75 }}>
          ⚠ {error}
        </Typography>
      )}
    </Box>
  );
}
