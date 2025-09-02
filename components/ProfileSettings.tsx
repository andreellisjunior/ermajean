'use client';

import {
  deleteUserAction,
  signOutAction,
  updateProfileAction,
} from '@/app/actions';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import config from '@/config';
import apiClient from '@/libs/api';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Dispatch, SetStateAction, useState } from 'react';
import { DeleteWarning } from './DeleteWarning';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import PaidFeatureModal from './ui/PaidFeatureModal';
import { SubmitButton } from './ui/submit-button';

export default function ProfileSettings({
  open,
  setOpen,
  profile,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  profile:
    | { name: string; email: string; location?: string; has_access: boolean }[]
    | null;
}) {
  const [dangerOpen, setDangerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paidModal, setPaidModal] = useState(false);

  return (
    <>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
        />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <DialogPanel
                transition
                className="pointer-events-auto relative w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full"
              >
                <TransitionChild>
                  <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 duration-500 ease-in-out data-[closed]:opacity-0 sm:-ml-10 sm:pr-4">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="relative rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                    >
                      <span className="absolute -inset-2.5" />
                      <span className="sr-only">Close panel</span>
                      <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                    </button>
                  </div>
                </TransitionChild>
                <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                  <div className="px-4 sm:px-6">
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                      Account Settings
                    </DialogTitle>
                  </div>
                  <div className="relative mt-6 flex-1 px-4 sm:px-6">
                    <div className="border-b-2 border-gray-200 pb-8">
                      <h5 className="text-md font-semibold">
                        Profile
                        <p className="text-xs text-gray-500 max-w-64">
                          Review and update your profile information.
                        </p>
                      </h5>
                      <form
                        className="h-full w-full"
                        action={async (formData) => {
                          await updateProfileAction(formData);
                          setOpen(false);
                        }}
                      >
                        <div className="mt-4 text-left">
                          <Label htmlFor="name">Name:</Label>
                          <Input
                            name="name"
                            placeholder="Your name"
                            defaultValue={profile![0].name}
                          />
                        </div>
                        <div className="mt-4 text-left">
                          <Label htmlFor="location">Location:</Label>
                          <p className="text-xs text-gray-600 italic">
                            This is only used to calculate more accurate cost
                            estimates.
                          </p>
                          <Input
                            name="location"
                            defaultValue={profile![0].location ?? `USA`}
                            title="Enter your state, city, or country (default USA)"
                          />
                        </div>
                        <div className="mt-4 text-left">
                          <Label htmlFor="email">Email:</Label>
                          <Input
                            name="email"
                            value={profile![0].email}
                            disabled
                            title="Updating your email coming soon!"
                          />
                        </div>
                        <div className="mt-5 py-3 w-fit ml-auto">
                          {/* <Button
                          variant={'destructive'}
                          className='w-full gap-2'
                          
                        >
                          Sign Out
                        </Button> */}
                          <SubmitButton
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            type="submit"
                            pendingText="Updating..."
                          >
                            Update
                          </SubmitButton>
                        </div>
                      </form>
                    </div>
                    <div className="border-b-2 border-gray-200 py-8 flex justify-between items-center">
                      <h5 className="text-md font-semibold">
                        Subscription
                        <p className="text-xs text-gray-500 max-w-64">
                          Review your subscription and billing information.
                        </p>
                      </h5>
                      {loading ? (
                        <LoadingSpinner />
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          className="text-xs"
                          onClick={async () => {
                            setLoading(true);
                            try {
                              const data = (await apiClient.get('/user')) as {
                                access: boolean;
                              };
                              if (data.access) {
                                const { url }: { url: string } =
                                  await apiClient.post(
                                    '/stripe/create-portal',
                                    {
                                      returnUrl: window.location.href,
                                    }
                                  );

                                window.location.href = url;
                              } else {
                                // For free users, show the paidModal instead
                                setLoading(false);
                                setPaidModal(true);
                              }
                            } catch (error) {
                              setLoading(false);
                            }
                          }}
                        >
                          Subscription
                        </Button>
                      )}
                    </div>
                    <div className="border-b-2 border-gray-200 py-8">
                      <h5 className="text-lg font-semibold">Application</h5>
                      <div className="flex justify-between items-center py-4 text-sm">
                        <div>
                          Refresh Application
                          <p className="text-xs text-gray-500">
                            Having trouble in the app? Refresh it.
                          </p>
                        </div>
                        <a href="/">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            Refresh
                          </Button>
                        </a>
                      </div>
                      <div className="flex justify-between items-center py-4 text-sm">
                        <div>
                          Log out
                          <p className="text-xs text-gray-500">
                            Simply log out of your account.
                          </p>
                        </div>
                        <a href="/">
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            className="text-xs"
                            onClick={() => signOutAction()}
                          >
                            Log out
                          </Button>
                        </a>
                      </div>
                    </div>

                    <div className="border-2 border-red-300 rounded-lg my-8 py-8 px-4 flex flex-col gap-4 text-red-500">
                      <h5 className="text-md font-semibold">
                        DANGER ZONE
                        <p className="text-xs text-gray-500 max-w-64">
                          Permanently delete your account. This action is
                          irreversible.
                        </p>
                      </h5>
                      <Button
                        variant="destructive"
                        size="sm"
                        type="button"
                        className="text-xs"
                        onClick={() => setDangerOpen(true)}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
      <DeleteWarning
        open={dangerOpen}
        setOpen={setDangerOpen}
        title={'Delete Account'}
        desc={
          'Are you sure you want to delete your account? All of your data (including all shared recipes) will be permanently removed. This action cannot be undone.'
        }
        action={deleteUserAction}
      />
      <PaidFeatureModal
        open={paidModal}
        setOpen={setPaidModal}
        title="Choose Your Plan"
        description="Upgrade to unlock unlimited AI recipes, plus sharing and notes features. Choose the plan that works best for you."
      />
    </>
  );
}
