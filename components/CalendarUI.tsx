'use client';

import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/lib/supabase';

/* ===================== Constants ===================== */

const MAX_EVENTS_PER_DAY = 2;
const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening', 'All Day'] as const;

/* ===================== Types ===================== */

type Slot = (typeof TIME_SLOTS)[number];

type CalendarEvent = {
  id: string;
  name: string;
  slot: Slot;
};

type EventsMap = Record<string, CalendarEvent[]>;

/* ===================== Main Component ===================== */

export default function CalendarUI() {
  const [events, setEvents] = useState<EventsMap>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'landing' | 'admin' | 'customer'>(
    'landing'
  );

  /* ---------- Load bookings from Supabase ---------- */
  useEffect(() => {
    const loadBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*');

      if (error) {
        console.error('Failed to load bookings', error);
        setLoading(false);
        return;
      }

      const map: EventsMap = {};
      data.forEach((b) => {
        const date = b.event_date;
        if (!map[date]) map[date] = [];
        map[date].push({
          id: b.id,
          name: b.name,
          slot: b.slot,
        });
      });

      setEvents(map);
      setLoading(false);
    };

    loadBookings();
  }, []);

  /* ---------- Save bookings for a day ---------- */
  const saveDayEvents = async (
    dateStr: string,
    updated: CalendarEvent[]
  ) => {
    // Delete existing bookings for that date
    await supabase.from('bookings').delete().eq('event_date', dateStr);

    // Insert updated bookings
    if (updated.length > 0) {
      await supabase.from('bookings').insert(
        updated.map((e) => ({
          event_date: dateStr,
          name: e.name,
          slot: e.slot,
        }))
      );
    }

    // Update local state
    setEvents((prev) => ({
      ...prev,
      [dateStr]: updated,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading bookings…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCF9F2] text-slate-800 font-sans">
      {viewMode === 'landing' && (
        <LandingScreen onSelectMode={setViewMode} />
      )}

      {viewMode !== 'landing' && (
        <CalendarManager
          mode={viewMode}
          events={events}
          onSave={saveDayEvents}
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#800000]">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border-b-8 border-[#D4AF37]">
        <h1 className="text-3xl font-bold text-[#800000] mb-2">VJK Mahal</h1>
        <p className="text-sm text-slate-500 mb-8 italic">
          Event Booking System
        </p>

        <div className="space-y-4">
          <button
            onClick={() => onSelectMode('customer')}
            className="w-full p-4 rounded-2xl bg-[#FDFBF4] text-[#800000] font-bold border"
          >
            Check Availability
          </button>

          <button
            onClick={() => onSelectMode('admin')}
            className="w-full p-4 rounded-2xl bg-[#800000] text-white font-bold"
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
  onSave,
  onExit,
}: {
  mode: 'admin' | 'customer';
  events: EventsMap;
  onSave: (date: string, events: CalendarEvent[]) => void;
  onExit: () => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const days = eachDayOfInterval({
    start: startOfWeek(monthStart),
    end: endOfWeek(endOfMonth(monthStart)),
  });

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
          ←
        </button>
        <h2 className="font-bold text-[#800000]">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
          →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-2xl overflow-hidden">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div
            key={i}
            className="bg-slate-50 p-3 text-center text-xs font-bold text-slate-400"
          >
            {d}
          </div>
        ))}

        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEvents = events[dateStr] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={dateStr}
              onClick={() => isCurrentMonth && setSelectedDate(day)}
              className={`
                min-h-[100px] p-2 bg-white cursor-pointer
                ${!isCurrentMonth ? 'opacity-30' : 'hover:bg-[#FDFBF4]'}
                ${isToday(day) ? 'ring-2 ring-[#800000]/30' : ''}
              `}
            >
              <div className="font-bold text-xs mb-1">
                {format(day, 'd')}
              </div>

              {dayEvents.map((e) => (
                <div
                  key={e.id}
                  className="text-[10px] bg-[#800000] text-white rounded px-2 py-1 mb-1 truncate"
                >
                  {e.slot}
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
          className="px-6 py-3 rounded-xl bg-slate-100 font-bold"
        >
          Back
        </button>
      </div>

      {selectedDate && (
        <DayModal
          date={selectedDate}
          mode={mode}
          events={events[format(selectedDate, 'yyyy-MM-dd')] || []}
          onSave={(updated) =>
            onSave(format(selectedDate, 'yyyy-MM-dd'), updated)
          }
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

/* ===================== Day Modal ===================== */

function DayModal({
  date,
  mode,
  events,
  onSave,
  onClose,
}: {
  date: Date;
  mode: 'admin' | 'customer';
  events: CalendarEvent[];
  onSave: (events: CalendarEvent[]) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [slot, setSlot] = useState<Slot>('Morning');

  const addEvent = () => {
    if (!name.trim() || events.length >= MAX_EVENTS_PER_DAY) return;

    onSave([
      ...events,
      { id: Date.now().toString(), name, slot },
    ]);

    setName('');
    setSlot('Morning');
  };

  const removeEvent = (id: string) => {
    onSave(events.filter((e) => e.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center p-4 z-50">
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md shadow-xl">
        <div className="p-6 bg-[#800000] text-white flex justify-between">
          <div>
            <h3 className="font-bold">
              {format(date, 'EEEE')}
            </h3>
            <p className="text-xs opacity-80">
              {format(date, 'MMMM d, yyyy')}
            </p>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="p-6 space-y-4">
          {events.map((e) => (
            <div
              key={e.id}
              className="flex justify-between items-center bg-slate-50 p-3 rounded-xl"
            >
              <div className="text-sm font-bold">
                {e.name} — {e.slot}
              </div>
              {mode === 'admin' && (
                <button
                  onClick={() => removeEvent(e.id)}
                  className="text-red-500 font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {events.length === 0 && (
            <div className="text-center text-emerald-600 font-bold">
              Date is Available
            </div>
          )}

          {mode === 'admin' && events.length < MAX_EVENTS_PER_DAY && (
            <div className="pt-4 border-t space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Event name"
                className="w-full p-3 rounded-xl border font-bold"
              />

              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value as Slot)}
                className="w-full p-3 rounded-xl border font-bold"
              >
                {TIME_SLOTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>

              <button
                onClick={addEvent}
                className="w-full p-3 rounded-xl bg-[#D4AF37] text-white font-bold"
              >
                Add Booking
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full p-3 rounded-xl bg-slate-100 font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
