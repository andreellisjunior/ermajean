import DashboardNav from '@/components/DashboardNav';
import Header from '@/components/Header';
import PageWrapper from '@/components/ui/PageWrapper';
import { Comfortaa } from 'next/font/google';
import React from 'react';
import '../globals.css';

const comfortaa = Comfortaa({
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={comfortaa.className} suppressHydrationWarning>
      <body>
        <div className="flex h-screen bg-[#F7FDFC]">
          <div className="flex lg:flex-row flex-col-reverse w-full h-full items-center justify-center">
            <h1>Coming Soon...</h1>
            {/* <DashboardNav />
            <div className="flex-1 overflow-y-auto">
              <PageWrapper>{children}</PageWrapper>
            </div> */}
          </div>
        </div>
      </body>
    </html>
  );
}
