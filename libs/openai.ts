import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const aiPrompt = async (
  taste: string = `something savory`,
  ingredients?: string,
  serving: string = `4 people`,
  totalTime: string = `1 hour`,
  course: string = `dinner`,
  restrictions?: string,
  location?: string
) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-nano',
    messages: [
      {
        role: 'system',
        content:
          'You are a culinary assistant that generates concise, practical recipes.',
      },
      {
        role: 'user',
        content: `Generate a recipe for ${taste}. ${ingredients ? `Ingredients available: ${ingredients}.` : 'Suggest ingredients.'} Serves ${serving}, time: ${totalTime}, course: ${course}. ${restrictions ? `Restrictions: ${restrictions}.` : ''} Location: ${location ?? 'USA'}, so make sure you gather an accurate estimated cost per serving and accurate estimated savings per serving based on my location. Return JSON with: recipe_name, description, prep_time, cook_time, total_time, servings, difficulty_level, course, ingredients(array), instructions(array), estimated_cost_per_serving, dining_out_cost_per_serving, estimated_savings_per_serving.`,
      },
    ],
    temperature: 0.4,
  });
  return response;
};
