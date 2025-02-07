import './styles/globals.css';
import './services/init';  // Initialisation des services
import type { Metadata } from 'next';
import { ThemeProvider } from './contexts/ThemeContext';

export const metadata: Metadata = {
  title: 'Codestral',
  description: 'Assistant de développement',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
