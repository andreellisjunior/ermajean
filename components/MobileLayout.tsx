'use client';

import { useEffect } from 'react';
import { CapacitorService } from '@/libs/capacitor';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  useEffect(() => {
    // Initialize Capacitor when the app starts
    CapacitorService.initialize();
  }, []);

  return (
    <div className={`min-h-screen ${CapacitorService.isNative ? 'pb-safe' : ''}`}>
      {children}
    </div>
  );
} 