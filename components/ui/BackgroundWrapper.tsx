'use client';
import { usePathname } from 'next/navigation';
import bg from '../../app/assets/background.png';
import RecipeBg from '../../app/assets/RecipesBackground.png';
import { ReactNode } from 'react';

const BackgroundWrapper = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const background = pathname.includes('/recipes') ? RecipeBg : bg;
  return (
    <div
      className='bg-background w-full'
      style={{
        backgroundImage: `url(${background.src})`,
        position: 'fixed',
      }}
    >
      {children}
    </div>
  );
};

export default BackgroundWrapper;
