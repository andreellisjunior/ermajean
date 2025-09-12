'use client';

import { createClient } from '@/libs/supabase/client';
import { userCache } from '@/libs/userCache';

import { useCallback, useEffect, useRef, useState } from 'react';
import UpgradeModalContext from '../../contexts/UpgradeModalContext';
import { useUpgradeModal } from '../../hooks/useUpgradeModal';
import PaidFeatureModal from '../ui/PaidFeatureModal';

export default function UpgradeModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    showModal,
    closeModal,
    triggerModal,
    forceShowModal,
    shouldShowModal,
  } = useUpgradeModal();
  const [user, setUser] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const supabase = createClient();
  const modalTriggeredRef = useRef(false);
  const profileFetchedRef = useRef(false);

  // Cached profile fetch function
  const fetchUserProfile = useCallback(
    async (userId: string) => {
      const cacheKey = `profile_${userId}`;

      return userCache.get(cacheKey, async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_access, created_at')
          .eq('id', userId)
          .single();

        return profile;
      });
    },
    [supabase]
  );

  // Handle modal trigger logic
  const handleModalTrigger = useCallback(
    (profile: any, isNewSignup = false) => {
      if (modalTriggeredRef.current) return;

      const userHasAccess = profile?.has_access || false;

      if (!userHasAccess) {
        const createdAt = new Date(profile?.created_at || new Date());
        const now = new Date();
        const minutesSinceCreation =
          (now.getTime() - createdAt.getTime()) / (1000 * 60);

        // Check if localStorage was cleared (immediate trigger)
        if (
          shouldShowModal() &&
          !localStorage.getItem('upgrade_modal_last_shown')
        ) {
          modalTriggeredRef.current = true;
          triggerModal();
        }
        // If account was created in the last 5 minutes or it's a new signup
        else if (minutesSinceCreation < 5 || isNewSignup) {
          modalTriggeredRef.current = true;
          setTimeout(() => {
            triggerModal();
          }, 2000);
        } else {
          // For existing free tier users, trigger modal based on 7-day timer
          setTimeout(() => {
            if (!modalTriggeredRef.current) {
              triggerModal();
            }
          }, 1000);
        }
      }
    },
    [shouldShowModal, triggerModal]
  );

  // Check user authentication and access status
  useEffect(() => {
    const checkUserStatus = async () => {
      if (profileFetchedRef.current) return;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          profileFetchedRef.current = true;
          const profile = await fetchUserProfile(user.id);
          const userHasAccess = profile?.has_access || false;
          setHasAccess(userHasAccess);

          handleModalTrigger(profile);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      }
    };

    checkUserStatus();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);

        // Only fetch profile if we haven't already or if it's a different user
        const profile = await fetchUserProfile(session.user.id);
        const userHasAccess = profile?.has_access || false;
        setHasAccess(userHasAccess);

        // Handle modal for new signups
        handleModalTrigger(profile, true);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setHasAccess(null);
        modalTriggeredRef.current = false;
        profileFetchedRef.current = false;
        // Clear cache on sign out
        userCache.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchUserProfile, handleModalTrigger]);

  // Show modal if localStorage was cleared (immediate) or if user doesn't have premium access
  const localStorageCleared =
    typeof window !== 'undefined' &&
    !localStorage.getItem('upgrade_modal_last_shown');
  const userNeedsUpgrade = user && hasAccess === false;

  const shouldShowModalToUser =
    showModal && (localStorageCleared || userNeedsUpgrade);

  return (
    <UpgradeModalContext.Provider value={{ showUpgradeModal: forceShowModal }}>
      {children}

      {shouldShowModalToUser && (
        <PaidFeatureModal
          open={showModal}
          setOpen={(open) => {
            if (!open) {
              closeModal();
            }
          }}
          title="Unlock Premium Recipes! 🍳"
          description="Get unlimited AI recipes, save your favorites, add notes, and share with friends. Join thousands of home cooks already using our premium features!"
        />
      )}
    </UpgradeModalContext.Provider>
  );
}
