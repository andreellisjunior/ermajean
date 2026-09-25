import {NextResponse} from 'next/server';
import {apiError,requireUser,readJson} from '@/libs/auth';
import {ownedRecipe,saveRecipe,deleteOwnedRecipe} from '@/libs/recipe-service';
import {idSchema} from '@/libs/security/recipe-validation';
import {z} from 'zod';
export async function GET(req:Request){try{const {user,supabase}=await requireUser(req);const id=new URL(req.url).searchParams.get('id');if(id!==null)return NextResponse.json(await ownedRecipe(supabase,user.id,id));const {data,error}=await supabase.from('recipes').select('*').eq('user_id',user.id).order('created_at',{ascending:false});if(error)throw error;return NextResponse.json(data);}catch(error){return apiError(error);}}
export async function POST(req:Request){try{const {user,supabase}=await requireUser(req);const body=await readJson(req) as Record<string,unknown>;const id=body?.id;if(id!==undefined){const {id:_,...changes}=body;return NextResponse.json(await saveRecipe(supabase,user.id,changes,id));}return NextResponse.json(await saveRecipe(supabase,user.id,body),{status:201});}catch(error){return apiError(error);}}
export const PATCH=POST;
export async function DELETE(req:Request){try{const {supabase}=await requireUser(req);const queryId=new URL(req.url).searchParams.get('id');const body=queryId!==null?{id:queryId}:await readJson(req);const {id}=z.object({id:idSchema}).strict().parse(body);await deleteOwnedRecipe(supabase,id);return NextResponse.json({success:true});}catch(error){return apiError(error);}}
