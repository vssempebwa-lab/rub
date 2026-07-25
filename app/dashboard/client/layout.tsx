import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

export default function ClientWorkspaceRedirectLayout({ children }: { children: ReactNode }) {
  redirect('/dashboard/photographer');
}
