import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const aiPrompt = async (
  taste: string = `something savory`,
  ingredients?: string,
  serving: string = `4 people`,
  totalTime: string = `1 hour`,
  course: string = `dinner`,
  restrictions?: string,
) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an intelligent culinary assistant, capable of crafting personalized recipes, suggesting creative ingredient combinations, and providing expert cooking guidance tailored to any dietary preference or skill level.",
      },
      {
        role: "user",
        content: `Generate a detailed recipe tailored to my preferences. I am craving ${taste}, ${
          ingredients
            ? `I have the following available ingredients: ${ingredients}`
            : `I do not have specific ingredients so I am open to suggestions`
        }. I am serving ${serving} people. and my total time (prep + cooking) is limited to ${totalTime}. This meal is intended for ${course}. ${
          restrictions
            ? `Please note the dietary restrictions: ${restrictions}`
            : "I have no dietary restrictions"
        }. The output of the recipe should include the following details in json format (make sure ingredients and instructions return an array of strings and each ingredient and instruction is a new line): recipe_name, description, prep_time, cook_time, total_time, servings, difficulty_level, course, ingredients, instructions. It's imperative the ingredients are accurate to the recipe. Only give me my output. I don't need any extra information or the code formatting.`,
      },
    ],
  });
  return response;
};
