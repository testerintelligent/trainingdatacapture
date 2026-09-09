import { createTheme } from "@mui/material/styles";

// Design tokens backing the MUI theme below.
const colors = {
  primary: "#6846C6",
  primaryDark: "#4E2FA8",
  primarySoft: "#F0EBFB",
  border: "#E7E3F1",
  textSecondary: "#667085",
  surface: "#FFFFFF",
  background: "#F6F5FA",
};

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      dark: colors.primaryDark,
      light: colors.primarySoft,
      contrastText: "#ffffff",
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: "#1F2430",
      secondary: colors.textSecondary,
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: "none",
        },
        contained: {
          "&:hover": { boxShadow: "none" },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 2px 12px rgba(31, 27, 66, 0.06)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#ffffff",
        },
        notchedOutline: {
          borderColor: colors.border,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.border}`,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "0.8125rem",
          padding: "6px 10px",
          borderRadius: 6,
        },
      },
    },
  },
});

export default theme;
