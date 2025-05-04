import Footer from '@/components/Footer';
import Navigation from '@/components/ui/Navigation';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';

const page = () => {
  return (
    <>
      <Navigation />
      <div className='h-screen flex flex-col items-center justify-center max-w-5xl text-center mx-auto gap-4 px-4'>
        <CheckCircleIcon className='text-primary w-24 md:w-56 h-auto' />
        <h1 className='text-4xl md:text-7xl font-heading'>
          Thank You for Subscribing!
        </h1>
        <h4 className='max-w-3xl text-lg md:text-xl text-gray-600'>
          Your 24 free AI-generated recipes are ready to download! This
          collection includes delicious options for breakfast, lunch, dinner,
          and dessert with traditional, gluten-free, and vegan variations. Click
          the button below to get cooking!
        </h4>
        <div className='mt-6'>
          <a
            href='/24-free-ai-recipes.pdf'
            download
            className='inline-block bg-primary text-white px-8 py-4 rounded-md font-medium hover:bg-primary/90 transition-colors text-lg'
          >
            Download Your Free Recipes
          </a>
        </div>
        <p className='mt-4 text-sm text-gray-500'>
          Don't forget to check your email for more cooking inspiration and
          exclusive offers!
        </p>
      </div>
      <Footer />
    </>
  );
};

export default page;
