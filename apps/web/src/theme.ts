import { createTheme, alpha } from '@mui/material/styles';

// ─── Colour tokens ────────────────────────────────────────────────────────────
const PRIMARY = '#6c47ff';      // brand violet
const SECONDARY = '#ff6b6b';    // coral accent
const SUCCESS = '#22c55e';
const WARNING = '#f59e0b';
const ERROR = '#ef4444';
const INFO = '#3b82f6';
const BG_DEFAULT = '#f5f4ff';   // very light violet tint
const BG_PAPER = '#ffffff';
const TEXT_PRIMARY = '#1a1033';
const TEXT_SECONDARY = '#6b7280';

// ─── Core Value Metadata ──────────────────────────────────────────────────────
export const CORE_VALUE_META: Record<string, { color: string; bg: string }> = {
  '#Teamwork':      { color: '#7c3aed', bg: '#ede9fe' },
  '#Ownership':     { color: '#0369a1', bg: '#e0f2fe' },
  '#Innovation':    { color: '#d97706', bg: '#fef3c7' },
  '#CustomerFirst': { color: '#059669', bg: '#d1fae5' },
  '#Integrity':     { color: '#db2777', bg: '#fce7f3' },
};

// ─── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
  // ── Palette ─────────────────────────────────────────────────────────────────
  palette: {
    mode: 'light',
    primary: {
      main: PRIMARY,
      light: alpha(PRIMARY, 0.12),
      dark: '#4c2fd6',
      contrastText: '#ffffff',
    },
    secondary: {
      main: SECONDARY,
      light: alpha(SECONDARY, 0.12),
      dark: '#e04545',
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
    divider: alpha(PRIMARY, 0.1),
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

  // ── Shadows — lighter than default ──────────────────────────────────────────
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,.06)',
    '0 2px 6px rgba(0,0,0,.08)',
    '0 4px 12px rgba(0,0,0,.10)',
    '0 6px 16px rgba(0,0,0,.10)',
    '0 8px 24px rgba(0,0,0,.12)',
    ...Array(19).fill('none'),
  ] as import('@mui/material/styles').Shadows,

  // ── Component overrides ──────────────────────────────────────────────────────
  components: {
    // MuiCssBaseline: inject Inter font + global keyframes
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { background-color: ${BG_DEFAULT}; }

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

    // Button
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingTop: 8,
          paddingBottom: 8,
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #8b6dff 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, #5c3de0 0%, ${PRIMARY} 100%)`,
          },
        },
      },
    },

    // Card — subtle elevation + crisp border + hover lift
    MuiCard: {
      defaultProps: { elevation: 2 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${alpha(PRIMARY, 0.08)}`,
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: `0 8px 24px ${alpha(PRIMARY, 0.14)}`,
            transform: 'translateY(-2px)',
          },
        },
      },
    },

    // TextField
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: BG_PAPER,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 2,
          },
        },
      },
    },

    // Chip
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500 },
        colorPrimary: {
          backgroundColor: alpha(PRIMARY, 0.12),
          color: PRIMARY,
        },
      },
    },

    // AppBar — white with slight shadow
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' },
      styleOverrides: {
        root: {
          backgroundColor: BG_PAPER,
          borderBottom: `1px solid ${alpha(PRIMARY, 0.08)}`,
        },
      },
    },

    // Paper
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 16 },
      },
    },

    // Avatar — primary colour by default
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(PRIMARY, 0.15),
          color: PRIMARY,
          fontWeight: 600,
        },
      },
    },

    // Tooltip — dark background
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: TEXT_PRIMARY,
          borderRadius: 6,
          fontSize: '0.75rem',
        },
      },
    },

    // Alert
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
  },
});

export default theme;
