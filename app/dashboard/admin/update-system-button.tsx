'use client';

import Link from 'next/link';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UpdateSystemButton() {
  return (
    <Button
      asChild
      type="button"
      className="bg-orange-700 text-white hover:bg-orange-800"
    >
      <Link href="/dashboard/admin/system">
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        Update System
      </Link>
    </Button>
  );
}
