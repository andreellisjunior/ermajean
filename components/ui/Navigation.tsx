'use client';

import { Dialog, DialogPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Button } from './button';
import Logo from '@/app/assets/Logo (color).jpg';
import Image from 'next/image';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Features', href: '/#features' },
    { name: 'Contact', href: 'mailto:support@ermajean.com' },
  ];

  return (
    <header className='absolute inset-x-0 top-0 z-50'>
      <nav
        aria-label='Global'
        className='flex items-center justify-between p-6 md:px-8'
      >
        <div className='flex md:flex-1'>
          <a href='#' className='-m-1.5 p-1.5'>
            <span className='sr-only'>ErmaJean</span>
            <Image src={Logo} alt='logo' width={150} height={150} />
          </a>
        </div>
        <div className='flex md:hidden'>
          <button
            type='button'
            onClick={() => setMobileMenuOpen(true)}
            className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700'
          >
            <span className='sr-only'>Open main menu</span>
            <Bars3Icon aria-hidden='true' className='h-6 w-6' />
          </button>
        </div>
        <div className='hidden md:flex md:gap-x-12'>
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className='text-sm/6 font-semibold text-gray-900'
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className='hidden md:flex md:flex-1 md:justify-end md:gap-4'>
          <a href='/sign-in' className='text-sm/6 font-semibold text-gray-900'>
            <Button variant='link'>Sign In</Button>
          </a>
          <a href='/sign-up' className='text-sm/6 font-semibold text-gray-900'>
            <Button>Get Started Free</Button>
          </a>
        </div>
      </nav>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className='md:hidden'
      >
        <div className='fixed inset-0 z-50' />
        <DialogPanel className='fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[#F7F7ED] px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10'>
          <div className='flex items-center justify-between'>
            <div className='flex md:flex-1'>
              <a href='#' className='-m-1.5 p-1.5'>
                <span className='sr-only'>ErmaJean</span>
                <Image src={Logo} alt='logo' width={150} height={150} />
              </a>
            </div>
            <button
              type='button'
              onClick={() => setMobileMenuOpen(false)}
              className='-m-2.5 rounded-md p-2.5 text-gray-700'
            >
              <span className='sr-only'>Close menu</span>
              <XMarkIcon aria-hidden='true' className='h-6 w-6' />
            </button>
          </div>
          <div className='mt-6 flow-root'>
            <div className='-my-6 divide-y divide-gray-500/10'>
              <div className='space-y-2 py-6'>
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className='-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-primary hover:text-primary-foreground transition-colors'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className='py-6 flex flex-col gap-4'>
                <a
                  href='/sign-in'
                  className='text-sm/6 font-semibold text-gray-900'
                >
                  <Button variant='link'>Sign In</Button>
                </a>
                <a
                  href='/sign-up'
                  className='text-sm/6 font-semibold text-gray-900'
                >
                  <Button>Get Started Free</Button>
                </a>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
};

export default Navigation;
