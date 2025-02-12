import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const aiPrompt = async (
  taste: string = `something savory`,
  ingredients?: string,
  serving: string = `4 people`,
  totalTime: string = `1 hour`,
  course: string = `dinner`,
  restrictions?: string,
  location?: string,
) => {
  console.log(
    `Generate a detailed and cost effective recipe tailored to my preferences. I am craving ${taste}, ${
      ingredients
        ? `I have the following available ingredients: ${ingredients}`
        : `I do not have specific ingredients so I am open to suggestions`
    }. I am serving ${serving} people. and my total time (prep + cooking) is limited to ${totalTime}. This meal is intended for ${course}. ${
      restrictions
        ? `Please note the dietary restrictions: ${restrictions}`
        : "I have no dietary restrictions"
    }. My location is the ${location ?? `USA`}, so make sure you gather an estimate cost per serving and estimated savings. Give me the best, most accurate option to my preferences as possible. The output should include the following details in json format (make sure ingredients and instructions return an array of strings and each ingredient and instruction is a new line): recipe_name, description, prep_time, cook_time, total_time, servings, difficulty_level, course, ingredients, instructions, estimated_cost_per_serving, dining_out_cost_per_serving, estimated_savings_per_serving(subtract estimated_cost from dining_out_cost_per_serving). It's imperative the ingredients are accurate to the recipe. Only give me my output. I don't need any extra information or the code formatting.`,
  );
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
        content: `Generate a detailed and cost effective recipe tailored to my preferences. I am craving ${taste}, ${
          ingredients
            ? `I have the following available ingredients: ${ingredients}`
            : `I do not have specific ingredients so I am open to suggestions`
        }. I am serving ${serving} people. and I only have ${totalTime} to make this meal. This meal is intended for ${course}. ${
          restrictions
            ? `Please note the dietary restrictions: ${restrictions}`
            : "I have no dietary restrictions"
        }. My location is ${location ?? `USA`}, so make sure you gather an accurate estimated cost per serving and accurate estimated savings per serving based on my location. Give me the best, most accurate option to my preferences as possible. The output should include the following details in json format (make sure ingredients and instructions return an array of strings and each ingredient and instruction is a new line): recipe_name, description, prep_time, cook_time, total_time, servings, difficulty_level, course, ingredients(do not include cost), instructions, estimated_cost_per_serving(include dollars and cents), dining_out_cost_per_serving(include dollars and cents), estimated_savings_per_serving(subtract estimated_cost from dining_out_cost_per_serving - include dollars and cents). It's imperative the ingredients are accurate to the recipe. Only give me my output. I don't need any extra information or the code formatting`,
      },
    ],
    temperature: 0.25,
  });
  return response;
};
