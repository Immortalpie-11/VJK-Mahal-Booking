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

const ADMIN_PIN = '2026';
const MAX_EVENTS_PER_DAY = 2;
const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening', 'All Day'] as const;

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
  const [adminVerified, setAdminVerified] = useState(false);
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
          onExit={() => {
            setViewMode('landing');
            setAdminVerified(false);
          }}
        />
      )}

      {showPinPrompt && (
        <AdminPinModal
          onClose={() => setShowPinPrompt(false)}
          onSuccess={() => {
            setAdminVerified(true);
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

/* ===================== ADMIN PIN MODAL ===================== */

function AdminPinModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const verify = () => {
    if (pin === ADMIN_PIN) onSuccess();
    else setError('Incorrect PIN');
  };

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

        {error && (
          <p className="text-red-500 text-sm mb-2">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 p-3 bg-slate-100 rounded-xl font-bold"
          >
            Cancel
          </button>
          <button
            onClick={verify}
            className="flex-1 p-3 bg-[#800000] text-white rounded-xl font-bold"
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
}
