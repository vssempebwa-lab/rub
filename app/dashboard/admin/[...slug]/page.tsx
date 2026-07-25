import { redirect } from 'next/navigation';

export default function RemovedAdminWorkspaceCatchAllPage() {
  redirect('/dashboard/photographer');
}
