'use client';

import { createClient } from '@/libs/supabase/client';

import { useCallback, useEffect, useRef, useState } from 'react';
import UpgradeModalContext from '../../contexts/UpgradeModalContext';
import { useUpgradeModal } from '../../hooks/useUpgradeModal';
import PaidFeatureModal from '../ui/PaidFeatureModal';

export default function UpgradeModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showModal, closeModal, triggerModal, forceShowModal } =
    useUpgradeModal();
  const [user, setUser] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const supabase = createClient();
  const profileCache = useRef<{
    [userId: string]: { hasAccess: boolean; createdAt: string };
  }>({});

  const checkUserProfile = useCallback(
    async (userId: string) => {
      // Check cache first
      if (profileCache.current[userId]) {
        return profileCache.current[userId];
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_access, created_at')
          .eq('id', userId)
          .single();

        const profileData = {
          hasAccess: profile?.has_access || false,
          createdAt: profile?.created_at || new Date().toISOString(),
        };

        // Cache the result
        profileCache.current[userId] = profileData;
        return profileData;
      } catch (error) {
        console.error('Error fetching profile:', error);
        return { hasAccess: false, createdAt: new Date().toISOString() };
      }
    },
    [supabase]
  );

  // Check user authentication and access status
  useEffect(() => {
    let isMounted = true;

    const checkUserStatus = async () => {
      if (isInitialized) return; // Prevent multiple initializations

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!isMounted) return;
        setUser(user);

        if (user) {
          const profileData = await checkUserProfile(user.id);

          if (!isMounted) return;
          setHasAccess(profileData.hasAccess);

          // If user doesn't have premium access, check if we should show modal
          if (!profileData.hasAccess) {
            const createdAt = new Date(profileData.createdAt);
            const now = new Date();
            const minutesSinceCreation =
              (now.getTime() - createdAt.getTime()) / (1000 * 60);

            // Check if localStorage was cleared (immediate trigger)
            const lastShown = localStorage.getItem('upgrade_modal_last_shown');
            if (!lastShown) {
              triggerModal();
            }
            // If account was created in the last 5 minutes, it's a new signup
            else if (minutesSinceCreation < 5) {
              setTimeout(() => {
                if (isMounted) triggerModal();
              }, 2000);
            } else {
              // For existing free tier users, trigger modal based on 7-day timer
              setTimeout(() => {
                if (isMounted) triggerModal();
              }, 1000);
            }
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error checking user status:', error);
        setIsInitialized(true);
      }
    };

    checkUserStatus();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);

        // Clear cache for this user to get fresh data
        delete profileCache.current[session.user.id];

        const profileData = await checkUserProfile(session.user.id);

        if (!isMounted) return;
        setHasAccess(profileData.hasAccess);

        // Only trigger modal for new signups
        if (!profileData.hasAccess) {
          const createdAt = new Date(profileData.createdAt);
          const now = new Date();
          const minutesSinceCreation =
            (now.getTime() - createdAt.getTime()) / (1000 * 60);

          // If account was created in the last 5 minutes, consider it a new signup
          if (minutesSinceCreation < 5) {
            setTimeout(() => {
              if (isMounted) triggerModal();
            }, 2000);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setHasAccess(null);
        // Clear cache on sign out
        profileCache.current = {};
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkUserProfile, triggerModal, isInitialized]);

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
