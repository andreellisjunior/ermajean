import RecipeList from '@/components/ui/RecipeList';
import { createClient } from '@/libs/supabase/server';
import { redirect } from 'next/navigation';
import { Recipe } from '@/types/config';
import { Message } from '@/components/ui/form-message';

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
    .select('name, email, has_access')) as {
    data: { name: string; email: string; has_access: boolean }[];
    error: any;
  };

  return <RecipeList {...{ profiles, recipes, searchParams }} />;
}
