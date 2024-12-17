"use client";
import { Dispatch, SetStateAction, useState } from "react";
import {
  ExclamationTriangleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Button } from "./button";
import apiClient from "@/libs/api";
import config from "@/config";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function PaidFeatureModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [loading, setLoading] = useState(false);
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
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="flex flex-col items-center gap-4">
                <div className="mx-auto flex shrink-0 items-center justify-center rounded-full h-auto w-24">
                  <div className="flex size-16 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-teal-500">
                    <SparklesIcon
                      aria-hidden="true"
                      className="size-12 text-white"
                    />
                  </div>
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0">
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold text-gray-900"
                  >
                    You&apos;ve discovered a <i>Paid Feature!</i>
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 max-w-sm">
                      This feature is only available to our premium users. Get
                      started now with a{" "}
                      <span className="font-extrabold underline italic">
                        7-day free trial
                      </span>{" "}
                      to unlock all the features!
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white px-4 py-6 flex items-center justify-center gap-4">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Button
                    type="button"
                    size="sm"
                    onClick={async () => {
                      setLoading(true);
                      const data = (await apiClient.get("/user")) as {
                        access: boolean;
                      };
                      if (data.access) {
                        const { url }: { url: string } = await apiClient.post(
                          "/stripe/create-portal",
                          {
                            returnUrl: window.location.href,
                          },
                        );

                        window.location.href = url;
                      } else {
                        const { url }: { url: string } = await apiClient.post(
                          "/stripe/create-checkout",
                          {
                            priceId: config.stripe.plans[0].priceId,
                            successUrl: window.location.href,
                            cancelUrl: window.location.href,
                            mode: "subscription",
                          },
                        );

                        window.location.href = url;
                      }
                    }}
                  >
                    Start 7-Day Free Trial
                  </Button>
                  <Button
                    type="button"
                    data-autofocus
                    onClick={() => setOpen(false)}
                    variant="outline"
                    size="sm"
                  >
                    Go Back
                  </Button>
                </>
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
