import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/components/providers/store-provider';
import { NotificationToast } from '@/components/notifications/notification-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Next.js Template',
  description: 'Production-ready Next.js template with TypeScript and best practices',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          {children}
          <NotificationToast />
        </StoreProvider>
      </body>
    </html>
  );
}

