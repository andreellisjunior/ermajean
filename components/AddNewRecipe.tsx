'use client';
import { useState } from 'react';
import Modal from './Modal';
import { DialogTitle } from '@headlessui/react';

import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { addAIRecipeAction, addNewRecipeAction } from '@/app/actions';
import ComboInput from './ComboInput';
import DropdownInput from './DropdownInput';
import LoadingSpinner from './ui/LoadingSpinner';
import { toastDisplay } from '@/app/toastDisplay';
import { Message } from './form-message';
import { SubmitButton } from './submit-button';
import { toast } from 'react-toastify';

const AddNewRecipe = ({ searchParams }: { searchParams: Message }) => {
  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const aiForm = () => {
    return (
      <>
        <DialogTitle
          as='h3'
          className='text-xl font-semibold leading-6 text-rose-900 capitalize mb-3'
        >
          Add New Recipe AI
          <XMarkIcon
            onClick={() => {
              setOpen(false);
              setTimeout(() => {
                setAiOpen(false);
              }, 1000);
            }}
            className='h-6 w-6 text-primary absolute right-3 top-8'
          />
        </DialogTitle>
        <p className='text-gray-500 text-sm'>
          Add all details as best you can for the recipe. You can add a photo
          when done!
        </p>
        <div className='mt-4 text-left'>
          <Label htmlFor='taste'>What do you have taste for?</Label>
          <Input
            name='taste'
            placeholder='Balanced chicken meal with a lot of veggies'
            required
          />
        </div>
        <div className='mt-4 text-left'>
          <Label htmlFor='serving'>How many are eating?</Label>
          <Input name='serving' placeholder='5 people, just me' required />
        </div>
        <div className='mt-4 text-left'>
          <Label htmlFor='total_time'>How much total time do you have?</Label>
          <Input
            name='total_time'
            placeholder='1 hour?, 2 hours?, 30 min.?'
            required
          />
        </div>
        <div className='mt-4 text-left'>
          <Label htmlFor='restrictions'>
            List dietary restrictions (if any):
          </Label>
          <Input
            name='restrictions'
            placeholder='Vegan, keto, no restriction'
          />
        </div>
        <div className='mt-4 text-left'>
          <Label htmlFor='course'>Which course is this meal?</Label>
          <Input
            name='course'
            placeholder='Breakfast, lunch, dinner, or snack'
            required
          />
        </div>
      </>
    );
  };
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
          action={async (formData: FormData) => {
            setLoading(true);
            aiOpen
              ? await addAIRecipeAction(formData)
              : await addNewRecipeAction(formData);
            setOpen(false);
            setLoading(false);
            setAiOpen(false);
            toast.success('Recipe saved successfully');
          }}
        >
          <div className='mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left'>
            {aiOpen ? (
              aiForm()
            ) : (
              <>
                <DialogTitle
                  as='h3'
                  className='text-xl font-semibold leading-6 text-gray-900 capitalize mb-3 flex items-center justify-between text-left gap-2'
                >
                  Add New Recipe
                  <XMarkIcon
                    onClick={() => {
                      setOpen(false);
                    }}
                    className='h-6 w-6 text-primary'
                  />
                </DialogTitle>
                <p className='text-gray-500 text-sm text-left'>
                  Add all details as best you can for the recipe. You can add a
                  photo when done!
                </p>
                <div className='mt-4 text-left'>
                  <Label htmlFor='recipeName'>Name:</Label>
                  <Input name='recipeName' placeholder='Recipe Name' required />
                </div>
                <div className='mt-4 text-left'>
                  <Label htmlFor='desc'>Description:</Label>
                  <Input name='desc' placeholder='Description' required />
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
                  <Input
                    name='servings'
                    placeholder='2 - 4 Servings'
                    required
                  />
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
                  <Textarea
                    name='ingredients'
                    placeholder='List all ingredients'
                    required
                  />
                </div>
                <div className='mt-4 text-left'>
                  <Label htmlFor='instructions'>Instructions:</Label>
                  <Textarea
                    name='instructions'
                    placeholder='List your instructions, your way'
                    required
                  />
                </div>
              </>
            )}
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className='mt-5 py-3 flex items-center gap-4 sticky bottom-0 right-0'>
                {aiOpen ? (
                  <div className='flex flex-col w-full gap-4'>
                    <SubmitButton
                      variant={'outline'}
                      className='w-full gap-2 border-primary'
                      type='submit'
                      pendingText='Generating...'
                    >
                      GENERATE
                      <SparklesIcon className='h-6 w-6 text-primary' />
                    </SubmitButton>
                    <Button
                      variant={'ghost'}
                      type='button'
                      onClick={() => setAiOpen(false)}
                    >
                      Go Back
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      variant={'outline'}
                      className='w-full gap-2'
                      onClick={(e) => {
                        e.preventDefault();
                        setAiOpen(true);
                      }}
                      type='button'
                    >
                      Use AI
                      <SparklesIcon className='h-6 w-6 text-primary' />
                    </Button>
                    <Button
                      variant={'default'}
                      className='w-full'
                      type='submit'
                    >
                      Save
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AddNewRecipe;
