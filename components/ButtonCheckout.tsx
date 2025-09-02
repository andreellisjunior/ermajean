'use client';

import config from '@/config';
import apiClient from '@/libs/api';
import { createClient } from '@/libs/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// This component is used to create Stripe Checkout Sessions
// It calls the /api/stripe/create-checkout route with the priceId, successUrl and cancelUrl
// Users must be authenticated. It will prefill the Checkout data with their email and/or credit card (if any)
// You can also change the mode to "subscription" if you want to create a subscription instead of a one-time payment
const ButtonCheckout = ({
  priceId,
  mode = 'subscription',
}: {
  priceId: string;
  mode?: 'payment' | 'subscription';
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const isFeatured =
    config.stripe.plans.find((plan) => plan.priceId === priceId)?.isFeatured ||
    false;

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, [supabase]);

  const handlePayment = async () => {
    // If not authenticated, redirect to sign-up
    if (isAuthenticated === false) {
      router.push(
        '/sign-up?message=Please create an account to continue with your purchase'
      );
      return;
    }

    // If auth status is still loading, wait
    if (isAuthenticated === null) {
      return;
    }
    setIsLoading(true);

    try {
      // Get the base URL safely
      const baseUrl =
        typeof window !== 'undefined' ? window.location.origin : '';

      const { url }: { url: string } = await apiClient.post(
        '/stripe/create-checkout',
        {
          priceId,
          successUrl: `${baseUrl}/auth/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${baseUrl}/`,
          mode,
        }
      );

      if (url && typeof window !== 'undefined') {
        window.location.href = url;
      } else if (!url) {
        console.error('No checkout URL received from Stripe');
        alert('Failed to create checkout session. Please try again.');
      }
    } catch (e) {
      console.error('Checkout error:', e);

      // Handle authentication errors specifically
      if (
        e?.message?.includes('Authentication required') ||
        e?.status === 401
      ) {
        router.push(
          '/sign-in?message=Please sign in to continue with your purchase'
        );
        return;
      }

      alert('Failed to start checkout. Please try again.');
    }

    setIsLoading(false);
  };

  function classNames(...classes: unknown[]) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <button
      disabled={isLoading}
      className={classNames(
        isFeatured
          ? 'bg-secondary text-primary shadow-sm hover:bg-secondary/90 focus-visible:outline-primary mt-auto'
          : 'bg-primary text-white ring-1 ring-inset ring-secondary hover:ring-secondary hover:bg-primary/90 focus-visible:outline-indigo-600',
        'w-full mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10 transition-all'
      )}
      onClick={() => handlePayment()}
    >
      {isLoading || isAuthenticated === null ? (
        <span className="loading loading-spinner loading-xs">
          loading life change...
        </span>
      ) : isAuthenticated === false ? (
        'Sign Up to Get Started'
      ) : (
        'Get Started'
      )}
    </button>
  );
};

export default ButtonCheckout;
