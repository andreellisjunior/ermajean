import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { useState } from 'react';

const times: { id: number; name: string; value: number }[] = [];

for (let i = 5, id = 1; i <= 120; i += 5, id++) {
  const hours = Math.floor(i / 60);
  const minutes = i % 60;
  let name = '';
  if (hours > 0) {
    name += `${hours}hr${hours > 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    name += ` ${minutes}min`;
  }
  const value = (hours * 60 + minutes) * 60 * 1000; // Convert to milliseconds
  times.push({ id, name: name.trim(), value });
}

export default function ComboInput({ name }: { name: string }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(times[1]);

  const filteredTimes =
    query === ''
      ? times
      : times.filter((person) => {
          return person.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <div className='mx-auto h-auto'>
      <Combobox
        value={selected}
        onChange={(value) => setSelected(value!)}
        onClose={() => setQuery('')}
      >
        <div className='relative'>
          <ComboboxInput
            name={name}
            className={clsx(
              'w-full rounded-lg bg-offwhite py-1.5 pr-8 pl-3 text-sm/6 ',
              'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25',
              'border border-input'
            )}
            placeholder='Select a person'
            displayValue={(person: { id: string; name: string }) =>
              person?.name
            }
            onChange={(event) => setQuery(event.target.value)}
            required
          />
          <ComboboxButton className='group absolute inset-y-0 right-0 px-2.5'>
            <ChevronDownIcon className='size-4 fill-black group-data-[hover]:fill-black' />
          </ComboboxButton>
        </div>

        <ComboboxOptions
          anchor='bottom'
          transition
          className={clsx(
            'w-[var(--input-width)] rounded-xl border border-white/5 bg-white/5 p-1 [--anchor-gap:var(--spacing-1)] empty:invisible',
            'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0',
            'z-50 backdrop-blur-md border-[1px] border-gray-200'
          )}
        >
          {filteredTimes.map((person) => (
            <ComboboxOption
              key={person.id}
              value={person}
              className='group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-primary data-[focus]:text-primary-foreground'
            >
              <CheckIcon className='invisible size-4 data-[focus]:fill-white group-data-[selected]:visible' />
              <div className='text-sm/6'>{person.name}</div>
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}
