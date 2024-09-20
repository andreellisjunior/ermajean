'use client';

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { useState } from 'react';

export default function DropdownInput({
  name,
  items,
}: {
  name: string;
  items: { id: number; name: string }[];
}) {
  const [selected, setSelected] = useState(items[1]);

  return (
    <div className='mx-auto h-auto'>
      <Listbox name={name} value={selected} onChange={setSelected}>
        <ListboxButton
          className={clsx(
            'relative block w-full rounded-lg bg-offwhite py-1.5 pr-8 pl-3 text-left text-sm/6',
            'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25',
            'border border-input'
          )}
        >
          {selected.name}
          <ChevronDownIcon
            className='group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-black'
            aria-hidden='true'
          />
        </ListboxButton>
        <ListboxOptions
          anchor='bottom'
          transition
          className={clsx(
            'w-[var(--button-width)] rounded-xl border border-white/5 bg-white/5 p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none',
            'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0',
            'z-50 backdrop-blur-md border-[1px] border-gray-200'
          )}
        >
          {items.map((item) => (
            <ListboxOption
              key={item.name}
              value={item}
              className='group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-primary data-[focus]:text-primary-foreground'
            >
              <CheckIcon className='invisible size-4 data-[focus]:fill-white group-data-[selected]:visible' />
              <div className='text-sm/6'>{item.name}</div>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
}
