import React from 'react';
import {
  DocumentIcon,
  HomeIcon,
  LockClosedIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

import Logo from '@/app/assets/Logo (color).jpg';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Header from './Header';
import NavButton from './ui/NavButton';

const DashboardNav = async () => {
  return (
    <nav className='flex flex-col gap-4 p-4 lg:w-64 w-full bg-white border-r border-gray-200 sticky bottom-0 z-10 lg:relative lg:min-h-screen'>
      <div className='flex lg:flex-col flex-row gap-4 w-full overflow-x-auto lg:overflow-visible'>
        <NavButton
          href='/dashboard'
          leadingIcon={<HomeIcon className='w-5 h-5' />}
          title='Dashboard'
        />
        <NavButton
          href='/dashboard/passwords'
          leadingIcon={<LockClosedIcon className='w-5 h-5' />}
          title='Passwords'
        />
        <NavButton
          href='/dashboard/documents'
          leadingIcon={<DocumentIcon className='w-5 h-5' />}
          title='Documents'
        />
        <NavButton
          href='/dashboard/beneficiaries'
          leadingIcon={<UserGroupIcon className='w-5 h-5' />}
          title='Beneficiaries'
        />
      </div>
    </nav>
  );
};

export default DashboardNav;
