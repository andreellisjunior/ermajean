'use client';

import { useCallback, useEffect, useState } from 'react';

const MODAL_STORAGE_KEY = 'upgrade_modal_last_shown';
const MODAL_INTERVAL_DAYS = 7;

export function useUpgradeModal() {
  const [showModal, setShowModal] = useState(false);

  // Check for localStorage clearing on mount and set up listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAndShowModal = () => {
      const lastShown = localStorage.getItem(MODAL_STORAGE_KEY);

      // If localStorage was cleared (no key exists), show modal immediately
      if (!lastShown) {
        console.log('localStorage cleared - showing pricing modal immediately');
        setShowModal(true);
        return true;
      }
      return false;
    };

    // Check immediately on mount
    const wasCleared = checkAndShowModal();

    // Only set up storage listener if not already showing modal
    if (!wasCleared) {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === MODAL_STORAGE_KEY && e.newValue === null) {
          console.log('localStorage key removed - showing pricing modal');
          setShowModal(true);
        }
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  const shouldShowModal = useCallback(() => {
    if (typeof window === 'undefined') return false;

    const lastShown = localStorage.getItem(MODAL_STORAGE_KEY);

    if (!lastShown) {
      // Never shown before or localStorage cleared, show it
      return true;
    }

    const lastShownDate = new Date(lastShown);
    const now = new Date();
    const daysSinceLastShown = Math.floor(
      (now.getTime() - lastShownDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceLastShown >= MODAL_INTERVAL_DAYS;
  }, []);

  const markModalAsShown = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(MODAL_STORAGE_KEY, new Date().toISOString());
    }
  };

  const triggerModal = useCallback(() => {
    console.log('triggerModal called');
    console.log('shouldShowModal():', shouldShowModal());
    if (shouldShowModal()) {
      console.log('Setting showModal to true');
      setShowModal(true);
      // Don't mark as shown here - wait until modal is closed
    } else {
      console.log('Modal not shown - localStorage timer not ready');
    }
  }, [shouldShowModal]);

  const forceShowModal = () => {
    setShowModal(true);
    markModalAsShown();
  };

  const closeModal = () => {
    setShowModal(false);
    // Mark modal as shown when it's closed, not when triggered
    markModalAsShown();
  };

  // Modal timing is handled by UpgradeModalProvider
  // This hook manages the modal state and localStorage

  return {
    showModal,
    triggerModal,
    forceShowModal,
    closeModal,
    shouldShowModal,
  };
}
