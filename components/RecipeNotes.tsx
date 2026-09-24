"use client";
import { DialogTitle } from "@headlessui/react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import Modal from "./ui/Modal";
import LoadingSpinner from "./ui/LoadingSpinner";
import { DeleteWarning } from "./DeleteWarning";
type CookingNote = {
  id: number;
  title: string;
  note: string;
  updated_at: string;
};
export default function RecipeNotes({
  recipeName,
  recipeId,
  profiles,
  preview = false,
}: {
  recipeName: string;
  recipeId: string;
  profiles: { has_access: boolean }[];
  preview?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [editor, setEditor] = useState(false);
  const [notes, setNotes] = useState<CookingNote[]>([]);
  const [selected, setSelected] = useState<CookingNote | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [remove, setRemove] = useState(false);
  async function load() {
    setBusy(true);
    setError("");
    try {
      if (preview) {
        setNotes([]);
        return;
      }
      const response = await fetch(
        `/api/notes?id=${encodeURIComponent(recipeId)}`,
      );
      if (!response.ok) throw new Error();
      const rows = await response.json();
      if (!Array.isArray(rows)) throw new Error();
      setNotes(rows);
    } catch {
      setError("Your notes couldn’t load. Try again.");
    } finally {
      setBusy(false);
    }
  }
  async function save(form: HTMLFormElement) {
    const values = new FormData(form);
    setBusy(true);
    setError("");
    try {
      if (preview) {
        setError("Preview only. Your notes have not changed.");
        return;
      }
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId,
          edit: !!selected,
          id: selected?.id,
          title: values.get("title"),
          note: values.get("note"),
        }),
      });
      if (!response.ok) throw new Error();
      const rows = await response.json();
      if (!Array.isArray(rows) || !rows.length) throw new Error();
      setEditor(false);
      await load();
    } catch {
      setError(
        "Your note couldn’t be saved. Your draft is still here; try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setOpen(true);
          load();
        }}
      >
        Cooking notes
      </Button>
      <Modal open={open} setOpen={setOpen}>
        <DialogTitle>Make it yours.</DialogTitle>
        <p className="ej-dialog-muted">Notes for {recipeName}</p>
        {error && (
          <div role="alert" className="ej-dialog-error">
            {error}
            <button onClick={load} disabled={busy}>
              Try again
            </button>
          </div>
        )}
        {busy ? (
          <LoadingSpinner />
        ) : notes.length ? (
          <div className="ej-note-list">
            {notes.map((note) => (
              <button
                key={note.id}
                className="ej-note-card"
                onClick={() => {
                  setSelected(note);
                  setError("");
                  setEditor(true);
                }}
              >
                <small>{new Date(note.updated_at).toLocaleDateString()}</small>
                <h3>{note.title}</h3>
                <p>{note.note}</p>
              </button>
            ))}
          </div>
        ) : (
          !error && (
            <div className="ej-dialog-empty">
              <h3>A little note for next time.</h3>
              <p>More garlic? A handy shortcut? Save what worked for you.</p>
            </div>
          )
        )}
        <div className="ej-dialog-actions">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
          <Button
            onClick={() => {
              setSelected(null);
              setError("");
              setEditor(true);
            }}
          >
            New note
          </Button>
        </div>
      </Modal>
      <Modal open={editor} setOpen={setEditor}>
        <DialogTitle>
          {selected ? "Edit your note" : "A note for next time."}
        </DialogTitle>
        <form
          key={selected?.id || "new"}
          className="ej-dialog-form"
          onSubmit={(e) => {
            e.preventDefault();
            save(e.currentTarget);
          }}
        >
          <label>
            Title
            <Input
              name="title"
              required
              defaultValue={selected?.title}
              placeholder="A little more garlic next time"
            />
          </label>
          <label>
            Your note
            <Textarea
              name="note"
              required
              defaultValue={selected?.note}
              placeholder="What worked? What would you change?"
            />
          </label>
          {error && (
            <p role="alert" className="ej-dialog-error">
              {error}
            </p>
          )}
          <div className="ej-dialog-actions">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setEditor(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save note"}
            </Button>
            {selected && (
              <Button
                type="button"
                variant="destructive"
                disabled={busy}
                onClick={() => setRemove(true)}
              >
                Delete
              </Button>
            )}
          </div>
        </form>
      </Modal>
      <DeleteWarning
        open={remove}
        setOpen={setRemove}
        title="Delete note"
        desc="This note will be permanently removed."
        action={async () => {
          if (preview) throw new Error();
          const response = await fetch("/api/notes", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: selected?.id }),
          });
          if (!response.ok) throw new Error();
          const rows = await response.json();
          if (!Array.isArray(rows) || !rows.length) throw new Error();
          setEditor(false);
          await load();
        }}
      />
    </>
  );
}
