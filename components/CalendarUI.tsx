'use client';

import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';

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

  return (
    <div className="min-h-screen bg-[#FCF9F2] text-slate-800 font-sans">
      {viewMode === 'landing' && (
        <LandingScreen onSelectMode={setViewMode} />
      )}

      {viewMode !== 'landing' && (
        <CalendarManager
          mode={viewMode}
          events={events}
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#800000] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full border-[15px] border-[#D4AF37]" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full border-[15px] border-[#D4AF37]" />
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center relative z-10 border-b-8 border-[#D4AF37]">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-[#D4AF37]">
            <span className="text-[#800000] font-serif text-4xl font-bold italic">
              VJK
            </span>
          </div>
        </div>

        <h1 className="text-3xl font-serif font-bold text-[#800000] mb-1">
          VJK Mahal
        </h1>
        <p className="text-sm font-medium text-slate-500 mb-10 italic">
          Event Booking System
        </p>

        <div className="space-y-4">
          <button
            onClick={() => onSelectMode('customer')}
            className="w-full p-4 bg-[#FDFBF4] text-[#800000] rounded-2xl font-bold border-2 border-[#D4AF37]/30"
          >
            Check Availability
          </button>

          <button
            onClick={() => onSelectMode('admin')}
            className="w-full p-4 bg-[#800000] text-white rounded-2xl font-bold"
          >
            Management Login
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== Calendar Manager ===================== */

function CalendarManager({
  mode,
  events,
  onExit,
}: {
  mode: 'admin' | 'customer';
  events: EventsMap;
  onExit: () => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart),
    end: endOfWeek(endOfMonth(monthStart)),
  });

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="px-4 py-2 rounded-xl bg-slate-100 font-bold"
        >
          ←
        </button>

        <h2 className="text-lg font-bold text-[#800000]">
          {format(currentDate, 'MMMM yyyy')}
        </h2>

        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="px-4 py-2 rounded-xl bg-slate-100 font-bold"
        >
          →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-2xl overflow-hidden shadow">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div
            key={d}
            className="bg-slate-50 p-3 text-center text-xs font-bold text-slate-400"
          >
            {d}
          </div>
        ))}

        {calendarDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEvents = events[dateStr] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={dateStr}
              onClick={() => isCurrentMonth && setSelectedDate(day)}
              className={`
                min-h-[100px] p-2 bg-white text-xs cursor-pointer
                ${!isCurrentMonth ? 'opacity-30' : 'hover:bg-[#FDFBF4]'}
                ${isToday(day) ? 'ring-2 ring-[#800000]/30' : ''}
              `}
            >
              <div className="font-bold mb-1">{format(day, 'd')}</div>

              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className="text-[10px] bg-[#800000] text-white rounded px-2 py-1 mb-1 truncate"
                >
                  {event.name}
                </div>
              ))}

              {dayEvents.length === 0 && isCurrentMonth && (
                <div className="text-[9px] text-emerald-600 mt-4">
                  Available
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={onExit}
          className="px-6 py-3 rounded-2xl bg-slate-100 font-bold"
        >
          Back
        </button>
      </div>

      {selectedDate && (
        <DayModal
          date={selectedDate}
          events={events[format(selectedDate, 'yyyy-MM-dd')] || []}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

/* ===================== Day Modal ===================== */

function DayModal({
  date,
  events,
  onClose,
}: {
  date: Date;
  events: CalendarEvent[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md shadow-2xl">
        <div className="p-6 bg-[#800000] text-white flex justify-between">
          <div>
            <h3 className="text-xl font-bold">
              {format(date, 'EEEE')}
            </h3>
            <p className="text-xs opacity-80">
              {format(date, 'MMMM d, yyyy')}
            </p>
          </div>
          <button onClick={onClose} className="text-xl font-bold">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          {events.length > 0 ? (
            events.map((e) => (
              <div
                key={e.id}
                className="p-4 rounded-xl bg-slate-50 font-bold"
              >
                {e.name} — {e.slot}
              </div>
            ))
          ) : (
            <div className="text-center text-emerald-600 font-bold">
              Date is Available
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-100 font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}