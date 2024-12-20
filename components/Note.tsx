import React, { Dispatch, SetStateAction } from "react";
import { Button } from "./ui/button";
import { DialogTitle } from "@headlessui/react";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Modal from "./ui/Modal";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { SubmitButton } from "./ui/submit-button";
import { DeleteWarning } from "./DeleteWarning";

const Note = ({
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
}: {
  recipeId?: string;
  openNote: boolean;
  setOpenNote: Dispatch<SetStateAction<boolean>>;
  edit: boolean;
  setEdit: Dispatch<SetStateAction<boolean>>;
  note: (note: { title: string; note: string }) => void;
  formFields: { id: number; titleText: string; noteText: string };
  deleteWarn: boolean;
  setFormFields: Dispatch<
    SetStateAction<{ id: number; titleText: string; noteText: string }>
  >;
  setDeleteWarn: Dispatch<SetStateAction<boolean>>;
  deleteNote: (id: number) => void;
}) => {
  return (
    <>
      <Modal open={openNote} setOpen={setOpenNote}>
        <DialogTitle
          as="h3"
          className="text-xl font-semibold leading-6 text-primary capitalize mb-3 flex items-center justify-between text-center gap-2 w-full"
        >
          Add New Note
          <XMarkIcon
            onClick={() => {
              setOpenNote(false);
              setEdit(false);
              setFormFields({ id: 0, titleText: "", noteText: "" });
            }}
            className="h-6 w-6 text-primary hover:cursor-pointer"
          />
        </DialogTitle>
        <form
          action={async (formData: FormData) => {
            const newNote = {
              edit,
              id: formFields.id,
              recipeId: recipeId,
              title: formData.get("title") as string,
              note: formData.get("note") as string,
            };
            await note(newNote);
            setOpenNote(false);
            setEdit(false);
            setFormFields({ id: 0, titleText: "", noteText: "" });
          }}
          className="flex flex-col justify-between h-full"
        >
          <div className="p-3 w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Input type="hidden" name="recipeId" value={recipeId} />
              <label htmlFor="title" className="text-sm font-semibold">
                Title
              </label>
              <Input
                type="text"
                name="title"
                id="title"
                className="input"
                placeholder="First time making this recipe"
                defaultValue={formFields.titleText}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="note" className="text-sm font-semibold">
                Note
              </label>
              <Textarea
                name="note"
                id="note"
                className="input"
                placeholder="I added a little bit more salt and it was almost perfect! I will try it again and see if I can make it even better."
                defaultValue={formFields.noteText}
                required
              />
            </div>
          </div>
          <div className="mt-5 py-3 flex items-center sticky bottom-0 gap-4 w-full">
            {edit && (
              <Button
                type="button"
                className="w-fit"
                variant="destructive"
                onClick={() => setDeleteWarn(true)}
              >
                <TrashIcon className="h-6 w-6" />
              </Button>
            )}
            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={() => {
                setOpenNote(false);
                setEdit(false);
                setFormFields({ id: 0, titleText: "", noteText: "" });
              }}
            >
              Cancel
            </Button>
            <SubmitButton
              variant={"default"}
              className="w-full"
              pendingText={`${edit ? "Updating..." : "Saving..."}`}
            >
              {edit ? "Update" : "Save"}
            </SubmitButton>
          </div>
        </form>
      </Modal>
      <DeleteWarning
        open={deleteWarn}
        setOpen={setDeleteWarn}
        title="Delete Note"
        desc="Are you sure you want to delete your note? This action is not reversable."
        action={async () => {
          await deleteNote(formFields.id);
          setDeleteWarn(false);
          setOpenNote(false);
          setFormFields({ id: 0, titleText: "", noteText: "" });
        }}
      />
    </>
  );
};

export default Note;
