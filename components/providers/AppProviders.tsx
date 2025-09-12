'use client';

import { UserProvider } from '@/contexts/UserContext';
import { ReactNode } from 'react';
import UpgradeModalProvider from './UpgradeModalProvider';

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <UpgradeModalProvider>{children}</UpgradeModalProvider>
    </UserProvider>
  );
}
