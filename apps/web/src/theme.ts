import { createTheme, alpha } from '@mui/material/styles';

// ─── Color tokens ─────────────────────────────────────────────────────────────
const PRIMARY = '#6c47ff'; // brand violet
const PRIMARY_LIGHT = '#8b6dff'; // gradient accent
const SECONDARY = '#ff6b6b'; // coral accent
const SECONDARY_DARK = '#e04545'; // secondary dark variant
const SUCCESS = '#22c55e';
const WARNING = '#f59e0b';
const ERROR = '#ef4444';
const INFO = '#3b82f6';

// Light palette
const BG_DEFAULT = '#f5f3ff'; // app background — light lavender
const BG_PAPER = '#ffffff'; // card, dialog, input
const TEXT_PRIMARY = '#120f24'; // near-black with violet tint
const TEXT_SECONDARY = '#6b62a0'; // muted violet-grey

// ─── Core Value Metadata ──────────────────────────────────────────────────────
export const CORE_VALUE_META: Record<string, { color: string; bg: string }> = {
  '#Teamwork': { color: '#7c3aed', bg: alpha('#7c3aed', 0.08) },
  '#Ownership': { color: '#0369a1', bg: alpha('#0369a1', 0.08) },
  '#Innovation': { color: '#d97706', bg: alpha('#d97706', 0.1) },
  '#CustomerFirst': { color: '#059669', bg: alpha('#059669', 0.08) },
  '#Integrity': { color: '#db2777', bg: alpha('#db2777', 0.08) },
};

// ─── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
  // ── Palette ─────────────────────────────────────────────────────────────────
  palette: {
    mode: 'light',
    primary: {
      main: PRIMARY,
      light: PRIMARY_LIGHT,
      dark: '#4c2fd6',
      contrastText: '#ffffff',
    },
    secondary: {
      main: SECONDARY,
      light: alpha(SECONDARY, 0.15),
      dark: SECONDARY_DARK,
      contrastText: '#ffffff',
    },
    success: { main: SUCCESS },
    warning: { main: WARNING },
    error: { main: ERROR },
    info: { main: INFO },
    background: {
      default: BG_DEFAULT,
      paper: BG_PAPER,
    },
    text: {
      primary: TEXT_PRIMARY,
      secondary: TEXT_SECONDARY,
    },
    divider: alpha(PRIMARY, 0.15),
  },

  // ── Typography ───────────────────────────────────────────────────────────────
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h4: { fontWeight: 700, letterSpacing: '-0.5px' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    body2: { color: TEXT_SECONDARY },
    button: { textTransform: 'none', fontWeight: 600 },
  },

  // ── Shape ────────────────────────────────────────────────────────────────────
  shape: { borderRadius: 12 },

  // ── Shadows ──────────────────────────────────────────────────────────────────
  shadows: [
    'none',
    '0 1px 3px rgba(108,71,255,.08)',
    '0 2px 6px rgba(108,71,255,.1)',
    '0 4px 12px rgba(108,71,255,.12)',
    '0 6px 16px rgba(108,71,255,.12)',
    '0 8px 24px rgba(108,71,255,.14)',
    ...Array(19).fill('none'),
  ] as import('@mui/material/styles').Shadows,

  // ── Component overrides ──────────────────────────────────────────────────────
  components: {
    // CssBaseline — Inter font + global keyframes
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { background-color: ${BG_DEFAULT}; color: ${TEXT_PRIMARY}; }

        @keyframes pop {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `,
    },

    // TextField
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
    },

    // AppBar
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' },
      styleOverrides: {
        root: {
          backgroundColor: BG_PAPER,
          borderBottom: `1px solid ${alpha(PRIMARY, 0.12)}`,
        },
      },
    },

    // Avatar
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(PRIMARY, 0.12),
          color: PRIMARY,
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
