import { createClient } from '@/utils/supabase/server';
import TemplateImage from '@/app/assets/food-placeholder.png';
import type { Recipe } from '@/app/types/types';

const Recipe = async ({ params }: { params: { id: string } }) => {
  const supabase = createClient();

  const { data: recipes, error } = (await supabase
    .from('recipes')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()) as { data: Recipe; error: any };

  return (
    <div className='flex flex-col gap-4 relative h-screen overflow-y-scroll'>
      <h1 className='text-2xl md:text-4xl text-center font-bold'>
        {recipes.recipe_name}
      </h1>
      <p className='text-gray-800 text-sm'>{recipes.description}</p>
      <div className='py-6 flex flex-col gap-4'>
        <div
          className='h-48 w-full'
          style={{
            backgroundImage: `url(${TemplateImage.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* <Image src={TemplateImage} alt='recipes![0]' width={500} height={50} /> */}
        </div>
        <div className='grid grid-cols-2 grid-rows-3 text-left gap-4 text-sm'>
          <p>
            Prep Time: <span className='font-bold'>{recipes.prep_time}</span>
          </p>
          <p>
            Servings: <span className='font-bold'>{recipes.servings}</span>
          </p>
          <p>
            Cook Time: <span className='font-bold'>{recipes.cook_time}</span>
          </p>
          <p>
            Level:{' '}
            <span className='font-bold capitalize'>
              {recipes.difficulty_level}
            </span>
          </p>
          <p>
            Total Time: <span className='font-bold'>{recipes.total_time}</span>
          </p>
          <p>
            Course:{' '}
            <span className='font-bold capitalize'>{recipes.course}</span>
          </p>
        </div>
        <hr />
        <div className='text-left flex flex-col gap-4'>
          <h3 className='text-lg font-semibold'>Ingredients</h3>
          <ul className='list-disc flex flex-col gap-4'>
            {recipes.ingredients.split('\n').map((ingredients, index) => (
              <li key={index} className='ml-4'>
                {ingredients}
              </li>
            ))}
          </ul>
        </div>
        <hr />
        <div className='text-left flex flex-col gap-4'>
          <h3 className='text-lg font-semibold'>Instructions</h3>
          <ul className='list-disc flex flex-col gap-4'>
            {recipes.instructions.split('\n').map((instruction, index) => (
              <li key={index} className='ml-4'>
                {instruction}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Recipe;
