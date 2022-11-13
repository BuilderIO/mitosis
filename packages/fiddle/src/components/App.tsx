import { useObserver } from 'mobx-react-lite';
import React from 'react';
import { createTheme, ThemeProvider } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import { colors } from '../constants/colors';
import Fiddle from './Fiddle';
import Talk from './Talk';
import { theme } from '../constants/theme';

export default function App() {
  return useObserver(() => {
    const muiTheme = createTheme({
      palette: {
        type: theme.darkMode ? 'dark' : 'light',
        primary: { main: colors.primary },
      },
    });

    const talkMode = window.location.pathname.includes('/talk');
    return (
      <React.StrictMode>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          <style>{`
            body {
              background-color: ${colors.background};
            }
          `}</style>
          {talkMode ? <Talk /> : <Fiddle />}
        </ThemeProvider>
      </React.StrictMode>
    );
  });
}
