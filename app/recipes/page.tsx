import AddNewRecipe from '@/components/AddNewRecipe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RecipeCard from '@/components/ui/RecipeCard';
import WelcomeModal from '@/components/WelcomeModal';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/');
  }

  const { data: recipes, error } = await supabase.from('recipes').select('*');
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('name');

  return (
    <div className='flex-1 w-full flex flex-col h-screen'>
      {/* Header and Search */}
      <div className='min-h-60 flex flex-col w-full items-center gap-4 justify-center'>
        <h1 className='text-3xl italic'>
          Hi,{' '}
          <span className='text-primary'>{profiles![0].name ?? 'Friend'}</span>!
        </h1>
        <p>What would you like to make today?</p>
        <div className='flex gap-4'>
          <Input
            name='search'
            placeholder='Search for recipes'
            className='w-auto rounded-xl'
          />
          <Button>Find Recipe</Button>
        </div>
      </div>

      {/* Content section */}
      <div className='min-h-44 overflow-y-auto px-4'>
        <div>{/* Filter and categories */}</div>
        <div className='py-12'>
          {/* Recipes */}
          {recipes?.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
      {!profiles![0].name && <WelcomeModal />}
      {/* Add Button Modal */}
      <AddNewRecipe />
    </div>
  );
}
