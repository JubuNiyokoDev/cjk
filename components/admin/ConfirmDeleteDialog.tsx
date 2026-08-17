'use client';

import { Loader2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type ConfirmDeleteDialogProps = {
  open: boolean;
  /** Titre du contenu à supprimer, affiché dans le message. */
  itemLabel: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/** Confirmation de suppression commune à toutes les pages admin. */
export default function ConfirmDeleteDialog({
  open,
  itemLabel,
  isDeleting,
  onCancel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && !isDeleting && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Voulez-vous vraiment supprimer « {itemLabel} » ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
