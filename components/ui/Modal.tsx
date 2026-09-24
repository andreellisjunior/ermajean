"use client";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { X } from "lucide-react";
import "@/components/redesign/dialogs.css";
export default function Modal({
  open,
  setOpen,
  children,
  height = "h-auto",
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
  height?: string;
}) {
  return (
    <Dialog open={open} onClose={setOpen} className="ej-dialog-root">
      <DialogBackdrop className="ej-dialog-backdrop" />
      <div className="ej-dialog-position">
        <DialogPanel className={`ej-dialog-panel ${height}`}>
          <button
            type="button"
            className="ej-dialog-close"
            aria-label="Close dialog"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
          <div className="ej-dialog-content">{children}</div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
