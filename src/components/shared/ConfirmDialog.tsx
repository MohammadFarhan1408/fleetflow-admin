"use client";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Names the object: "Archive Northwind Traders?" (design.md §6 Dialog, architecture §19). */
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Destructive actions use the destructive button; use it only for the confirming action. */
  destructive?: boolean;
  loading?: boolean;
  /**
   * Where focus goes when the dialog closes. Only needed when what opened it has since unmounted (a menu item):
   * otherwise focus returns there on its own, and would fall to the page body here.
   */
  returnFocusTo?: React.RefObject<HTMLElement | null>;
  onConfirm: () => void;
};

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  returnFocusTo,
  onConfirm,
}: ConfirmDialogProps) => (
  // A pending request cannot be cancelled, so the dialog stays until it settles.
  <Dialog open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
    <DialogContent
      size="confirm"
      onCloseAutoFocus={(event) => {
        if (!returnFocusTo?.current) return;
        event.preventDefault();
        returnFocusTo.current.focus();
      }}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={destructive ? "destructive" : "primary"} loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
