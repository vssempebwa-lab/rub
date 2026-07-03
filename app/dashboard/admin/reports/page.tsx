'use client';

import { Construction } from 'lucide-react';

export default function PlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Construction className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
      <p className="text-muted-foreground">This feature is under development.</p>
    </div>
  );
}
