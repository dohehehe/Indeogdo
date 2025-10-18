'use client';

import { ThemeProvider } from '@emotion/react';
import { AuthProvider } from '@/contexts/AuthContext';
import theme from '@/styles/Theme';

function Providers({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}

export default Providers;
