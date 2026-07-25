'use client';

import { CheckSquare, Square, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SelectionToolbarProps = {
  selectedCount: number;
  totalCount: number;
  deleting?: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteSelected: () => void;
};

export function SelectionToolbar({
  selectedCount,
  totalCount,
  deleting = false,
  onSelectAll,
  onDeselectAll,
  onDeleteSelected,
}: SelectionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky bottom-4 z-20 rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium">
          {selectedCount} of {totalCount} photo(s) selected
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onSelectAll}>
            <CheckSquare className="mr-2 h-4 w-4" />
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={onDeselectAll}>
            <Square className="mr-2 h-4 w-4" />
            Deselect All
          </Button>
          <Button variant="destructive" size="sm" onClick={onDeleteSelected} disabled={deleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      </div>
    </div>
  );
}
