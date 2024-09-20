import { ThemeProvider } from 'next-themes';
import { Comfortaa } from 'next/font/google';
import './globals.css';
import BackgroundWrapper from '@/components/ui/BackgroundWrapper';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Next.js and Supabase Starter Kit',
  description: 'The fastest way to build apps with Next.js and Supabase',
};

const comfortaa = Comfortaa({
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={comfortaa.className} suppressHydrationWarning>
      <body className='bg-background text-foreground'>
        <ThemeProvider
          attribute='class'
          defaultTheme='light'
          enableSystem
          disableTransitionOnChange
        >
          <BackgroundWrapper>
            <div className='p-4 max-w-xl mx-auto'>{children}</div>
          </BackgroundWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
