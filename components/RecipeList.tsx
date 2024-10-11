'use client';
import { Recipe } from '@/app/types/types';
import AddNewRecipe from '@/components/AddNewRecipe';
import { Input } from '@/components/ui/input';
import RecipeCard from '@/components/ui/RecipeCard';
import WelcomeModal from '@/components/WelcomeModal';
import { Cog8ToothIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import Modal from './Modal';
import { DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { signOutAction, updateProfileAction } from '@/app/actions';
import { Message } from './form-message';
import { toastDisplay } from '@/app/toastDisplay';
import Image from 'next/image';
import Arrow from '../app/assets/arrrow.png';

const RecipeList = ({
  profiles,
  recipes,
  searchParams,
}: {
  profiles: { name: string }[] | null;
  recipes: Recipe[];
  searchParams: Message;
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState(recipes);
  const [profile, setProfile] = useState(false);

  useEffect(() => {
    if (searchInput === '') {
      setFilteredRecipes(recipes);
    } else {
      setFilteredRecipes(
        recipes.filter((recipe) =>
          recipe.recipe_name.toLowerCase().includes(searchInput.toLowerCase())
        )
      );
    }
  }, [searchInput, recipes]);

  return (
    <div className='flex-1 w-full flex flex-col h-screen'>
      {/* Header and Search */}
      <div className='min-h-60 flex flex-col w-full items-center gap-4 justify-center'>
        <div
          className='flex items-center gap-2'
          onClick={() => setProfile(true)}
        >
          <h1 className='text-3xl italic'>
            Hi,{' '}
            <span className='text-primary'>
              {profiles![0].name ?? 'Friend'}
            </span>
            !
          </h1>
          <Cog8ToothIcon className='h-6 w-auto text-primary' />
        </div>
        <p>What would you like to make today?</p>
        <div className='flex gap-4 w-full max-w-sm'>
          <Input
            name='search'
            placeholder='Search Saved Recipes'
            className='w-full rounded-xl text-center'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {/* Content section */}
      <div className='min-h-44 overflow-y-auto px-4'>
        <div>{/* Filter and categories */}</div>
        <div className='py-12'>
          {/* Recipes */}
          {filteredRecipes?.length === 0 ? (
            <div className='absolute left-1/2 bottom-0 transform -translate-x-1/2 -translate-y-1/4 w-full'>
              <div className='flex flex-col h-[50vh] text-center max-w-72 mx-auto w-full'>
                <p className='text-xl text-gray-600'>
                  Doesn’t look like you have any recipes saved yet.
                </p>
                <p className='tex-xs font-bold'>
                  Click the plus button to get started
                </p>
              </div>
              {/* <Image
                src={Arrow.src}
                width={100}
                height={50}
                alt='arrow image'
                className='absolute left-1/2 bottom-0 transform -translate-x-1/2 -translate-y-1/8 block sm:hidden'
              /> */}
            </div>
          ) : (
            filteredRecipes?.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                searchParams={searchParams}
              />
            ))
          )}
        </div>
      </div>
      {!profiles![0].name && <WelcomeModal />}
      {/* Add Button Modal */}
      <AddNewRecipe {...{ searchParams }} />
      <Modal open={profile} setOpen={setProfile}>
        <DialogTitle
          as='h3'
          className='text-xl font-semibold leading-6 text-gray-900 capitalize mb-3 flex items-center justify-between'
        >
          Profile Settings
          <XMarkIcon
            onClick={() => {
              setProfile(false);
            }}
            className='h-6 w-6 text-primary'
          />
        </DialogTitle>
        <form
          className='h-full'
          action={async (formData) => {
            await updateProfileAction(formData);
            setProfile(false);
            toastDisplay(searchParams);
          }}
        >
          <div className='mt-4 text-left'>
            <Label htmlFor='name'>Name:</Label>
            <Input
              name='name'
              placeholder='Your name'
              defaultValue={profiles![0].name}
            />
          </div>
          <div className='mt-4 text-left'></div>
          <div className='mt-5 py-3 flex items-center gap-4 absolute bottom-0 right-4 left-4'>
            <>
              <Button
                variant={'destructive'}
                className='w-full gap-2'
                type='button'
                onClick={() => signOutAction()}
              >
                Sign Out
              </Button>
              <Button variant={'default'} className='w-full' type='submit'>
                Save
              </Button>
            </>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RecipeList;
