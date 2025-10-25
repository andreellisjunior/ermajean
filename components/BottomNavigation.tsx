'use client';

import { Profile } from '@/types';
import {
  BookOpenIcon,
  CalendarDaysIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  BookOpenIcon as BookOpenSolidIcon,
  CalendarDaysIcon as CalendarDaysSolidIcon,
  UserIcon as UserSolidIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import ProfileSettings from './ProfileSettings';

interface BottomNavigationProps {
  profile?: Profile[] | null;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ profile }) => {
  const pathname = usePathname();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const navItems = [
    {
      name: 'Recipes',
      href: '/recipes',
      icon: BookOpenIcon,
      activeIcon: BookOpenSolidIcon,
    },
    {
      name: 'Meal Plans',
      href: '/meal-plans',
      icon: CalendarDaysIcon,
      activeIcon: CalendarDaysSolidIcon,
    },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-10 safe-area-inset-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = isActive(item.href) ? item.activeIcon : item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1 font-medium">{item.name}</span>
              </Link>
            );
          })}

          {/* Profile Settings Button */}
          <button
            onClick={() => setProfileModalOpen(true)}
            className="flex flex-col items-center py-2 px-3 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            <UserIcon className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Profile</span>
          </button>
        </div>
      </nav>

      {/* Profile Settings Modal */}
      <ProfileSettings
        open={profileModalOpen}
        setOpen={setProfileModalOpen}
        profile={profile}
      />
    </>
  );
};

export default BottomNavigation;
