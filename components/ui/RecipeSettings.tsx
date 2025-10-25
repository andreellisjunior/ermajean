import { deleteRecipeAction, shareRecipeAction } from '@/app/actions';
import EditRecipe from '@/components/EditRecipe';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { Dispatch, SetStateAction } from 'react';
import { toast } from 'react-toastify';
import { DeleteWarning } from '../DeleteWarning';
import RecipeNotes from '../RecipeNotes';
import { Message } from './form-message';

export default function RecipeSettings({
  recipeId,
  setOpen,
  deleteModal,
  setDeleteModal,
  searchParams,
  recipeName,
  profiles,
}: {
  recipeId: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
  deleteModal: boolean;
  setDeleteModal: Dispatch<SetStateAction<boolean>>;
  searchParams: Message;
  recipeName: string;
  profiles: { has_access: boolean }[];
}) {
  const shareOptions = {
    title: recipeName,
    url: `/recipe/${recipeId}`,
  };
  return (
    <div className="w-full justify-center">
      <div className="flex gap-8">
        <Popover>
          <PopoverButton className="block text-sm/6 font-semibold text-black focus:outline-none data-[active]:text-primary data-[hover]:text-primary data-[focus]:outline-1">
            <Cog6ToothIcon className="h-6 w-6" />
          </PopoverButton>
          <PopoverPanel
            transition
            anchor="top start"
            className="z-50 bg-white/5 backdrop-blur-lg divide-y divide-white/5 rounded-xl text-sm/6 transition duration-200 ease-in-out [--anchor-gap:var(--spacing-5)] data-[closed]:-translate-y-1 data-[closed]:opacity-0 shadow-xl border-[0.5px] border-black/10 w-72"
          >
            <div className="p-3">
              <EditRecipe recipeId={recipeId} />
              <RecipeNotes {...{ recipeName, recipeId, profiles }} />
              <button
                onClick={async () => {
                  try {
                    await shareRecipeAction(recipeId);
                    await navigator.share(shareOptions);
                  } catch (error) {
                    console.error(error);
                  }
                }}
                className="block rounded-lg py-2 px-3 transition hover:bg-primary/5 text-xs text-start w-full"
              >
                <p className="font-semibold text-black">Share</p>
                <p className="text-black/50">
                  Share with your family and friends!
                </p>
              </button>
              <hr className="border-black/15 my-2" />
              <button
                onClick={() => {
                  setDeleteModal(true);
                }}
                className="block rounded-lg py-2 px-3 transition hover:bg-red-500/5 text-xs text-start"
              >
                <p className="font-semibold text-red-500">Delete Recipe</p>
                <p className="text-black/50">
                  Once you delete a recipe, it cannot be undone.
                </p>
              </button>
            </div>
          </PopoverPanel>
        </Popover>
      </div>
      <DeleteWarning
        setOpen={setDeleteModal}
        open={deleteModal}
        title="Delete Recipe"
        desc="Are you sure you want to delete your recipe? This is perminant and cannot be undone."
        action={async () => {
          await deleteRecipeAction(recipeId);
        }}
      />
    </div>
  );
}
