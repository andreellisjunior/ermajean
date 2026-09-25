import {NextResponse} from 'next/server';
import OpenAI from 'openai';
import {estimateNutrition} from '@/libs/ai/nutrition';
import {apiError,ApiError,requireUser,readJson} from '@/libs/auth';
import {ownedRecipe} from '@/libs/recipe-service';
import {macrosRequestSchema,nutritionSchema,perServingNutrition} from '@/libs/security/recipe-validation';
export async function POST(req:Request){
 try{
  const {user,supabase}=await requireUser(req);
  const {recipeId}=macrosRequestSchema.parse(await readJson(req));
  const recipe=await ownedRecipe(supabase,user.id,recipeId);
  const values=Object.fromEntries(Object.keys(nutritionSchema.shape).map(k=>[k,recipe[k]]));
  const existing=nutritionSchema.safeParse(values);
  // Database values are PER SERVING, not totals for the original recipe yield.
  // `servings` remains an accepted legacy input; it must not divide/multiply per-serving data.
  if(existing.success)return NextResponse.json(perServingNutrition(existing.data));
  if(!process.env.OPENAI_API_KEY)throw new ApiError(503,'Nutrition estimates are temporarily unavailable');
  const reservation=await supabase.rpc('begin_nutrition_estimate',{p_recipe_id:recipeId});
  if(reservation.error){const code=reservation.error.code;if(code==='54000')throw new ApiError(429,'Nutrition estimate limit reached. Try again tomorrow.');if(code==='55P03')throw new ApiError(409,'An estimate is already in progress. Try again shortly.');throw new ApiError(503,'Nutrition estimates are temporarily unavailable');}
  const token=reservation.data;
  try{
   const currentRecipe=await ownedRecipe(supabase,user.id,recipeId);
   const ai=new OpenAI({apiKey:process.env.OPENAI_API_KEY,maxRetries:0,timeout:30000});
   const nutrition=await estimateNutrition(ai,currentRecipe);
   const saved=await supabase.rpc('finish_nutrition_estimate',{p_token:token,p_nutrition:nutrition});
   if(saved.error)throw new ApiError(503,'Could not save the nutrition estimate');
   if(!saved.data)throw new ApiError(409,'The recipe changed while its nutrition was estimated. Please try again.');
   return NextResponse.json(nutrition);
  }catch(error){await supabase.rpc('finish_nutrition_estimate',{p_token:token,p_nutrition:null});if(error instanceof ApiError)throw error;throw new ApiError(502,'Nutrition could not be estimated. Please try again.');}
 }catch(error){return apiError(error);}
}
export const runtime='nodejs';
