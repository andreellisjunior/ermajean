'use client';
import Image from 'next/image';
import { Button } from './button';
import Multiscreen from '../../app/assets/multiscreen.png';
import HomeBG from '../../app/assets/hero-background.jpg';
import Navigation from './Navigation';

export default function Header() {
  return (
    <div
      style={{ backgroundImage: `url(${HomeBG.src})` }}
      className='bg-cover bg-no-repeat bg-center shadow-md max-h-[800px] md:h-[75vh] overflow-hidden'
    >
      <Navigation />
      <div className='relative isolate px-6 py-32 md:px-8 mt-0 lg:mt-16'>
        <div className='relative overflow-hidden'>
          <div className='md:pb-4 md:pt-4'>
            <div className='relative flex flex-col gap-4 items-center mx-auto lg:max-w-5xl px-4 sm:static sm:px-6 md:px-8'>
              <div className='flex flex-col gap-4 text-center capitalize'>
                <h1 className='text-4xl font-bold text-primary md:text-7xl'>
                  Create What you Have Taste for...
                </h1>
                <h2 className='text-2xl font-bold text-gray-900 md:text-3xl'>
                  With What you already have!
                </h2>
                <p className='mt-4 text-xl text-gray-500'>
                  Create, save and share your recipes with family and friends!
                </p>
                <div className='flex flex-col sm:flex-row gap-4 my-4 justify-center'>
                  <a href='/sign-up'>
                    <Button size='lg'>Get Started For Free</Button>
                  </a>
                  <a href='#features'>
                    <Button size='lg' variant='outline'>
                      Learn More
                    </Button>
                  </a>
                </div>
              </div>
              <div className='max-w-4xl mx-auto w-auto block lg:hidden'>
                <Image src={Multiscreen} alt='' width={300} height={500} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
