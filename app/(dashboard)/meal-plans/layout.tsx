import { CSPostHogProvider } from '@/app/providers'; // Assuming you use this
import Header from '@/components/Header'; // Assuming standard header path
import ClientLayout from '@/components/LayoutClient'; // Assuming path for Toaster, Tooltip etc.
import BackgroundWrapper from '@/components/ui/BackgroundWrapper'; // Assuming path
import { Viewport } from 'next';
import { Comfortaa } from 'next/font/google';
import Head from 'next/head';
import { ReactNode } from 'react';
import '../../globals.css'; // Ensure global styles are imported

const comfortaa = Comfortaa({
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#F7F7ED', // Or use CSS variable if defined
  width: 'device-width',
  initialScale: 1,
};

// Add appropriate metadata
export const metadata = {
  title: 'Meal Planner | ermajean',
  description: 'Plan your weekly meals with ermajean.',
};

export default function MealPlansLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${comfortaa.className} scroll-smooth`}
      suppressHydrationWarning
    >
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <body className="bg-background text-foreground">
        <CSPostHogProvider>
          <ClientLayout>
            <BackgroundWrapper>
              <main className="p-6 md:p-8 mx-auto w-full h-screen overflow-auto">
                {children}
              </main>
            </BackgroundWrapper>
          </ClientLayout>
        </CSPostHogProvider>
      </body>
    </html>
  );
}
