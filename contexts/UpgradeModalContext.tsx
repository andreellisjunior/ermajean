'use client';

import { createContext, useContext } from 'react';

interface UpgradeModalContextType {
  showUpgradeModal: () => void;
}

const UpgradeModalContext = createContext<UpgradeModalContextType | null>(null);

export const useUpgradeModalContext = () => {
  const context = useContext(UpgradeModalContext);
  if (!context) {
    throw new Error(
      'useUpgradeModalContext must be used within UpgradeModalProvider'
    );
  }
  return context;
};

export default UpgradeModalContext;
