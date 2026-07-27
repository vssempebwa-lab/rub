import type { Metadata } from 'next';
import { AdminLoginForm } from './admin-login-form';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-12">
      <AdminLoginForm />
    </main>
  );
}
