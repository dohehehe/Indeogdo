// 기본 테마 설정
export const theme = {
  colors: {
    primary: '#ADD5FF',
    secondary: '#7928ca',
    success: '#0070f3',
    warning: '#f5a623',
    error: '#e00',
    background: '#ffffff',
    foreground: '#000000',
    card: '#fafafa',
    border: '#eaeaea',
  },
  dark: {
    colors: {
      primary: '#0070f3',
      secondary: '#7928ca',
      success: '#0070f3',
      warning: '#f5a623',
      error: '#ff0000',
      background: '#000000',
      foreground: '#ffffff',
      card: '#111111',
      border: '#333333',
    },
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px',
  },
  media: {
    mobile: `@media (max-width: 767px)`,
    tablet: `@media (max-width: 1023px)`,
    desktop: `@media (min-width: 1024px)`,
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
  },
};

export default theme;
