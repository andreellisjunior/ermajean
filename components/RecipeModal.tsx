'use client';
import React, { Dispatch, SetStateAction } from 'react';
import Modal from './Modal';
import { DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import TemplateImage from '../app/assets/food-placeholder.png';
import { Recipe } from '@/app/types/types';
import { Button } from './ui/button';
import RecipeSettings from './RecipeSettings';
import { Message } from './form-message';

const RecipeModal = ({
  recipe,
  open,
  setOpen,
  searchParams,
}: {
  recipe: Recipe;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  searchParams: Message;
}) => {
  return (
    <Modal {...{ open, setOpen }}>
      <div className='mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left'>
        <DialogTitle
          as='h3'
          className='text-xl font-semibold leading-6 text-gray-900 capitalize mb-3'
        >
          {recipe.recipe_name}
          <XMarkIcon
            onClick={() => setOpen(false)}
            className='h-6 w-6 text-primary absolute right-3 top-8'
          />
        </DialogTitle>
        <p className='text-gray-500 text-sm'>{recipe.description}</p>
        <div className='py-6 flex flex-col gap-4'>
          <div
            className='h-48 w-full'
            style={{
              backgroundImage: `url(${TemplateImage.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* <Image src={TemplateImage} alt='recipe' width={500} height={50} /> */}
          </div>
          <div className='grid grid-cols-2 grid-rows-3 text-left gap-4 text-sm'>
            <p>
              Prep Time: <span className='font-bold'>{recipe.prep_time}</span>
            </p>
            <p>
              Servings: <span className='font-bold'>{recipe.servings}</span>
            </p>
            <p>
              Cook Time: <span className='font-bold'>{recipe.cook_time}</span>
            </p>
            <p>
              Level:{' '}
              <span className='font-bold capitalize'>
                {recipe.difficulty_level}
              </span>
            </p>
            <p>
              Total Time: <span className='font-bold'>{recipe.total_time}</span>
            </p>
            <p>
              Course:{' '}
              <span className='font-bold capitalize'>{recipe.course}</span>
            </p>
          </div>
          <hr />
          <div className='text-left flex flex-col gap-4'>
            <h3 className='text-lg font-semibold'>Ingredients</h3>
            <ul className='list-disc flex flex-col gap-4'>
              {recipe.ingredients.split('\n').map((ingredients, index) => (
                <li key={index} className='ml-4'>
                  {ingredients}
                </li>
              ))}
            </ul>
          </div>
          <hr />
          <div className='text-left flex flex-col gap-4'>
            <h3 className='text-lg font-semibold'>Instructions</h3>
            <ul className='list-disc flex flex-col gap-4'>
              {recipe.instructions.split('\n').map((instruction, index) => (
                <li key={index} className='ml-4'>
                  {instruction}
                </li>
              ))}
            </ul>
          </div>
          <div className='mt-5 py-3 flex items-center gap-4'>
            <RecipeSettings
              recipeId={recipe.id}
              setOpen={setOpen}
              searchParams={searchParams}
              recipeName={recipe.recipe_name}
            />
            <Button
              variant={'outline'}
              className='w-full gap-2'
              onClick={() => setOpen(false)}
              type='button'
            >
              Close
            </Button>
            <Button variant={'default'} className='w-full' type='submit'>
              Save
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RecipeModal;
