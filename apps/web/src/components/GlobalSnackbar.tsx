import { Snackbar, Alert } from '@mui/material';
import { useNotificationStore } from '../store/notification.store';

export function GlobalSnackbar() {
  const { open, message, severity, close } = useNotificationStore();

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={close}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert severity={severity} onClose={close} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
}
