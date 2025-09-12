import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Define the JSON schema for structured outputs
const recipeSchema = {
  type: 'object',
  properties: {
    recipe_name: {
      type: 'string',
      description: 'The name of the recipe',
    },
    description: {
      type: 'string',
      description: 'A 2-3 sentence description of the dish',
    },
    prep_time: {
      type: 'string',
      description: "Preparation time (e.g., '15 minutes')",
    },
    cook_time: {
      type: 'string',
      description: "Cooking time (e.g., '30 minutes')",
    },
    total_time: {
      type: 'string',
      description: "Total time including prep and cook (e.g., '45 minutes')",
    },
    servings: {
      type: 'string',
      description: "Number of servings (e.g., '4')",
    },
    difficulty_level: {
      type: 'string',
      enum: ['Easy', 'Medium', 'Hard'],
      description: 'Difficulty level of the recipe',
    },
    course: {
      type: 'string',
      description: "Type of meal (e.g., 'dinner', 'breakfast', 'lunch')",
    },
    ingredients: {
      type: 'array',
      items: {
        type: 'string',
      },
      description: 'List of ingredients with precise measurements',
    },
    instructions: {
      type: 'array',
      items: {
        type: 'string',
      },
      description: 'Step-by-step cooking instructions',
    },
    estimated_cost_per_serving: {
      type: 'string',
      description: "Estimated cost per serving with currency (e.g., '$3.50')",
    },
    dining_out_cost_per_serving: {
      type: 'string',
      description:
        "Estimated restaurant cost per serving with currency (e.g., '$12.00')",
    },
    estimated_savings_per_serving: {
      type: 'string',
      description:
        "Estimated savings per serving with currency (e.g., '$8.50')",
    },
  },
  required: [
    'recipe_name',
    'description',
    'prep_time',
    'cook_time',
    'total_time',
    'servings',
    'difficulty_level',
    'course',
    'ingredients',
    'instructions',
    'estimated_cost_per_serving',
    'dining_out_cost_per_serving',
    'estimated_savings_per_serving',
  ],
  additionalProperties: false,
} as const;

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
        content: `You are a professional chef and culinary expert. You create detailed, practical recipes that are easy to follow and cost-effective. Be precise with measurements, cooking times, and instructions. Always provide realistic cost estimates based on the user's location.`,
      },
      {
        role: 'user',
        content: `Create a detailed recipe based on these preferences:

**What I'm craving:** ${taste}
**Available ingredients:** ${ingredients || 'Open to suggestions'}
**Serving size:** ${serving}
**Time available:** ${totalTime}
**Meal type:** ${course}
**Dietary restrictions:** ${restrictions || 'None'}
**Location:** ${location || 'USA'}

Requirements:
- Create a recipe that matches the taste preference and fits within the time constraint
- Use available ingredients when provided, or suggest appropriate ones
- Include precise measurements for all ingredients
- Provide clear, step-by-step instructions
- Calculate realistic cost estimates based on ${location || 'USA'} grocery prices
- Ensure the recipe serves the requested number of people
- Consider any dietary restrictions mentioned`,
      },
    ],
    temperature: 0.7,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'recipe_response',
        schema: recipeSchema,
        strict: true,
      },
    },
  });
  return response;
};
