import { ThemeProvider } from 'next-themes';
import { Comfortaa } from 'next/font/google';
import '../globals.css';
import BackgroundWrapper from '@/components/ui/BackgroundWrapper';
import Head from 'next/head';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Recipes | ErmaJean',
  description: 'A collection of recipes from ErmaJean',
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
      <Head>
        <link
          rel='icon'
          type='image/png'
          href='/favicon-48x48.png'
          sizes='48x48'
        />
        <link rel='icon' type='image/svg+xml' href='./favicon.svg' />
        <link rel='shortcut icon' href='./favicon.ico' />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/apple-touch-icon.png'
        />
        <meta name='apple-mobile-web-app-title' content='ermajean' />
        <link rel='manifest' href='/site.webmanifest' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta
          name='apple-mobile-web-app-status-bar-style'
          content='black-translucent'
        />
      </Head>
      <body className='bg-background text-foreground bg-[#F7F7ED]'>
        <BackgroundWrapper>
          <div className='p-4 max-w-xl mx-auto'>{children}</div>
        </BackgroundWrapper>
      </body>
    </html>
  );
}
