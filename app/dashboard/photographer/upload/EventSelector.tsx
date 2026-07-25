'use client';

import { useEffect, useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { EventOption } from './types';

type EventSelectorProps = {
  events: EventOption[];
  value: string;
  onChange: (eventId: string) => void;
};

type EventTypeFilter = 'all' | 'coverage' | 'photoshoot';

const eventTypeFilters: { value: EventTypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'coverage', label: 'Coverage' },
  { value: 'photoshoot', label: 'Photoshoot' },
];

export function EventSelector({ events, value, onChange }: EventSelectorProps) {
  const [filter, setFilter] = useState<EventTypeFilter>('all');

  const filteredEvents = useMemo(() => {
    if (filter === 'all') return events;
    return events.filter((event) => event.event_type === filter);
  }, [events, filter]);

  useEffect(() => {
    if (!value || filter === 'all') return;
    const selectedEventStillVisible = filteredEvents.some((event) => event.id === value);
    if (!selectedEventStillVisible) onChange('');
  }, [filter, filteredEvents, onChange, value]);

  return (
    <div className="max-w-xl space-y-3">
      <div>
        <p className="mb-1.5 text-sm font-medium">Event Type</p>
        <div className="inline-flex rounded-lg bg-muted p-1">
          {eventTypeFilters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2',
                filter === item.value && 'bg-orange-700 text-white shadow-sm'
              )}
              aria-pressed={filter === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <label className="mb-1.5 block text-sm font-medium">Select Event</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose an event..." />
        </SelectTrigger>
        <SelectContent>
          {filteredEvents.map((event) => (
            <SelectItem key={event.id} value={event.id}>
              {event.name}
            </SelectItem>
          ))}
          {filteredEvents.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No {filter === 'all' ? '' : filter} events found.
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
