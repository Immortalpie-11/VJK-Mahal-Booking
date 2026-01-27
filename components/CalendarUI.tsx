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

/* ===================== CONFIG ===================== */

const ADMIN_PIN = '1234';
const MAX_EVENTS_PER_DAY = 2;
const TIME_SLOTS = ['Morning', 'Evening', 'All Day'] as const;

/* ===================== TYPES ===================== */

type Slot = (typeof TIME_SLOTS)[number];

type CalendarEvent = {
  id: string;
  name: string;
  slot: Slot;
};

type EventsMap = Record<string, CalendarEvent[]>;

/* ===================== MAIN ===================== */

export default function CalendarUI() {
  const [events, setEvents] = useState<EventsMap>({});
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<'landing' | 'admin' | 'customer'>(
    'landing'
  );
  const [showPinPrompt, setShowPinPrompt] = useState(false);

  /* ---------- Load bookings ---------- */
  useEffect(() => {
    const loadBookings = async () => {
      const { data, error } = await supabase.from('bookings').select('*');

      if (error) {
        console.error(error);
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

  /* ---------- Save bookings ---------- */
  const saveDayEvents = async (dateStr: string, updated: CalendarEvent[]) => {
    await supabase.from('bookings').delete().eq('event_date', dateStr);

    if (updated.length > 0) {
      await supabase.from('bookings').insert(
        updated.map((e) => ({
          event_date: dateStr,
          name: e.name,
          slot: e.slot,
        }))
      );
    }

    setEvents((prev) => ({ ...prev, [dateStr]: updated }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading bookings…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCF9F2]">
      {viewMode === 'landing' && (
        <LandingScreen
          onCustomer={() => setViewMode('customer')}
          onAdmin={() => setShowPinPrompt(true)}
        />
      )}

      {viewMode !== 'landing' && (
        <CalendarManager
          mode={viewMode}
          events={events}
          onSave={saveDayEvents}
          onExit={() => setViewMode('landing')}
        />
      )}

      {showPinPrompt && (
        <AdminPinModal
          onClose={() => setShowPinPrompt(false)}
          onSuccess={() => {
            setShowPinPrompt(false);
            setViewMode('admin');
          }}
        />
      )}
    </div>
  );
}

/* ===================== LANDING ===================== */

function LandingScreen({
  onCustomer,
  onAdmin,
}: {
  onCustomer: () => void;
  onAdmin: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#800000] p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border-b-8 border-[#D4AF37]">
        <h1 className="text-3xl font-bold text-[#800000] mb-2">VJK Mahal</h1>
        <p className="text-sm text-slate-500 mb-8 italic">
          Event Booking System
        </p>

        <div className="space-y-4">
          <button
            onClick={onCustomer}
            className="w-full p-4 rounded-2xl bg-[#FDFBF4] text-[#800000] font-bold border"
          >
            Check Availability
          </button>

          <button
            onClick={onAdmin}
            className="w-full p-4 rounded-2xl bg-[#800000] text-white font-bold"
          >
            Management Login
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== ADMIN PIN ===================== */

function AdminPinModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
        <h3 className="font-bold text-lg mb-4">Admin Access</h3>

        <input
          type="password"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setError('');
          }}
          placeholder="Enter PIN"
          className="w-full p-3 border rounded-xl mb-2 text-center tracking-widest font-bold"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 p-3 bg-slate-100 rounded-xl font-bold">
            Cancel
          </button>
          <button
            onClick={() => {
              if (pin === ADMIN_PIN) onSuccess();
              else setError('Incorrect PIN');
            }}
            className="flex-1 p-3 bg-[#800000] text-white rounded-xl font-bold"
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== CALENDAR + MODAL ===================== */

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

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  });

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}>←</button>
        <h2 className="font-bold text-[#800000]">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}>→</button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-2xl overflow-hidden">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEvents = events[dateStr] || [];

          return (
            <div
              key={dateStr}
              onClick={() => setSelectedDate(day)}
              className="min-h-[100px] p-2 bg-white cursor-pointer hover:bg-[#FDFBF4]"
            >
              <div className="font-bold text-xs mb-1">{format(day, 'd')}</div>
              {dayEvents.map((e) => (
                <div key={e.id} className="text-[10px] bg-[#800000] text-white rounded px-2 py-1 mb-1">
                  {e.slot}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <button onClick={onExit} className="mt-6 px-6 py-3 bg-slate-100 rounded-xl font-bold">
        Back
      </button>

      {selectedDate && (
        <DayModal
          date={selectedDate}
          mode={mode}
          events={events[format(selectedDate, 'yyyy-MM-dd')] || []}
          onSave={(updated) => onSave(format(selectedDate, 'yyyy-MM-dd'), updated)}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

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
  const [error, setError] = useState('');

  const hasAllDay = events.some((e) => e.slot === 'All Day');
  const slotTaken = events.some((e) => e.slot === slot);

  const addEvent = () => {
    if (!name.trim()) return setError('Event name required');
    if (hasAllDay) return setError('All Day blocks other bookings');
    if (slot === 'All Day' && events.length > 0)
      return setError('Clear existing bookings first');
    if (slotTaken) return setError('Slot already booked');
    if (events.length >= MAX_EVENTS_PER_DAY)
      return setError('Maximum 2 bookings per day');

    onSave([...events, { id: Date.now().toString(), name, slot }]);
    setName('');
    setSlot('Morning');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-md p-6">
        <h3 className="font-bold mb-2">{format(date, 'MMMM d, yyyy')}</h3>

        {events.map((e) => (
          <div key={e.id} className="flex justify-between bg-slate-50 p-3 rounded-xl mb-2">
            <span className="font-bold">{e.name} — {e.slot}</span>
            {mode === 'admin' && (
              <button onClick={() => onSave(events.filter(ev => ev.id !== e.id))}>✕</button>
            )}
          </div>
        ))}

        {mode === 'admin' && (
          <>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Event name"
              className="w-full p-3 border rounded-xl mb-2"
            />
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value as Slot)}
              className="w-full p-3 border rounded-xl mb-2"
            >
              {TIME_SLOTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button onClick={addEvent} className="w-full p-3 bg-[#800000] text-white rounded-xl">
              Add Booking
            </button>
          </>
        )}

        <button onClick={onClose} className="w-full mt-3 p-3 bg-slate-100 rounded-xl">
          Close
        </button>
      </div>
    </div>
  );
}
