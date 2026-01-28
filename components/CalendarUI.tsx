
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  User,
  Trash2,
  XCircle,
  Clock,
  ChevronDown
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isBefore,
  startOfDay,
  getYear
} from 'date-fns';
import { supabase } from '../lib/supabase';

const ADMIN_PIN = "2025";
const MAX_EVENTS = 2;
const TIME_SLOTS = ["Morning", "Afternoon", "Evening", "All Day"];

type ViewMode = 'landing' | 'admin' | 'customer';

type CalendarEvent = {
  id: string;
  name: string;
  slot: string; // Could be a union of TIME_SLOTS if needed
};

type EventsMap = Record<string, CalendarEvent[]>;

const MOCK_EVENTS: EventsMap = {
  "2026-01-26": [
    { id: "1", name: "Wedding", slot: "Morning" }
  ]
};

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [events, setEvents] = useState<EventsMap>(MOCK_EVENTS);

  const handleSaveEvent = (dateStr: string, updatedEvents: CalendarEvent[]) => {
    setEvents(prev => {
      const next = { ...prev };
      if (updatedEvents.length === 0) delete next[dateStr];
      else next[dateStr] = updatedEvents;
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#FCF9F2] text-slate-800 font-sans">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />

      {viewMode === 'landing' && <LandingScreen onSelectMode={setViewMode} />}

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

function LandingScreen({ onSelectMode }: { onSelectMode: (mode: ViewMode) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen min-h-[100dvh] p-4 sm:p-6 bg-[#800000] relative overflow-x-hidden">
      <div className="bg-white p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-[3rem] shadow-2xl max-w-md w-full text-center border-b-4 sm:border-b-8 border-[#D4AF37]">
        <div className="mb-6 sm:mb-8 flex justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center shadow-xl border-2 sm:border-4 border-[#D4AF37] p-1.5 sm:p-2">
            <Image
              src="/logo.svg"
              alt="VJK Mahal Logo"
              width={112}
              height={112}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#800000]">VJK Mahal</h1>
        <p className="text-xs sm:text-sm text-slate-500 italic mb-6 sm:mb-10">Event Booking System</p>

        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={() => onSelectMode('customer')}
            className="w-full flex items-center justify-center min-h-[48px] sm:min-h-[52px] p-4 sm:p-5 bg-[#FDFBF4] text-[#800000] rounded-xl sm:rounded-2xl font-bold border-2 border-[#D4AF37]/30 touch-manipulation active:scale-[0.98] transition-transform"
          >
            <User className="w-5 h-5 mr-2 sm:mr-3 shrink-0" /> <span className="text-sm sm:text-base">Check Availability</span>
          </button>

          <button
            onClick={() => onSelectMode('admin')}
            className="w-full flex items-center justify-center min-h-[48px] sm:min-h-[52px] p-4 sm:p-5 bg-[#800000] text-white rounded-xl sm:rounded-2xl font-bold touch-manipulation active:scale-[0.98] transition-transform text-sm sm:text-base"
          >
            <Lock className="w-5 h-5 mr-2 sm:mr-3 shrink-0" /> Management
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== Calendar Manager ===================== */

function CalendarManager({ mode, events, onSave, onExit }: {
  mode: ViewMode;
  events: EventsMap;
  onSave: (dateStr: string, updatedEvents: CalendarEvent[]) => void;
  onExit: () => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart),
    end: endOfWeek(endOfMonth(monthStart))
  });

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDayStatus = (dayEvents: CalendarEvent[]) => {
    if (dayEvents.length === 0) return 'available';
    if (dayEvents.length >= MAX_EVENTS) return 'fully-booked';
    return 'partially-booked';
  };

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-4 md:p-6 w-full min-w-0 overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col gap-3 mb-4 md:mb-5 bg-white p-4 md:p-5 rounded-xl sm:rounded-2xl shadow-lg border border-slate-100">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md overflow-hidden shrink-0">
              <Image
                src="/logo.svg"
                alt="VJK Mahal Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-[#800000] tracking-tight">VJK Mahal</h2>
              <p className="text-[11px] md:text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">
                Availability View
              </p>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={goToToday}
              className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm hover:shadow touch-manipulation"
              aria-label="Go to today"
            >
              <Clock className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={onExit}
              className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm hover:shadow touch-manipulation"
              aria-label="Back"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center w-full mt-3 sm:mt-4">
          <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 px-2 sm:px-3 py-2 sm:py-2.5 rounded-full shadow-sm border border-slate-200/50 flex-1 max-w-sm">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 sm:p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-white rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
            <span className="font-semibold text-slate-800 px-1 sm:px-3 text-center text-xs sm:text-sm flex-1">
              {format(currentDate, 'MMM yyyy')}
            </span>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 sm:p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-white rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-100 p-2 sm:p-4 md:p-5 mb-4 md:mb-5 overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0">
        <div className="grid grid-cols-7 border border-slate-200 rounded-lg overflow-hidden min-w-[300px] sm:min-w-0">
          {/* Day Headers */}
          {['S','M','T','W','T','F','S'].map((d, index) => (
            <div
              key={`day-header-${index}`}
              className={`p-1 sm:p-2 text-center text-[10px] sm:text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-r border-b border-slate-200 last:border-r-0 min-w-0`}
            >
              {d}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day, index) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayEvents = events[dateStr] || [];
            const status = getDayStatus(dayEvents);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const todayStart = startOfDay(new Date());
            const isPastDate = isBefore(day, todayStart);
            const isFullyBooked = status === 'fully-booked';
            const isPartiallyBooked = status === 'partially-booked';
            const isAvailable = status === 'available';
            const isTodayDate = isToday(day);
            const isLastColumn = (index + 1) % 7 === 0;
            const isLastRow = index >= calendarDays.length - 7;

            if (!isCurrentMonth) {
              return (
                <div
                  key={dateStr}
                  className={`min-h-[72px] sm:min-h-[88px] md:min-h-[96px] p-1.5 sm:p-2 min-w-0 opacity-25 border-r border-b border-slate-200 ${isLastColumn ? 'border-r-0' : ''} ${isLastRow ? 'border-b-0' : ''}`}
                >
                  <span className="text-xs sm:text-sm font-medium text-slate-300">
                    {format(day, 'd')}
                  </span>
                </div>
              );
            }

            if (isPastDate && (mode === 'customer' || dayEvents.length === 0)) {
              const adminCanClick = mode === 'admin';
              return (
                <div
                  key={dateStr}
                  onClick={adminCanClick ? () => setSelectedDate(day) : undefined}
                  className={`
                  min-h-[72px] sm:min-h-[88px] md:min-h-[96px] p-1.5 sm:p-2 md:p-2.5 min-w-0
                  transition-all duration-200 border-r border-b border-slate-200
                  ${isLastColumn ? 'border-r-0' : ''}
                  ${isLastRow ? 'border-b-0' : ''}
                  opacity-50 bg-slate-50/50
                  ${adminCanClick ? 'cursor-pointer hover:bg-slate-100/50' : 'cursor-default'}
                `}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm md:text-base font-medium text-slate-400">
                        {format(day, 'd')}
                      </span>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300/50" />
                    </div>
                    <div className="mt-auto pt-0.5 sm:pt-1 min-w-0 overflow-hidden">
                      <p className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-400 font-medium truncate">Past</p>
                    </div>
                  </div>
                </div>
              );
            }

            const isCustomer = mode === 'customer';
            return (
              <div
                key={dateStr}
                onClick={isCustomer ? undefined : () => setSelectedDate(day)}
                className={`
                  min-h-[72px] sm:min-h-[88px] md:min-h-[96px] p-1.5 sm:p-2 md:p-2.5 min-w-0
                  transition-all duration-200 border-r border-b border-slate-200
                  ${isLastColumn ? 'border-r-0' : ''}
                  ${isLastRow ? 'border-b-0' : ''}
                  ${isFullyBooked ? 'bg-red-50' : isPartiallyBooked ? 'bg-yellow-50' : isTodayDate ? 'bg-[#800000]/5' : 'bg-transparent'}
                  ${isCustomer
                    ? 'cursor-default'
                    : `cursor-pointer ${isAvailable
                        ? 'hover:bg-emerald-50/30'
                        : isPartiallyBooked
                        ? 'hover:bg-yellow-50/30'
                        : 'hover:bg-rose-50/30'
                      }`
                  }
                `}
              >
                <div className="flex flex-col h-full min-w-0">
                  <div className="flex justify-between items-start gap-0.5 mb-1 sm:mb-2">
                    <span className={`
                      text-xs sm:text-sm md:text-base font-bold truncate min-w-0
                      ${isFullyBooked ? 'text-[#800000]' : 
                        isTodayDate ? 'text-[#800000]' : 
                        'text-slate-800'
                      }
                    `}>
                      {format(day, 'd')}
                    </span>
                    <div className={`
                      w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shadow-sm shrink-0
                      ${isAvailable ? 'bg-emerald-500 ring-2 ring-emerald-200' : 
                        isPartiallyBooked ? 'bg-yellow-400 ring-2 ring-yellow-200' : 
                        'bg-[#800000] ring-2 ring-[#800000]/20'
                      }
                    `} />
                  </div>
                  <div className="mt-auto pt-0.5 sm:pt-1 min-w-0 overflow-hidden">
                    {isAvailable && (
                      <p className="text-[8px] sm:text-[9px] md:text-[10px] text-emerald-600 font-semibold tracking-wide truncate" title="Available">
                        AVAILABLE
                      </p>
                    )}
                    {isPartiallyBooked && dayEvents.length > 0 && (
                      <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 text-[8px] sm:text-[9px] font-bold px-1 sm:px-2 py-0.5 rounded truncate max-w-full border border-yellow-200/50 shadow-sm inline-block" title={dayEvents[0].slot}>
                        {dayEvents[0].slot === 'Morning' && (<><span className="sm:hidden">Morn</span><span className="hidden sm:inline">Morning</span></>)}
                        {dayEvents[0].slot === 'Afternoon' && (<><span className="sm:hidden">Aft</span><span className="hidden sm:inline">Afternoon</span></>)}
                        {dayEvents[0].slot === 'Evening' && (<><span className="sm:hidden">Eve</span><span className="hidden sm:inline">Evening</span></>)}
                        {dayEvents[0].slot === 'All Day' && (<><span className="sm:hidden">Day</span><span className="hidden sm:inline">All Day</span></>)}
                        {!['Morning','Afternoon','Evening','All Day'].includes(dayEvents[0].slot) && dayEvents[0].slot}
                      </div>
                    )}
                    {isFullyBooked && (
                      <p className="text-[8px] sm:text-[9px] md:text-[10px] text-[#800000] font-bold tracking-wide truncate" title="Fully booked">
                        <span className="sm:hidden">FULL</span>
                        <span className="hidden sm:inline">FULLY BOOKED</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl shadow-lg border border-slate-100">
        <div className="flex flex-row flex-nowrap items-center justify-center sm:justify-start gap-2 sm:gap-4 md:gap-6 overflow-x-auto">
          <div className="flex items-center gap-1.5 sm:gap-3 cursor-default shrink-0">
            <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-emerald-400 bg-emerald-50 shadow-sm shrink-0"></div>
            <span className="text-[10px] sm:text-xs md:text-sm text-slate-700 font-semibold uppercase tracking-wide whitespace-nowrap">Available</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 cursor-default shrink-0">
            <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-yellow-400 bg-yellow-50 shadow-sm shrink-0"></div>
            <span className="text-[10px] sm:text-xs md:text-sm text-slate-700 font-semibold uppercase tracking-wide whitespace-nowrap"><span className="sm:hidden">Partial</span><span className="hidden sm:inline">Partially booked</span></span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 cursor-default shrink-0">
            <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#800000] shadow-md ring-2 ring-[#800000]/20 shrink-0"></div>
            <span className="text-[10px] sm:text-xs md:text-sm text-slate-700 font-semibold uppercase tracking-wide whitespace-nowrap"><span className="sm:hidden">Full</span><span className="hidden sm:inline">Fully booked</span></span>
          </div>
        </div>
      </div>

      {selectedDate && (
        <DayModal
          date={selectedDate}
          events={events[format(selectedDate, 'yyyy-MM-dd')] || []}
          mode={mode}
          onClose={() => setSelectedDate(null)}
          onSave={onSave}
        />
      )}
    </div>
  );
}

/* ===================== Day Modal ===================== */

function DayModal({ date, events, mode, onClose, onSave }: {
  date: Date;
  events: CalendarEvent[];
  mode: ViewMode;
  onClose: () => void;
  onSave: (dateStr: string, updatedEvents: CalendarEvent[]) => void;
}) {
  const [localEvents, setLocalEvents] = useState([...events]);
  const [form, setForm] = useState({ name: '', slot: 'Morning' });

  // Sync localEvents when events prop changes (e.g., when date changes)
  useEffect(() => {
    setLocalEvents([...events]);
  }, [events]);

  const add = () => {
    if (!form.name || localEvents.length >= MAX_EVENTS) return;
    setLocalEvents([...localEvents, { ...form, id: Date.now().toString() }]);
    setForm({ name: '', slot: 'Morning' });
  };

  const remove = (id: string) => {
    setLocalEvents(localEvents.filter(e => e.id !== id));
  };

  const save = () => {
    onSave(format(date, 'yyyy-MM-dd'), localEvents);
    onClose();
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col bg-white w-full h-full min-h-[100dvh] h-[100dvh] overflow-hidden"
      style={{ height: '100dvh' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-modal-title"
    >
      <div className="flex flex-col h-full w-full max-w-2xl mx-auto overflow-hidden">
        <div className="flex flex-col h-full min-h-0 p-4 sm:p-6 md:p-8">
          <header className="flex items-center justify-between mb-4 sm:mb-6 shrink-0">
            <div>
              <h3 id="day-modal-title" className="text-2xl md:text-3xl font-serif font-bold text-[#800000] tracking-tight">
                {format(date, 'MMMM do, yyyy')}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {localEvents.length === 0 ? 'No bookings' : `${localEvents.length} booking${localEvents.length > 1 ? 's' : ''}`}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <XCircle className="w-5 h-5 text-slate-400" />
            </button>
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8">
          <div className="space-y-3 mb-4">
            {localEvents.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">No bookings for this date</p>
              </div>
            ) : (
              localEvents.map(e => (
                <div 
                  key={e.id} 
                  className="flex justify-between items-center bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 mb-1">{e.name}</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-[#D4AF37]" />
                      <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wide">{e.slot}</p>
                    </div>
                  </div>
                  {mode === 'admin' && (
                    <button 
                      onClick={() => remove(e.id)}
                      className="p-2 hover:bg-rose-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ml-3"
                      aria-label="Remove booking"
                    >
                      <Trash2 className="w-5 h-5 text-rose-500" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {mode === 'admin' && localEvents.length < MAX_EVENTS && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Add New Booking</h4>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Enter booking name"
                className="w-full min-h-[48px] p-3 sm:p-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-all duration-200 touch-manipulation"
                onKeyDown={(e) => e.key === 'Enter' && add()}
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={form.slot}
                  onChange={e => setForm({ ...form, slot: e.target.value })}
                  className="flex-1 min-h-[48px] p-3 sm:p-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-all duration-200 touch-manipulation"
                >
                  {TIME_SLOTS.map(s => <option key={s}>{s}</option>)}
                </select>
                <button
                  onClick={add}
                  disabled={!form.name}
                  className="min-h-[48px] bg-gradient-to-r from-[#800000] to-[#9a1a1a] text-white px-6 py-3 sm:py-3.5 rounded-xl font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
                >
                  Add
                </button>
              </div>
            </div>
          )}
          </div>

          <footer className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-slate-200 shrink-0 mt-auto">
            <button
              onClick={onClose}
              className="flex-1 min-h-[48px] p-3 sm:p-3.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all duration-200 touch-manipulation"
            >
              Close
            </button>
            {mode === 'admin' && (
              <button
                onClick={save}
                className="flex-1 min-h-[48px] p-3 sm:p-3.5 bg-gradient-to-r from-[#D4AF37] to-[#e5c04a] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
              >
                Save Changes
              </button>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
}