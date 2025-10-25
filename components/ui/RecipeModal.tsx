'use client';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/types/config';
import { DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import React, { Dispatch, SetStateAction, useState } from 'react';
import TemplateImage from '../../app/assets/food-placeholder.png';
import MacroDisplay from './MacroDisplay';
import Modal from './Modal';
import RecipeSettings from './RecipeSettings';
import { Message } from './form-message';

const RecipeModal = ({
  recipe,
  open,
  setOpen,
  searchParams,
  profiles,
}: {
  recipe: Recipe;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  searchParams: Message;
  profiles: { name: string; email: string; has_access: boolean }[];
}) => {
  const [deleteModal, setDeleteModal] = useState(false);
  const [tip, setTip] = useState(false);
  return (
    <>
      <Modal {...{ open, setOpen }} height="h-auto">
        <div className="mt-3 text-center sm:mt-0 sm:text-left w-auto">
          <DialogTitle
            as="h3"
            className="text-xl font-semibold leading-6 text-gray-900 capitalize mb-3 flex items-center justify-between text-left gap-4"
          >
            {recipe.recipe_name}
            <XMarkIcon
              onClick={() => setOpen(false)}
              className="h-6 w-6 text-primary"
            />
          </DialogTitle>
          <p className="text-gray-500 text-sm">{recipe.description}</p>
          <div className="py-6 flex flex-col gap-4">
            <div
              className="h-48 w-full"
              style={{
                backgroundImage: `url(${TemplateImage.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* <Image src={TemplateImage} alt='recipe' width={500} height={50} /> */}
            </div>
            <div className="grid grid-cols-2 grid-rows-3 text-left gap-4 text-sm">
              <p>
                Prep Time: <span className="font-bold">{recipe.prep_time}</span>
              </p>
              <p>
                Servings: <span className="font-bold">{recipe.servings}</span>
              </p>
              <p>
                Cook Time: <span className="font-bold">{recipe.cook_time}</span>
              </p>
              <p>
                Level:{' '}
                <span className="font-bold capitalize">
                  {recipe.difficulty_level}
                </span>
              </p>
              <p>
                Total Time:{' '}
                <span className="font-bold">{recipe.total_time}</span>
              </p>
              <p>
                Course:{' '}
                <span className="font-bold capitalize">{recipe.course}</span>
              </p>
              {recipe.est_cost && (
                <>
                  <p>
                    Est. Cost/serv:{' '}
                    <span className="font-bold text-green-600">
                      {recipe.est_cost.includes('$')
                        ? recipe.est_cost
                        : `$${recipe.est_cost}`}
                    </span>
                    <InformationCircleIcon
                      onClick={() => setTip(true)}
                      className="h-4 w-auto text-gray-400"
                    />
                  </p>
                  <p>
                    Est. Savings/serv:{' '}
                    <span className="font-bold text-green-600">
                      {recipe.est_savings.includes('$')
                        ? recipe.est_savings
                        : `$${recipe.est_savings}`}
                    </span>
                    <InformationCircleIcon
                      onClick={() => setTip(true)}
                      className="h-4 w-auto text-gray-400"
                    />
                  </p>
                </>
              )}
            </div>
            <hr />
            <div className="text-left flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Ingredients</h3>
              <ul className="list-disc flex flex-col gap-4">
                {recipe.ingredients.split('\n').map((ingredients, index) => (
                  <li key={index} className="ml-4">
                    {ingredients}
                  </li>
                ))}
              </ul>
            </div>
            <hr />
            <div className="text-left flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Instructions</h3>
              <ul className="list-disc flex flex-col gap-4">
                {recipe.instructions.split('\n').map((instruction, index) => (
                  <li key={index} className="ml-4">
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>
            <MacroDisplay
              recipeId={recipe.id}
              servings={recipe.servings}
              existingMacros={{
                calories: recipe.calories,
                protein: recipe.protein,
                carbs: recipe.carbs,
                fat: recipe.fat,
                fiber: recipe.fiber,
                sugar: recipe.sugar,
                sodium: recipe.sodium,
              }}
            />
            <div className="mt-5 py-3 flex items-center gap-4">
              <RecipeSettings
                recipeId={recipe.id}
                setOpen={setOpen}
                setDeleteModal={setDeleteModal}
                deleteModal={deleteModal}
                searchParams={searchParams}
                recipeName={recipe.recipe_name}
                profiles={profiles}
              />
              <Button
                variant={'outline'}
                className="w-full gap-2"
                onClick={() => setOpen(false)}
                type="button"
              >
                Close
              </Button>
              {/* <Button variant={'default'} className='w-full' type='submit'>
              Save
            </Button> */}
            </div>
          </div>
        </div>
      </Modal>
      <Modal open={tip} setOpen={setTip} height="h-auto">
        <div className="flex flex-col gap-4">
          <DialogTitle
            as="h3"
            className="text-xl font-semibold leading-6 text-gray-900 capitalize mb-3 flex items-center justify-between text-left gap-4"
          >
            Tip
            <XMarkIcon
              onClick={() => setTip(false)}
              className="hover:cursor-pointer h-6 w-6 text-primary"
            />
          </DialogTitle>
          <p>
            This is an estimated cost and savings analysis based on your set
            location in profile settings. Default is USA.
          </p>
          <Button
            variant="default"
            className="sm:ml-auto"
            onClick={() => setTip(false)}
          >
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default RecipeModal;
