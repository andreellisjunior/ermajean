import Image from 'next/image';
import CTAImage from '../../app/assets/cta-background.jpg';
import { Button } from './button';

export default function CallToAction() {
  return (
    <div className='relative isolate overflow-hidden bg-gray-900 py-16'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-center'>
          <div className='max-w-xl lg:max-w-lg flex flex-col gap-4'>
            <h2 className='text-4xl font-semibold tracking-tight'>
              What are you waiting for?
            </h2>
            <p className='mt-4 text-lg'>
              Start creating, saving and sharing your recipes today. Sign up for
              free and get started in minutes!
            </p>
            <a href='/sign-up'>
              <Button>Get Started For Free Today!</Button>
            </a>
          </div>
        </div>
      </div>
      <Image
        src={CTAImage}
        alt='call to aciton'
        className='absolute inset-0 z-[-1]'
      />
    </div>
  );
}
