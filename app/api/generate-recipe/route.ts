import { aiPrompt } from '@/libs/openai';
import { Recipe } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { taste, ingredients, serving, total_time, course, restrictions } =
    await req.json();

  console.log(req.json());

  const aiData = await aiPrompt(
    taste,
    ingredients,
    serving,
    total_time,
    course,
    restrictions
  );

  const result = JSON.parse(aiData.choices[0].message.content!).map(
    (recipe: Recipe & { ingredients: string[]; instructions: string[] }) => ({
      recipe_name: recipe.recipe_name,
      description: recipe.description,
      prep_time: recipe.prep_time,
      cook_time: recipe.cook_time,
      total_time: recipe.total_time,
      servings: recipe.servings,
      difficulty_level: recipe.difficulty_level,
      course: recipe.course,
      ingredients: recipe.ingredients.join('\n'),
      instructions: recipe.instructions.join('\n'),
    })
  );
  return NextResponse.json(result);
}
