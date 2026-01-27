'use client';

import React, { useState } from 'react';

/* ===================== Types ===================== */

type CalendarEvent = {
  id: string;
  name: string;
  slot: string;
};

type EventsMap = Record<string, CalendarEvent[]>;

/* ===================== Mock Data ===================== */

const MOCK_EVENTS: EventsMap = {
  '2026-01-26': [{ id: '1', name: 'Wedding', slot: 'Morning' }],
};

/* ===================== Main Component ===================== */

export default function CalendarUI() {
  const [events, setEvents] = useState<EventsMap>(MOCK_EVENTS);
  const [viewMode, setViewMode] = useState<'landing' | 'admin' | 'customer'>(
    'landing'
  );

  const handleSaveEvent = (
    dateStr: string,
    updatedEvents: CalendarEvent[]
  ) => {
    setEvents((prev) => {
      const next = { ...prev };
      if (updatedEvents.length === 0) {
        delete next[dateStr];
      } else {
        next[dateStr] = updatedEvents;
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#FCF9F2] text-slate-800 font-sans">
      {viewMode === 'landing' && (
        <LandingScreen onSelectMode={setViewMode} />
      )}

      {viewMode !== 'landing' && (
        <CalendarManager
          mode={viewMode}
          events={events}
          onSave={handleSaveEvent}
          onExit={() => setViewMode('landing')}
        />
      )}
    </div>
  );
}

/* ===================== Landing Screen ===================== */

function LandingScreen({
  onSelectMode,
}: {
  onSelectMode: (mode: 'admin' | 'customer') => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <button
        onClick={() => onSelectMode('admin')}
        className="px-6 py-3 bg-[#800000] text-white rounded-xl"
      >
        Enter Admin
      </button>
    </div>
  );
}

/* ===================== Calendar Manager ===================== */

function CalendarManager({
  mode,
  events,
  onSave,
  onExit,
}: {
  mode: string;
  events: EventsMap;
  onSave: (date: string, events: CalendarEvent[]) => void;
  onExit: () => void;
}) {
  return (
    <div className="p-6">
      <button onClick={onExit}>Back</button>
      <pre className="mt-4 text-xs">{JSON.stringify(events, null, 2)}</pre>
    </div>
  );
}
