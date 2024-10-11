import OpenAI from 'openai';
const openai = new OpenAI();

export const aiPrompt = async (
  taste: string = `something savory`,
  serving: string = `4 people`,
  totalTime: string = `1 hour`,
  course: string = `dinner`,
  restrictions?: string
) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful nutritionist that has expert advice and context behind perfecting and crafting reasonable recipes',
      },
      {
        role: 'user',
        content: `Come up with a detailed recipe. I have a taste for ${taste}, I am serving ${serving}, I have ${totalTime} to cook, and I am looking for a ${course} course. ${restrictions ? `I have the following restrictions: ${restrictions}` : ''}. The output of the recipe should include the following details in json format (make sure ingredients and instructions return an array of strings and each ingredient and instruction is a new line): recipe_name, description, prep_time, cook_time, total_time, servings, difficulty_level, course, ingredients, instructions`,
      },
    ],
  });
  return response;
};
