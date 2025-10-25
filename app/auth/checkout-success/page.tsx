'use client';

import { createClient } from '@/libs/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const handleAutoLogin = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setIsLoading(false);
        return;
      }

      try {
        // Get session details from Stripe (this will work client-side for completed sessions)
        const response = await fetch(
          `/api/stripe/session-details?session_id=${sessionId}`
        );
        const sessionData = await response.json();

        if (!response.ok) {
          throw new Error(sessionData.error || 'Failed to get session details');
        }

        const customerEmail = sessionData.customer_email;

        if (!customerEmail) {
          throw new Error('No email found in session');
        }

        // Since users must be authenticated before checkout, just redirect to recipes
        setEmail(customerEmail);
        setSuccess(true);
        setIsLoading(false);
        setTimeout(() => {
          router.push(
            '/recipes?message=Payment successful! Welcome to premium recipes'
          );
        }, 2000);
      } catch (err) {
        console.error('Auto-login error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsLoading(false);
      }
    };

    handleAutoLogin();
  }, [sessionId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Login Error
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/sign-in')}
              className="btn btn-primary btn-block"
            >
              Go to Sign In
            </button>
            <button
              onClick={() => router.push('/')}
              className="btn btn-outline btn-block"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-6">
              Your payment has been processed successfully! You now have access
              to premium recipes.
              {email && (
                <>
                  <br />
                  <strong>{email}</strong>
                </>
              )}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Redirecting in a few seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">Processing your payment...</h1>
        <p className="text-gray-600">
          Please wait while we confirm your payment and activate your premium
          access.
        </p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">Loading...</h1>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
