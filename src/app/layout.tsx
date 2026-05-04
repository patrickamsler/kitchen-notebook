import type { Metadata } from 'next';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/providers/Providers';
import Masthead from '@/features/masthead/Masthead';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['opsz', 'SOFT', 'WONK'],
  weight: 'variable',
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'The Kitchen Notebook',
  description: 'A personal recipe book with a shopping list.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVars = {
    serif: `var(--font-fraunces), 'Cormorant Garamond', Georgia, serif`,
    sans: `var(--font-inter), system-ui, sans-serif`,
    mono: `var(--font-jetbrains), ui-monospace, monospace`,
  };

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <Providers fontVars={fontVars}>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '1180px', margin: '0 auto', padding: '48px 40px 96px', minHeight: '100vh' }}>
            <Masthead />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
