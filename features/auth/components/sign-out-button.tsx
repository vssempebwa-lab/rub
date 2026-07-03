'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

type SignOutButtonProps = {
  onSignOut: () => void | Promise<void>;
  display?: 'button' | 'sidebar' | 'menu';
  className?: string;
  onOpen?: () => void;
};

export function SignOutButton({
  onSignOut,
  display = 'button',
  className,
  onOpen,
}: SignOutButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  function openDialog() {
    onOpen?.();
    setOpen(true);
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      await onSignOut();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign out. Please try again.';
      toast({ title: 'Sign out failed', description: message, variant: 'destructive' });
      setLoading(false);
      setOpen(false);
    }
  }

  const trigger =
    display === 'sidebar' ? (
      <button
        type="button"
        onClick={openDialog}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full ${className ?? ''}`}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    ) : display === 'menu' ? (
      <button
        type="button"
        onClick={openDialog}
        className={`flex items-center gap-2 text-sm font-medium py-2 text-destructive ${className ?? ''}`}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    ) : (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={openDialog}
        className={`gap-2 ${className ?? ''}`}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    );

  return (
    <>
      {trigger}
      <AlertDialog open={open} onOpenChange={(next) => !loading && setOpen(next)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of your account. You can sign back in anytime from the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              disabled={loading}
              onClick={handleConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Signing out...' : 'Sign Out'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
