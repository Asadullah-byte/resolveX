// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0369a1', // blue-700
    },
    secondary: {
      main: '#0ea5e9', // blue-500
    },
    error: {
      main: '#f43f5e', // rose-500
    },
    warning: {
      main: '#f59e0b', // amber-500
    },
    info: {
      main: '#0ea5e9', // blue-500
    },
    success: {
      main: '#10b981', // emerald-500
    },
  },
});

export default theme;