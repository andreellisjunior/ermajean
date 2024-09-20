'use client';
import { useState } from 'react';
import Modal from './Modal';
import { DialogTitle } from '@headlessui/react';

import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { addNewRecipeAction } from '@/app/actions';
import ComboInput from './ComboInput';
import DropdownInput from './DropdownInput';

const AddNewRecipe = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className='fixed bottom-5 right-5 shadow-lg shadow-gray-600 rounded-full'>
        <button
          onClick={() => setOpen(!open)}
          className='bg-primary text-primary-foreground p-2 rounded-full'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='size-12'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M12 4.5v15m7.5-7.5h-15'
            />
          </svg>
        </button>
      </div>
      <Modal {...{ open, setOpen }}>
        <form
          action={(formData: FormData) => {
            addNewRecipeAction(formData);
            setOpen(false);
          }}
        >
          <div className='mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left'>
            <DialogTitle
              as='h3'
              className='text-xl font-semibold leading-6 text-gray-900 capitalize mb-3'
            >
              Add New Recipe
              <XMarkIcon
                onClick={() => setOpen(false)}
                className='h-6 w-6 text-primary absolute right-3 top-8'
              />
            </DialogTitle>
            <p className='text-gray-500 text-sm'>
              Add all details as best you can for the recipe. You can add a
              photo when done!
            </p>
            <div className='mt-4 text-left'>
              <Label htmlFor='recipeName'>Name:</Label>
              <Input name='recipeName' placeholder='Recipe Name' />
            </div>
            <div className='mt-4 text-left'>
              <Label htmlFor='desc'>Description:</Label>
              <Input name='desc' placeholder='Description' />
            </div>

            <div className='mt-4 text-left'>
              <Label htmlFor='prepTime'>Prep Time:</Label>
              <ComboInput name='prepTime' />
            </div>

            <div className='mt-4 text-left'>
              <Label htmlFor='cookTime'>Cook Time:</Label>
              <ComboInput name='cookTime' />
            </div>

            <div className='mt-4 text-left'>
              <Label htmlFor='estTotalTiime'>Est. Total Time:</Label>
              <ComboInput name='estTotalTime' />
            </div>

            <div className='mt-4 text-left'>
              <Label htmlFor='servings'>Servings:</Label>
              <Input name='servings' placeholder='2 - 4 Servings' />
            </div>

            <div className='mt-4 text-left'>
              <Label htmlFor='level'>Difficulty Level:</Label>
              <DropdownInput
                name='level'
                items={[
                  { id: 1, name: 'Beginner' },
                  { id: 2, name: 'Easy' },
                  { id: 3, name: 'Medium' },
                  { id: 4, name: 'Hard' },
                  { id: 5, name: 'Yes Chef!' },
                ]}
              />
            </div>

            <div className='mt-4 text-left'>
              <Label htmlFor='course'>Course:</Label>
              <DropdownInput
                name='course'
                items={[
                  { id: 1, name: 'Breakfast' },
                  { id: 2, name: 'Lunch' },
                  { id: 3, name: 'Dinner' },
                  { id: 4, name: 'Snack' },
                ]}
              />
            </div>

            <div className='mt-4 text-left'>
              <Label htmlFor='ingredients'>Ingredients:</Label>
              <Textarea name='ingredients' placeholder='List all ingredients' />
            </div>

            <div className='mt-4 text-left'>
              <Label htmlFor='instructions'>Instructions:</Label>
              <Textarea
                name='instructions'
                placeholder='List your instructions, your way'
              />
            </div>
            <div className='mt-5 py-3 flex items-center gap-4'>
              <Button
                variant={'outline'}
                className='w-full gap-2'
                onClick={() => setOpen(false)}
                type='button'
              >
                Use AI
                <SparklesIcon className='h-6 w-6 text-primary' />
              </Button>
              <Button variant={'default'} className='w-full' type='submit'>
                Save
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AddNewRecipe;
