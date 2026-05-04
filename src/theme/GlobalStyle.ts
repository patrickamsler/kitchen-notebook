import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: ${({ theme }) => theme.fonts.sans};
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.ink};
    font-size: 15px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
    font-feature-settings: 'ss01', 'cv11';
  }
  button { font: inherit; cursor: pointer; }
  input, textarea, select { font: inherit; color: inherit; }
  a { color: inherit; text-decoration: none; }

  ::selection {
    background: ${({ theme }) => theme.colors.accentSoft};
    color: ${({ theme }) => theme.colors.accentInk};
  }

  body::before {
    content: "";
    position: fixed;
    inset: 0;
    background-image:
      radial-gradient(rgba(80, 60, 30, 0.025) 1px, transparent 1px),
      radial-gradient(rgba(80, 60, 30, 0.018) 1px, transparent 1px);
    background-size: 3px 3px, 7px 7px;
    background-position: 0 0, 1px 2px;
    pointer-events: none;
    z-index: 0;
  }

  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
