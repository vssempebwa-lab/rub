import { supabase } from '@/lib/supabase';

export async function signOutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut({ scope: 'local' });

  if (error) {
    throw error;
  }

  // Hard navigation clears client state reliably across browsers (incl. Firefox).
  window.location.assign('/');
}
