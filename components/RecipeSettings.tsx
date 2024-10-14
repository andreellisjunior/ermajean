import { deleteRecipeAction } from '@/app/actions';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { Dispatch, SetStateAction } from 'react';
import { Message } from './form-message';
import { toastDisplay } from '@/app/toastDisplay';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { title } from 'process';

export default function RecipeSettings({
  recipeId,
  setOpen,
  searchParams,
}: {
  recipeId: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
  searchParams: Message;
}) {
  const shareOptions = {
    title: 'Share Recipe',
    text: recipeId,
    url: `/recipe/${recipeId}`,
  };
  return (
    <div className='w-full justify-center'>
      <div className='flex gap-8'>
        <Popover>
          <PopoverButton className='block text-sm/6 font-semibold text-black focus:outline-none data-[active]:text-primary data-[hover]:text-primary data-[focus]:outline-1'>
            <Cog6ToothIcon className='h-6 w-6' />
          </PopoverButton>
          <PopoverPanel
            transition
            anchor='top start'
            className='z-50 bg-white/5 backdrop-blur-lg divide-y divide-white/5 rounded-xl text-sm/6 transition duration-200 ease-in-out [--anchor-gap:var(--spacing-5)] data-[closed]:-translate-y-1 data-[closed]:opacity-0 shadow-xl border-[0.5px] border-black/10 w-72'
          >
            <div className='p-3'>
              <button
                onClick={async () => {
                  await navigator.share(shareOptions);
                }}
                className='block rounded-lg py-2 px-3 transition hover:bg-primary/5 text-xs text-start w-full'
              >
                <p className='font-semibold text-black'>Share Recipe</p>
                <p className='text-black/50'>
                  Share with your family and friends!
                </p>
              </button>
              <hr className='border-black/15 my-2' />
              <button
                onClick={async () => {
                  await deleteRecipeAction(recipeId);
                  setOpen(false);
                  toast.success('Recipe deleted successfully');
                }}
                className='block rounded-lg py-2 px-3 transition hover:bg-red-500/5 text-xs text-start'
              >
                <p className='font-semibold text-red-500'>Delete Recipe</p>
                <p className='text-black/50'>
                  Once you delete a recipe, it cannot be undone.
                </p>
              </button>
            </div>
          </PopoverPanel>
        </Popover>
      </div>
    </div>
  );
}
