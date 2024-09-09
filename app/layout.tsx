import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import Providers from '@/utils/Provider';
import { DataProvider } from '@/context/dataProvider';
import { CookiesProvider } from 'next-client-cookies/server';

const inter = Inter({ subsets: ['latin'] }); 

export const metadata: Metadata = {
  title: 'Pureblu Admin Dashboard',
  description: 'Pureblu Dashboard SaaS app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body
        suppressHydrationWarning={true}
        className={`${inter.className} flex min-h-screen flex-col text-sm`}
      >
        <Providers>
          <DataProvider>
            <CookiesProvider>{children}</CookiesProvider>
          </DataProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
