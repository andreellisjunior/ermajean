'use client';

import React, { Dispatch, SetStateAction } from 'react';
import TemplateImage from '../../app/assets/food-placeholder.png';
import { Recipe } from '../../types/config';
import { Message } from './form-message';
import RecipeModal from './RecipeModal';

const RecipeCard = ({
  recipe,
  searchParams,
  profiles,
}: {
  recipe: Recipe;
  searchParams: Message;
  profiles: { name: string; email: string; has_access: boolean }[];
}) => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-gray-400 mb-8 overflow-hidden bg-white hover:shadow-xl hover:cursor-pointer hover:-translate-y-2 transition-all"
      >
        <div
          className="h-40 w-full"
          style={{
            backgroundImage: `url(${TemplateImage.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* <Image src={TemplateImage} alt='recipe' width={500} height={50} /> */}
        </div>
        <div className="flex flex-col gap-2 p-4">
          <h2 className="text-xl font-bold">{recipe.recipe_name}</h2>
          <p>
            Est. Total Time:{' '}
            <span className="font-bold">{recipe.total_time}</span>
          </p>
          <p>
            Description: <span className="font-bold">{recipe.description}</span>
          </p>
          {recipe.calories && (
            <div className="flex gap-4 text-xs text-gray-600 mt-2">
              <span className="bg-blue-100 px-2 py-1 rounded">
                {recipe.calories} cal
              </span>
              <span className="bg-green-100 px-2 py-1 rounded">
                {recipe.protein}g protein
              </span>
              <span className="bg-yellow-100 px-2 py-1 rounded">
                {recipe.carbs}g carbs
              </span>
              <span className="bg-purple-100 px-2 py-1 rounded">
                {recipe.fat}g fat
              </span>
            </div>
          )}
        </div>
      </div>
      <RecipeModal {...{ recipe, open, setOpen, searchParams, profiles }} />
    </>
  );
};

export default RecipeCard;
