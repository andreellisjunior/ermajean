import DashboardNav from '@/components/DashboardNav';
import Header from '@/components/Header';
import PageWrapper from '@/components/ui/PageWrapper';
import { Comfortaa } from "next/font/google";
import "../globals.css";
import React from 'react';

const comfortaa = Comfortaa({
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={comfortaa.className} suppressHydrationWarning>
      <body>
        <div className='flex min-h-screen bg-[#F7FDFC]'>
          <div className='absolute top-0 left-0 right-0 lg:relative lg:hidden'>
            <Header />
          </div>
          <div className='flex lg:flex-row flex-col-reverse w-full'>
            <DashboardNav />
            <PageWrapper>{children}</PageWrapper>
          </div>
        </div>
      </body>
    </html>
  );
}
