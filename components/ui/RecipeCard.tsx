'use client';

import React from 'react';
import TemplateImage from '../../app/assets/food-placeholder.png';
import RecipeModal from '../RecipeModal';
import { Recipe } from '@/app/types/types';

const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className='w-full rounded-xl border border-gray-400 my-8 overflow-hidden bg-white'
      >
        <div
          className='h-40 w-full'
          style={{
            backgroundImage: `url(${TemplateImage.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* <Image src={TemplateImage} alt='recipe' width={500} height={50} /> */}
        </div>
        <div className='flex flex-col gap-2 p-4'>
          <h2 className='text-xl font-bold'>{recipe.recipe_name}</h2>
          <p>
            Est. Total Time:{' '}
            <span className='font-bold'>{recipe.total_time}</span>
          </p>
          <p>
            Description: <span className='font-bold'>{recipe.description}</span>
          </p>
        </div>
      </div>
      <RecipeModal {...{ recipe, open, setOpen }} />
    </>
  );
};

export default RecipeCard;
