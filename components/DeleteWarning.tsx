"use client";
import { Dispatch, SetStateAction, useState } from "react";
import { DialogTitle } from "@headlessui/react";
import { Button } from "./ui/button";
import Modal from "./ui/Modal";
export function DeleteWarning({
  open,
  setOpen,
  title,
  desc,
  action,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  title: string;
  desc: string;
  action: () => void | Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  return (
    <Modal open={open} setOpen={loading ? () => {} : setOpen} height="h-auto">
      <DialogTitle>{title}</DialogTitle>
      <p>{desc}</p>
      {error && (
        <p role="alert" className="ej-dialog-error">
          {error}
        </p>
      )}
      <div className="ej-dialog-actions">
        <Button
          data-autofocus
          variant="outline"
          disabled={loading}
          onClick={() => {
            setError("");
            setOpen(false);
          }}
        >
          Keep it
        </Button>
        <Button
          variant="destructive"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            setError("");
            try {
              await action();
              setOpen(false);
            } catch (error) {
              if (error instanceof Error && error.message === "NEXT_REDIRECT")
                throw error;
              setError("That could not be deleted. Please try again.");
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Deleting…" : title}
        </Button>
      </div>
    </Modal>
  );
}
