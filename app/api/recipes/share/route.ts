import {NextResponse} from 'next/server';
import {z} from 'zod';
import {apiError,requireUser,readJson,ApiError} from '@/libs/auth';
import {idSchema} from '@/libs/security/recipe-validation';
export async function POST(req:Request){try{const {supabase}=await requireUser(req);const {recipeId}=z.object({recipeId:idSchema}).strict().parse(await readJson(req));const {data,error}=await supabase.rpc('publish_recipe',{p_recipe_id:recipeId});if(error)throw new ApiError(error.code==='P0002'?404:500,'Could not publish recipe');return NextResponse.json({recipeId,url:`/recipe/${recipeId}`,published:true});}catch(error){return apiError(error);}}
export async function DELETE(req:Request){try{const {supabase}=await requireUser(req);const {recipeId}=z.object({recipeId:idSchema}).strict().parse(await readJson(req));const {error}=await supabase.rpc('revoke_recipe',{p_recipe_id:recipeId});if(error)throw new ApiError(error.code==='P0002'?404:500,'Could not revoke recipe');return NextResponse.json({published:false});}catch(error){return apiError(error);}}
