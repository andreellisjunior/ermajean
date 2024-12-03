'use client';
import React from 'react';
import Modal from './ui/Modal';
import { DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const RecipeNotes = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className='block rounded-lg py-2 px-3 transition hover:bg-primary/5 text-xs text-start w-full'
      >
        <p className='font-semibold text-black'>Notes</p>
        <p className='text-black/50'>
          List all your notes and tips for this recipe.
        </p>
      </button>
      <Modal {...{ open, setOpen }}>
        <DialogTitle
          as='h3'
          className='text-xl font-semibold leading-6 text-gray-900 capitalize mb-3 flex items-center justify-between text-left gap-2 w-full'
        >
          Notes for [Recipe Name]
          <XMarkIcon
            onClick={() => {
              setOpen(false);
            }}
            className='h-6 w-6 text-primary hover:cursor-pointer'
          />
        </DialogTitle>
        <div className='p-3'>
          <h2 className='text-xl font-bold'>Notes</h2>
          <textarea
            className='w-full h-32 border border-gray-400 rounded-lg p-2'
            placeholder='Add your notes here...'
          />
        </div>
      </Modal>
    </>
  );
};

export default RecipeNotes;
