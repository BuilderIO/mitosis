import { useObserver } from 'mobx-react-lite';
import React from 'react';
import { createTheme, ThemeProvider } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import { colors } from '../constants/colors';
import Fiddle from './Fiddle';
import { theme } from '../constants/theme';

export default function App() {
  return useObserver(() => {
    const muiTheme = createTheme({
      palette: {
        type: theme.darkMode ? 'dark' : 'light',
        primary: { main: colors.primary },
      },
    });
    return (
      <React.StrictMode>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          <style>{`
            body {
              background-color: ${colors.background};
            }
          `}</style>
          <Fiddle />
        </ThemeProvider>
      </React.StrictMode>
    );
  });
}
