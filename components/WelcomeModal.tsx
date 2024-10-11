'use client';
import React, { useState } from 'react';
import Modal from './Modal';
import { DialogTitle } from '@headlessui/react';
import { Label } from './ui/label';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { addProfileNameAction } from '@/app/actions';
import { toast } from 'react-toastify';

const WelcomeModal = () => {
  const [open, setOpen] = useState(true);

  return (
    <Modal {...{ open, setOpen }} height='h-auto'>
      <div className='mt-3 sm:ml-4 sm:mt-0 sm:text-left'>
        <DialogTitle
          as='h3'
          className='text-xl text-center font-semibold leading-6 text-gray-900 capitalize mb-3'
        >
          Welcome to ErmaJean!
          <XMarkIcon
            onClick={() => setOpen(false)}
            className='h-6 w-6 text-primary absolute right-3 top-8'
          />
        </DialogTitle>
        <p className='text-gray-500 text-sm text-center'>
          What should I call you?
        </p>
        <div className='content mt-12'>
          <form
            action={async (formData: FormData) => {
              await addProfileNameAction(formData);
              setOpen(false);
              toast.success('Name saved successfully');
            }}
            className='flex flex-col gap-4'
          >
            <div>
              <Label htmlFor='name'>First Name:</Label>
              <Input
                name='name'
                placeholder='First name basis around here 🙂'
              />
            </div>
            <Button variant={'default'} type='submit' className='w-full'>
              Save
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeModal;
