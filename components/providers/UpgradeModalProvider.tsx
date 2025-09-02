'use client';

import { createClient } from '@/libs/supabase/client';

import { useEffect, useState } from 'react';
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

  // Check user authentication and access status
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setUser(user);

        if (user) {
          // Check if user has premium access
          const { data: profile } = await supabase
            .from('profiles')
            .select('has_access, created_at')
            .eq('id', user.id)
            .single();

          const userHasAccess = profile?.has_access || false;
          setHasAccess(userHasAccess);

          // If user doesn't have premium access, check if we should show modal
          if (!userHasAccess) {
            const createdAt = new Date(profile?.created_at || new Date());
            const now = new Date();
            const minutesSinceCreation =
              (now.getTime() - createdAt.getTime()) / (1000 * 60);

            console.log('User created:', createdAt);
            console.log('Minutes since creation:', minutesSinceCreation);
            console.log(
              'Should show modal (localStorage check):',
              shouldShowModal()
            );

            // Check if localStorage was cleared (immediate trigger)
            if (
              shouldShowModal() &&
              !localStorage.getItem('upgrade_modal_last_shown')
            ) {
              console.log('localStorage cleared - showing modal immediately');
              triggerModal();
            }
            // If account was created in the last 5 minutes, it's a new signup
            else if (minutesSinceCreation < 5) {
              console.log('New user - showing modal immediately');
              setTimeout(() => {
                triggerModal();
              }, 2000);
            } else {
              // For existing free tier users, trigger modal based on 7-day timer
              console.log('Existing user - checking 7-day timer');
              setTimeout(() => {
                triggerModal();
              }, 1000);
            }
          }
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

        // Check if this is a new signup (user just created)
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_access, created_at')
          .eq('id', session.user.id)
          .single();

        const userHasAccess = profile?.has_access || false;
        setHasAccess(userHasAccess);

        // If user doesn't have premium access, trigger modal
        if (profile && !userHasAccess) {
          const createdAt = new Date(profile.created_at);
          const now = new Date();
          const minutesSinceCreation =
            (now.getTime() - createdAt.getTime()) / (1000 * 60);

          // If account was created in the last 5 minutes, consider it a new signup
          if (minutesSinceCreation < 5) {
            setTimeout(() => {
              triggerModal();
            }, 2000); // Show modal 2 seconds after signup
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setHasAccess(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, triggerModal]);

  // Show modal if localStorage was cleared (immediate) or if user doesn't have premium access
  const localStorageCleared =
    typeof window !== 'undefined' &&
    !localStorage.getItem('upgrade_modal_last_shown');
  const userNeedsUpgrade = user && hasAccess === false;

  console.log('Modal state debug:', {
    showModal,
    localStorageCleared,
    userNeedsUpgrade,
    user: !!user,
    hasAccess,
    localStorageValue:
      typeof window !== 'undefined'
        ? localStorage.getItem('upgrade_modal_last_shown')
        : 'server',
  });

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
