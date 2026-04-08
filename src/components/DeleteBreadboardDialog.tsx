"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogClose,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeleteBreadboardDialogProps {
  breadboardId: string;
  breadboardName: string;
  trigger: React.ReactElement;
}

export function DeleteBreadboardDialog({
  breadboardId,
  breadboardName,
  trigger,
}: DeleteBreadboardDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = confirmText === breadboardName && !isDeleting;

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/breadboards/${breadboardId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      window.location.href = "/";
    } catch {
      setIsDeleting(false);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setConfirmText("");
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog onOpenChange={handleOpenChange}>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogPopup>
        <div className="space-y-4">
          <AlertDialogTitle>Delete breadboard</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{" "}
            <strong className="text-foreground">{breadboardName}</strong> for
            everyone who has the link. This action cannot be undone.
          </AlertDialogDescription>

          <div className="space-y-2">
            <Label>
              Type{" "}
              <span className="font-mono font-semibold">{breadboardName}</span>{" "}
              to confirm
            </Label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={breadboardName}
              autoComplete="off"
            />
          </div>

          <div className="flex justify-end gap-2">
            <AlertDialogClose
              render={<Button variant="outline">Cancel</Button>}
            />
            <Button
              variant="destructive"
              disabled={!canDelete}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete breadboard"}
            </Button>
          </div>
        </div>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
