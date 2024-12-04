'use client';
import React, { useEffect, useState } from 'react';
import Modal from './ui/Modal';
import { DialogTitle } from '@headlessui/react';
import { FaceFrownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/button';
import LoadingSpinner from './ui/LoadingSpinner';
import Note from './Note';
import { set } from 'zod';

const RecipeNotes = ({
  recipeName,
  recipeId,
}: {
  recipeName: string;
  recipeId: string;
}) => {
  const [open, setOpen] = useState(false);
  const [openNote, setOpenNote] = useState(false);
  const [edit, setEdit] = useState(false);
  const [deleteWarn, setDeleteWarn] = useState(false);
  const [formFields, setFormFields] = useState({
    id: 0,
    titleText: '',
    noteText: '',
  });
  const [notes, setNotes] = useState<
    { id: number; title: string; note: string; updated_at: string }[]
  >([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const getNotes = async () => {
    setLoadingNotes(true);
    const res = await fetch(`/api/notes?id=${recipeId}`);
    const data = await res.json();
    setNotes(data);
    setLoadingNotes(false);
  };

  const note = async (newNote: {
    recipeId: string;
    title: string;
    note: string;
  }) => {
    const res = await fetch(`/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...newNote,
      }),
    });

    const data = await res.json();
    if (data) await getNotes();
  };

  const deleteNote = async (id: number) => {
    const res = await fetch(`/api/notes`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
      }),
    });

    const data = await res.json();
    if (data) await getNotes();
  };

  return (
    <>
      <button
        onClick={async () => {
          setOpen(true);
          await getNotes();
        }}
        className='block rounded-lg py-2 px-3 transition hover:bg-primary/5 text-xs text-start w-full'
      >
        <p className='font-semibold text-black'>Notes</p>
        <p className='text-black/50'>
          List all your notes and tips for this recipe.
        </p>
      </button>
      <Modal {...{ open, setOpen }} height='h-full'>
        <DialogTitle
          as='h3'
          className='text-xl font-semibold leading-6 text-gray-900 capitalize mb-3 flex items-center justify-between text-left gap-2 w-full'
        >
          Notes for {recipeName}
          <XMarkIcon
            onClick={() => {
              setOpen(false);
            }}
            className='h-6 w-6 text-primary hover:cursor-pointer'
          />
        </DialogTitle>
        <div className='flex flex-col justify-between h-full'>
          <div className='p-3 w-full min-h-96'>
            {loadingNotes ? (
              <LoadingSpinner />
            ) : notes.length ? (
              notes.map((note, i) => (
                <div
                  key={i}
                  className='hover:cursor-pointer'
                  onClick={() => {
                    setEdit(true);
                    setFormFields({
                      id: note.id,
                      titleText: note.title,
                      noteText: note.note,
                    });
                    setOpenNote(true);
                  }}
                >
                  <div key={note?.id} className='mb-2 flex flex-col gap-1'>
                    <p className='text-xs opacity-40 italic font-bold'>
                      {new Date(note?.updated_at).toLocaleString('en', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                    <h2 className='text-lg font-semibold text-primary'>
                      {note?.title}
                    </h2>
                    <p className='text-black/50'>{note?.note}</p>
                  </div>
                  <hr key={note?.updated_at} className='my-6' />
                </div>
              ))
            ) : (
              <div className='flex flex-col h-[50vh] text-center max-w-72 mx-auto w-full justify-center gap-4'>
                <FaceFrownIcon className='h-12 w-12 text-primary mx-auto' />
                <p className='text-xl text-gray-600/75'>
                  Doesn’t look like you have any notes saved yet.
                </p>
                <p className='tex-xs font-bold text-primary'>
                  Click "Add Note" to get begin.
                </p>
              </div>
            )}
          </div>
          <div className='mt-5 py-3 flex items-center sticky bottom-0 gap-4 w-full'>
            <Button
              type='button'
              className='w-full'
              variant='secondary'
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={'default'}
              className='w-full'
              type='button'
              onClick={() => setOpenNote(true)}
            >
              New Note
            </Button>
          </div>
        </div>
      </Modal>
      {/* Add New Note */}
      <Note
        {...{
          recipeId,
          openNote,
          setOpenNote,
          note,
          edit,
          setEdit,
          formFields,
          setFormFields,
          deleteWarn,
          setDeleteWarn,
          deleteNote,
        }}
      />
    </>
  );
};

export default RecipeNotes;
