'use client';

import { useUpgradeModalContext } from '@/contexts/UpgradeModalContext';

export function useShowUpgradeModal() {
  const { showUpgradeModal } = useUpgradeModalContext();
  return showUpgradeModal;
}
