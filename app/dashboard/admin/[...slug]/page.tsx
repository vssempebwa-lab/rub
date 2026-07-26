import { redirect } from 'next/navigation';

export default function AdminWorkspaceCatchAllPage() {
  redirect('/dashboard/admin');
}
