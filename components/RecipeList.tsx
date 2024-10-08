'use client';
import { Recipe } from '@/app/types/types';
import AddNewRecipe from '@/components/AddNewRecipe';
import { Input } from '@/components/ui/input';
import RecipeCard from '@/components/ui/RecipeCard';
import WelcomeModal from '@/components/WelcomeModal';
import { useEffect, useState } from 'react';

const RecipeList = ({
  profiles,
  recipes,
}: {
  profiles: { name: string }[];
  recipes: Recipe[];
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState(recipes);

  useEffect(() => {
    if (searchInput === '') {
      setFilteredRecipes(recipes);
    } else {
      setFilteredRecipes(
        recipes.filter((recipe) =>
          recipe.recipe_name.toLowerCase().includes(searchInput.toLowerCase())
        )
      );
    }
  }, [searchInput, recipes]);

  return (
    <div className='flex-1 w-full flex flex-col h-screen'>
      {/* Header and Search */}
      <div className='min-h-60 flex flex-col w-full items-center gap-4 justify-center'>
        <h1 className='text-3xl italic'>
          Hi,{' '}
          <span className='text-primary'>{profiles![0].name ?? 'Friend'}</span>!
        </h1>
        <p>What would you like to make today?</p>
        <div className='flex gap-4 w-full max-w-sm'>
          <Input
            name='search'
            placeholder='Search for recipes'
            className='w-full rounded-xl text-center'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {/* Content section */}
      <div className='min-h-44 overflow-y-auto px-4'>
        <div>{/* Filter and categories */}</div>
        <div className='py-12'>
          {/* Recipes */}
          {filteredRecipes?.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
      {!profiles![0].name && <WelcomeModal />}
      {/* Add Button Modal */}
      <AddNewRecipe />
    </div>
  );
};

export default RecipeList;
