import { createClient } from '@/libs/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    console.log('Macro API called');

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('User not authenticated:', authError);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { recipeId, servings } = await req.json();

    console.log('Request data:', { recipeId, servings, userId: user.id });

    if (!recipeId || !servings) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Recipe ID and servings are required' },
        { status: 400 }
      );
    }

    // Get the recipe data
    console.log('Fetching recipe data for ID:', recipeId);
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('recipe_name, ingredients, instructions, servings, user_id')
      .eq('id', recipeId)
      .single();

    console.log('Recipe fetch result:', { recipe, recipeError });

    if (recipeError || !recipe) {
      console.log('Recipe not found or error:', recipeError);
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Check if user owns the recipe
    if (recipe.user_id !== user.id) {
      console.log('User does not own recipe');
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if macros already exist for this recipe
    console.log('Checking for existing macros');
    const { data: existingMacros } = await supabase
      .from('recipes')
      .select('calories, protein, carbs, fat, fiber, sugar, sodium')
      .eq('id', recipeId)
      .single();

    console.log('Existing macros:', existingMacros);

    if (existingMacros && existingMacros.calories) {
      console.log('Using existing macros');
      // Calculate per serving macros
      const originalServings = parseInt(recipe.servings);
      const requestedServings = parseInt(servings);
      const multiplier = requestedServings / originalServings;

      return NextResponse.json({
        calories: Math.round((existingMacros.calories || 0) * multiplier),
        protein: Math.round((existingMacros.protein || 0) * multiplier),
        carbs: Math.round((existingMacros.carbs || 0) * multiplier),
        fat: Math.round((existingMacros.fat || 0) * multiplier),
        fiber: Math.round((existingMacros.fiber || 0) * multiplier),
        sugar: Math.round((existingMacros.sugar || 0) * multiplier),
        sodium: Math.round((existingMacros.sodium || 0) * multiplier),
      });
    }

    // Generate macros using OpenAI
    console.log('Generating macros with OpenAI');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a nutritional analysis expert. Analyze recipes and provide accurate nutritional information per serving.',
        },
        {
          role: 'user',
          content: `Analyze this recipe and provide nutritional information per serving:

Recipe: ${recipe.recipe_name}
Servings: ${recipe.servings}
Ingredients: ${recipe.ingredients}
Instructions: ${recipe.instructions}

Return a JSON object with nutritional information per serving. Use these exact keys with numeric values only:
{
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "fiber": 0,
  "sugar": 0,
  "sodium": 0
}

CRITICAL: Your response must be ONLY the JSON object above with actual calculated values. No markdown, no code blocks, no explanations, no additional text whatsoever.`,
        },
      ],
      temperature: 0.3,
    });

    console.log('OpenAI response:', response.choices[0].message.content);

    // Clean up the response - remove markdown code blocks if present
    let responseContent = response.choices[0].message.content!;
    responseContent = responseContent
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    console.log('Cleaned response:', responseContent);

    let nutritionData;
    try {
      nutritionData = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response content that failed to parse:', responseContent);
      return NextResponse.json(
        { error: 'Failed to parse nutrition data from AI response' },
        { status: 500 }
      );
    }

    // Validate that we have the expected fields
    const requiredFields = [
      'calories',
      'protein',
      'carbs',
      'fat',
      'fiber',
      'sugar',
      'sodium',
    ];
    const missingFields = requiredFields.filter(
      (field) => typeof nutritionData[field] !== 'number'
    );

    if (missingFields.length > 0) {
      console.error(
        'Missing or invalid fields in nutrition data:',
        missingFields
      );
      console.error('Received data:', nutritionData);
      return NextResponse.json(
        {
          error: `Invalid nutrition data: missing or invalid fields: ${missingFields.join(', ')}`,
        },
        { status: 500 }
      );
    }

    // Update the recipe with the generated macros
    const { error: updateError } = await supabase
      .from('recipes')
      .update({
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fat: nutritionData.fat,
        fiber: nutritionData.fiber,
        sugar: nutritionData.sugar,
        sodium: nutritionData.sodium,
      })
      .eq('id', recipeId);

    if (updateError) {
      console.error('Error updating recipe with macros:', updateError);
    }

    // Calculate for requested servings
    const originalServings = parseInt(recipe.servings);
    const requestedServings = parseInt(servings);
    const multiplier = requestedServings / originalServings;

    return NextResponse.json({
      calories: Math.round(nutritionData.calories * multiplier),
      protein: Math.round(nutritionData.protein * multiplier),
      carbs: Math.round(nutritionData.carbs * multiplier),
      fat: Math.round(nutritionData.fat * multiplier),
      fiber: Math.round(nutritionData.fiber * multiplier),
      sugar: Math.round(nutritionData.sugar * multiplier),
      sodium: Math.round(nutritionData.sodium * multiplier),
    });
  } catch (error) {
    console.error('Error generating macros:', error);
    return NextResponse.json(
      { error: 'Failed to generate macros' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
