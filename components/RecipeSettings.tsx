import { deleteRecipeAction } from '@/app/actions';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { Dispatch, SetStateAction } from 'react';

export default function RecipeSettings({
  recipeId,
  setOpen,
}: {
  recipeId: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
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
                onClick={() => {
                  deleteRecipeAction(recipeId);
                  setOpen(false);
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
