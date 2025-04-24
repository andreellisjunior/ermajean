'use client';
import React from 'react';
import { ReactNode } from 'react';
import { HomeIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

type NavButtonProps = {
  leadingIcon: ReactNode;
  title: string;
  href: string;
};

const NavButton = React.memo(
  ({
    leadingIcon = <HomeIcon className='w-auto h-8' />,
    title = 'Default',
    href,
  }: NavButtonProps) => {
    const currentPathname = usePathname();

    return (
      <Link
        href={href}
        className={`flex w-full items-center gap-2 hover:bg-btn-background-hover hover:text-white transition p-3 rounded-xl cursor-pointer font-body lg:flex-row flex-col text-xs lg:text-base ${
          currentPathname == href
            ? `bg-btn-background text-white`
            : `bg-transparent text-gray-600`
        } `}
      >
        {leadingIcon}
        {title}
      </Link>
    );
  }
);

NavButton.displayName = 'NavButton';

export default NavButton;
