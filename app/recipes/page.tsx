import RecipeList from '@/components/RecipeList';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Recipe } from '../types/types';
import { Message } from '@/components/form-message';

export default async function ProtectedPage({
  searchParams,
}: {
  searchParams: Message;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/');
  }

  const { data: recipes, error } = (await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false })) as {
    data: Recipe[];
    error: any;
  };
  const { data: profiles, error: profileError } = (await supabase
    .from('profiles')
    .select('name')) as { data: { name: string }[]; error: any };

  // console.log(JSON.parse((await aiPrompt()).choices[0].message.content!));

  return <RecipeList {...{ profiles, recipes, searchParams }} />;
}
