import { aiPrompt } from '@/libs/openai';
import { formatStructuredRecipe } from '@/libs/utils';
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

  try {
    const content = aiData.choices[0].message.content;
    if (!content) {
      return NextResponse.json(
        { error: 'No content received from AI' },
        { status: 500 }
      );
    }

    // With structured outputs, we're guaranteed valid JSON that matches our schema
    const structuredResult = JSON.parse(content);
    const result = formatStructuredRecipe(structuredResult);

    // Format the response for the frontend
    const formattedResult = {
      recipe_name: result.recipe_name,
      description: result.description,
      prep_time: result.prep_time,
      cook_time: result.cook_time,
      total_time: result.total_time,
      servings: result.servings,
      difficulty_level: result.difficulty_level,
      course: result.course,
      ingredients: result.ingredients.join('\n'),
      instructions: result.instructions.join('\n'),
      estimated_cost_per_serving: result.estimated_cost_per_serving,
      dining_out_cost_per_serving: result.dining_out_cost_per_serving,
      estimated_savings_per_serving: result.estimated_savings_per_serving,
    };

    return NextResponse.json(formattedResult);
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    console.error('Raw AI response:', aiData.choices[0].message.content);
    return NextResponse.json(
      { error: 'Failed to generate recipe. Please try again.' },
      { status: 500 }
    );
  }
}
