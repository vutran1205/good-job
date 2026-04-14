import { createTheme, alpha } from '@mui/material/styles';

// ─── Color tokens ─────────────────────────────────────────────────────────────
const PRIMARY        = '#6c47ff';   // brand violet
const PRIMARY_LIGHT  = '#8b6dff';   // gradient accent
const SECONDARY      = '#ff6b6b';   // coral accent
const SECONDARY_DARK = '#e04545';   // secondary dark variant
const SUCCESS        = '#22c55e';
const WARNING        = '#f59e0b';
const ERROR          = '#ef4444';
const INFO           = '#3b82f6';

// Dark palette
const BG_DEFAULT     = '#1a1630';   // app background
const BG_PAPER       = '#26214a';   // card, dialog, input
const TEXT_PRIMARY   = '#ede8ff';
const TEXT_SECONDARY = '#9d93bf';

// ─── Core Value Metadata ──────────────────────────────────────────────────────
export const CORE_VALUE_META: Record<string, { color: string; bg: string }> = {
  '#Teamwork':      { color: '#a78bfa', bg: alpha('#7c3aed', 0.2) },
  '#Ownership':     { color: '#38bdf8', bg: alpha('#0369a1', 0.2) },
  '#Innovation':    { color: '#fbbf24', bg: alpha('#d97706', 0.2) },
  '#CustomerFirst': { color: '#34d399', bg: alpha('#059669', 0.2) },
  '#Integrity':     { color: '#f472b6', bg: alpha('#db2777', 0.2) },
};

// ─── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
  // ── Palette ─────────────────────────────────────────────────────────────────
  palette: {
    mode: 'dark',
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
    error:   { main: ERROR },
    info:    { main: INFO },
    background: {
      default: BG_DEFAULT,
      paper:   BG_PAPER,
    },
    text: {
      primary:   TEXT_PRIMARY,
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
    '0 1px 3px rgba(0,0,0,.3)',
    '0 2px 6px rgba(0,0,0,.35)',
    '0 4px 12px rgba(0,0,0,.4)',
    '0 6px 16px rgba(0,0,0,.4)',
    '0 8px 24px rgba(0,0,0,.45)',
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

    // Button
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, paddingTop: 8, paddingBottom: 8 },
        containedPrimary: {
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #8b6dff 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, #5c3de0 0%, ${PRIMARY} 100%)`,
          },
        },
      },
    },

    // Card
    MuiCard: {
      defaultProps: { elevation: 2 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${alpha(PRIMARY, 0.12)}`,
          backgroundImage: 'none',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: `0 8px 24px ${alpha(PRIMARY, 0.2)}`,
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
          borderRadius: 10,
          backgroundColor: alpha(BG_PAPER, 0.6),
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 2,
            borderColor: PRIMARY,
          },
          '& input:-webkit-autofill': {
            WebkitBoxShadow: `0 0 0 100px ${BG_PAPER} inset`,
            WebkitTextFillColor: TEXT_PRIMARY,
          },
        },
      },
    },

    // Chip
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500 },
        colorPrimary: {
          backgroundColor: alpha(PRIMARY, 0.18),
          color: '#c4b5fd',
        },
      },
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

    // Paper
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 16 },
        root: { backgroundImage: 'none' },
      },
    },

    // Avatar
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(PRIMARY, 0.2),
          color: '#c4b5fd',
          fontWeight: 600,
        },
      },
    },

    // Tooltip
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#2d2550',
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

    // Dialog
    MuiDialog: {
      styleOverrides: {
        paper: { backgroundImage: 'none' },
      },
    },
  },
});

export default theme;
