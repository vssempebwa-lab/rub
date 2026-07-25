import { redirect } from 'next/navigation';

export default function RemovedAdminWorkspaceLayout() {
  redirect('/dashboard/photographer');
}
