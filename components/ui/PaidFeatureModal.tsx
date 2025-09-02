'use client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import config from '@/config';
import apiClient from '@/libs/api';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from './button';

export default function PaidFeatureModal({
  open,
  setOpen,
  title = 'AI Recipe Limit Reached!',
  description = "You've reached your AI recipe limit. Choose a plan to unlock unlimited AI recipes, plus sharing and notes features.",
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  title?: string;
  description?: string;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  // Get the paid plans (exclude free plan)
  const paidPlans = config.stripe.plans.filter((plan) => plan.priceId);

  const handlePlanSelect = async (priceId: string) => {
    setLoading(priceId);
    try {
      const data = (await apiClient.get('/user')) as {
        access: boolean;
      };

      if (data.access) {
        const { url }: { url: string } = await apiClient.post(
          '/stripe/create-portal',
          {
            returnUrl: window.location.href,
          }
        );
        window.location.href = url;
      } else {
        const { url }: { url: string } = await apiClient.post(
          '/stripe/create-checkout',
          {
            priceId,
            successUrl: window.location.href,
            cancelUrl: window.location.href,
            mode: 'subscription',
          }
        );
        window.location.href = url;
      }
    } catch (error) {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-2xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="bg-white px-6 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="flex flex-col items-center gap-4">
                <div className="mx-auto flex shrink-0 items-center justify-center rounded-full h-auto w-24">
                  <div className="flex size-16 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-teal-500">
                    <SparklesIcon
                      aria-hidden="true"
                      className="size-12 text-white"
                    />
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <DialogTitle
                    as="h3"
                    className="text-xl font-semibold text-gray-900"
                  >
                    {title}
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 max-w-md">
                      {description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Plan Options */}
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {paidPlans.map((plan) => (
                  <div
                    key={plan.priceId}
                    className={`relative rounded-lg border-2 p-6 ${
                      plan.isFeatured
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {plan.isFeatured && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          MOST POPULAR
                        </span>
                      </div>
                    )}

                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {plan.name}
                      </h3>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-gray-900">
                          ${plan.price}
                        </span>
                        <span className="text-gray-500">
                          /{plan.name.toLowerCase()}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {plan.description}
                      </p>
                    </div>

                    <ul className="mt-4 space-y-2">
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{feature.name}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full mt-6 ${
                        plan.isFeatured
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                      onClick={() => handlePlanSelect(plan.priceId)}
                      disabled={loading !== null}
                    >
                      {loading === plan.priceId ? (
                        <LoadingSpinner />
                      ) : (
                        `Choose ${plan.name}`
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-center">
              <Button
                type="button"
                onClick={() => setOpen(false)}
                variant="outline"
                size="sm"
                disabled={loading !== null}
              >
                Maybe Next Time
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
