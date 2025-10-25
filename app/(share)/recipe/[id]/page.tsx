import TemplateImage from '@/app/assets/food-placeholder.png';
import MacroDisplay from '@/components/ui/MacroDisplay';
import { createClient } from '@/libs/supabase/server';
import type { Recipe } from '@/types/config';
import { Metadata } from 'next';
import React from 'react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const id = (await params).id;
  const supabase = createClient();
  const { data: recipes } = (await supabase
    .from('share_recipes')
    .select('*')
    .eq('recipe_id', id)
    .maybeSingle()) as { data: Recipe };

  return {
    title: recipes.recipe_name,
    description: recipes.description,
  };
}

const ShareRecipe = async ({ params }: { params: { id: string } }) => {
  const supabase = createClient();

  const { data: recipes } = (await supabase
    .from('share_recipes')
    .select('*')
    .eq('recipe_id', params.id)
    .maybeSingle()) as { data: Recipe };

  return (
    <div className="flex flex-col gap-4 relative h-auto">
      <h1 className="text-2xl md:text-4xl text-center font-bold">
        {recipes.recipe_name}
      </h1>
      <p className="text-gray-800 text-sm">{recipes.description}</p>
      <div className="py-6 flex flex-col gap-4">
        <div
          className="h-48 w-full"
          style={{
            backgroundImage: `url(${TemplateImage.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* <Image src={TemplateImage} alt='recipes![0]' width={500} height={50} /> */}
        </div>
        <div className="grid grid-cols-2 grid-rows-3 text-left gap-4 text-sm">
          <p>
            Prep Time: <span className="font-bold">{recipes.prep_time}</span>
          </p>
          <p>
            Servings: <span className="font-bold">{recipes.servings}</span>
          </p>
          <p>
            Cook Time: <span className="font-bold">{recipes.cook_time}</span>
          </p>
          <p>
            Level:{' '}
            <span className="font-bold capitalize">
              {recipes.difficulty_level}
            </span>
          </p>
          <p>
            Total Time: <span className="font-bold">{recipes.total_time}</span>
          </p>
          <p>
            Course:{' '}
            <span className="font-bold capitalize">{recipes.course}</span>
          </p>
          {recipes.est_cost && (
            <>
              <p>
                Est. Cost/serv:{' '}
                <span className="font-bold text-green-600">
                  ${recipes.est_cost}
                </span>
              </p>
              <p>
                Est. Savings/serv:{' '}
                <span className="font-bold text-green-600">
                  +${recipes.est_savings}
                </span>
              </p>
            </>
          )}
        </div>
        <hr />
        <div className="text-left flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Ingredients</h3>
          <ul className="list-disc flex flex-col gap-4">
            {recipes.ingredients.split('\n').map((ingredients, index) => (
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
            {recipes.instructions.split('\n').map((instruction, index) => (
              <li key={index} className="ml-4">
                {instruction}
              </li>
            ))}
          </ul>
        </div>
        {/* <MacroDisplay
          recipeId={params.id}
          servings={recipes.servings}
          existingMacros={{
            calories: recipes.calories,
            protein: recipes.protein,
            carbs: recipes.carbs,
            fat: recipes.fat,
            fiber: recipes.fiber,
            sugar: recipes.sugar,
            sodium: recipes.sodium,
          }}
        /> */}
      </div>
    </div>
  );
};

export default ShareRecipe;
