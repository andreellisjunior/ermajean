'use client';

import { useEffect, useState } from 'react';
import { getPlatform, isCapacitor } from '../utils/capacitor';

interface CapacitorLayoutProps {
  children: React.ReactNode;
}

export default function CapacitorLayout({ children }: CapacitorLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [platform, setPlatform] = useState('web');

  useEffect(() => {
    setIsMobile(isCapacitor());
    setPlatform(getPlatform());
  }, []);

  return (
    <div
      className={`capacitor-layout ${isMobile ? 'mobile' : 'web'} platform-${platform}`}
    >
      {children}
    </div>
  );
}
