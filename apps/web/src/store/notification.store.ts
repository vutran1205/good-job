import { create } from 'zustand';

type Severity = 'success' | 'error' | 'info' | 'warning';

interface NotificationState {
  open: boolean;
  message: string;
  severity: Severity;
  show: (message: string, severity?: Severity) => void;
  close: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  open: false,
  message: '',
  severity: 'success',
  show: (message, severity = 'success') => set({ open: true, message, severity }),
  close: () => set({ open: false }),
}));
