import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6B5F32', // deep brown
      contrastText: '#fff',
    },
    secondary: {
      main: '#E1D5B8', // beige
      contrastText: '#000',
    },
    error: {
      main: '#dc2626', // red
      contrastText: '#fff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          textTransform: 'none',
        },
        containedPrimary: {
          backgroundColor: '#6B5F32',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#574a26',
          },
        },
        containedSecondary: {
          backgroundColor: '#E1D5B8',
          color: '#000',
          '&:hover': {
            backgroundColor: '#d4c4a1',
          },
        },
        containedError: {
          backgroundColor: '#dc2626',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#b91c1c',
          },
        },
        outlinedPrimary: {
          borderColor: '#6B5F32',
          color: '#6B5F32',
          '&:hover': {
            borderColor: '#574a26',
            backgroundColor: '#f3f1eb',
          },
        },
        outlinedSecondary: {
          borderColor: '#E1D5B8',
          color: '#000',
          '&:hover': {
            borderColor: '#d4c4a1',
            backgroundColor: '#faf7f2',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&.Mui-error': {
            color: '#dc2626',
            '&:hover': {
              color: '#b91c1c',
            },
          },
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      fontWeight: 600,
    },
  },
});

export default theme;