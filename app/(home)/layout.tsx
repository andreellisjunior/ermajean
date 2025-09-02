import { CSPostHogProvider } from '@/app/providers';
import UpgradeModalProvider from '@/components/providers/UpgradeModalProvider';
import config from '@/config';
import { getSEOTags } from '@/libs/seo';
import { Viewport } from 'next';
import { Comfortaa } from 'next/font/google';
import Head from 'next/head';
import { ReactNode } from 'react';
import '../globals.css';

const comfortaa = Comfortaa({
  subsets: ['latin'],
});

export const viewport: Viewport = {
  // Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
  themeColor: '#F7F7ED',
  width: 'device-width',
  initialScale: 1,
};

// This adds default SEO tags to all pages in our app.
// You can override them in each page passing params to getSOTags() function.
export const metadata = {
  title: 'Personal Recipe Management | ermajean',
  description:
    'ErmaJean is a personal recipe management and creation tool. Create, save and share your recipes with family and friends!',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${comfortaa.className} scroll-smooth`}
      suppressHydrationWarning
    >
      <Head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-48x48.png"
          sizes="48x48"
        />
        <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
        <link rel="shortcut icon" href="./favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="ermajean" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </Head>
      <body className="text-foreground bg-[#F7F7ED]">
        <CSPostHogProvider>
            <div className="mx-auto">{children}</div>
        </CSPostHogProvider>
      </body>
    </html>
  );
}
