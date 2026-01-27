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
  LogOut,
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
  getYear
} from 'date-fns';

const ADMIN_PIN = "1234";
const MAX_EVENTS = 2;
const TIME_SLOTS = ["Morning", "Afternoon", "Evening", "All Day"];

const MOCK_EVENTS: Record<string, any[]> = {
  "2026-01-26": [
    { id: "1", name: "Wedding", slot: "Morning" }
  ]
};

export default function App() {
  const [viewMode, setViewMode] = useState('landing');
  const [events, setEvents] = useState(MOCK_EVENTS);

  const handleSaveEvent = (dateStr, updatedEvents) => {
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

function LandingScreen({ onSelectMode }) {
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) onSelectMode('admin');
    else {
      setError('Incorrect PIN');
      setPin('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#800000] relative overflow-hidden">
      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl max-w-md w-full text-center border-b-8 border-[#D4AF37]">
        <div className="mb-8 flex justify-center">
          <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-[#D4AF37] p-2">
            <Image 
              src="/logo.svg" 
              alt="VJK Mahal Logo" 
              width={112} 
              height={112}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <h1 className="text-4xl font-serif font-bold text-[#800000]">VJK Mahal</h1>
        <p className="text-sm text-slate-500 italic mb-10">Event Booking System</p>

        {!showPinInput ? (
          <div className="space-y-4">
            <button
              onClick={() => onSelectMode('customer')}
              className="w-full flex items-center justify-center p-5 bg-[#FDFBF4] text-[#800000] rounded-2xl font-bold border-2 border-[#D4AF37]/30"
            >
              <User className="w-5 h-5 mr-3" /> Check Availability
            </button>

            <button
              onClick={() => setShowPinInput(true)}
              className="w-full flex items-center justify-center p-5 bg-[#800000] text-white rounded-2xl font-bold"
            >
              <Lock className="w-5 h-5 mr-3" /> Management Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input
              type="password"
              value={pin}
              inputMode="numeric"
              onChange={(e) => {
                setPin(e.target.value);
                setError('');
              }}
              className="w-full p-4 border bg-slate-50 rounded-2xl text-center text-2xl tracking-[0.5em]"
              placeholder="****"
              autoFocus
            />
            {error && <p className="text-[#800000] text-xs font-bold">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowPinInput(false)} className="flex-1 p-4 text-slate-400 font-bold">
                Back
              </button>
              <button type="submit" className="flex-1 p-4 bg-[#D4AF37] text-white rounded-2xl font-bold">
                Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ===================== Calendar Manager ===================== */

function CalendarManager({ mode, events, onSave, onExit }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthStart = startOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart),
    end: endOfWeek(endOfMonth(monthStart))
  });

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDayStatus = (dayEvents) => {
    if (dayEvents.length === 0) return 'available';
    if (dayEvents.length >= MAX_EVENTS) return 'fully-booked';
    return 'partially-booked';
  };

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-5 bg-white p-4 md:p-5 rounded-2xl shadow-lg border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md overflow-hidden">
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

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-gradient-to-r from-slate-50 to-slate-100 px-3 py-2.5 rounded-full shadow-sm border border-slate-200/50">
            <button 
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-1.5 hover:bg-white rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
            <span className="font-semibold text-slate-800 px-3 min-w-[110px] text-center text-sm">
              {format(currentDate, 'MMM yyyy')}
            </span>
            <button 
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-1.5 hover:bg-white rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>
          <button 
            onClick={goToToday}
            className="p-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm hover:shadow"
            aria-label="Go to today"
          >
            <Clock className="w-4 h-4 text-slate-600" />
          </button>
          {mode === 'admin' && (
            <button 
              onClick={onExit} 
              className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200 shadow-sm hover:shadow"
              aria-label="Exit"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-3 sm:p-4 md:p-5 mb-4 md:mb-5">
        <div className="grid grid-cols-7 border border-slate-200 rounded-lg overflow-hidden">
          {/* Day Headers */}
          {['S','M','T','W','T','F','S'].map((d, index) => (
            <div 
              key={`day-header-${index}`} 
              className={`p-2 text-center text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-r border-b border-slate-200 last:border-r-0`}
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
                  className={`min-h-[78px] sm:min-h-[88px] md:min-h-[96px] p-2 opacity-25 border-r border-b border-slate-200 ${isLastColumn ? 'border-r-0' : ''} ${isLastRow ? 'border-b-0' : ''}`}
                >
                  <span className="text-sm font-medium text-slate-300">
                    {format(day, 'd')}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDate(day)}
                className={`
                  min-h-[78px] sm:min-h-[88px] md:min-h-[96px] p-2 md:p-2.5 cursor-pointer 
                  transition-all duration-200 border-r border-b border-slate-200
                  ${isLastColumn ? 'border-r-0' : ''}
                  ${isLastRow ? 'border-b-0' : ''}
                  ${isTodayDate ? 'bg-[#800000]/5' : 'bg-transparent'}
                  ${isAvailable 
                    ? 'hover:bg-emerald-50/30' 
                    : isPartiallyBooked
                    ? 'hover:bg-yellow-50/30'
                    : 'hover:bg-rose-50/30'
                  }
                `}
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`
                      text-sm md:text-base font-bold
                      ${isFullyBooked ? 'text-[#800000]' : 
                        isTodayDate ? 'text-[#800000]' : 
                        'text-slate-800'
                      }
                    `}>
                      {format(day, 'd')}
                    </span>
                    <div className={`
                      w-2.5 h-2.5 rounded-full shadow-sm
                      ${isAvailable ? 'bg-emerald-500 ring-2 ring-emerald-200' : 
                        isPartiallyBooked ? 'bg-yellow-400 ring-2 ring-yellow-200' : 
                        'bg-[#800000] ring-2 ring-[#800000]/20'
                      }
                    `} />
                  </div>
                  <div className="mt-auto pt-1">
                    {isAvailable && (
                      <p className="text-[9px] md:text-[10px] text-emerald-600 font-semibold tracking-wide">
                        AVAILABLE
                      </p>
                    )}
                    {isPartiallyBooked && dayEvents.length > 0 && (
                      <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 text-[9px] font-bold px-2 py-0.5 rounded-md inline-block border border-yellow-200/50 shadow-sm">
                        {dayEvents[0].slot}
                      </div>
                    )}
                    {isFullyBooked && (
                      <p className="text-[9px] md:text-[10px] text-[#800000] font-bold tracking-wide">
                        FULLY BOOKED
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
      <div className="bg-white p-4 md:p-5 rounded-2xl shadow-lg border border-slate-100">
        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-400 bg-emerald-50 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
            <span className="text-slate-700 font-semibold">AVAILABLE</span>
          </div>
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-yellow-400 bg-yellow-50 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
            <span className="text-slate-700 font-semibold">PARTIALLY BOOKED</span>
          </div>
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-3.5 h-3.5 rounded-full bg-[#800000] shadow-md ring-2 ring-[#800000]/20 group-hover:scale-110 transition-transform duration-200"></div>
            <span className="text-slate-700 font-semibold">FULLY BOOKED</span>
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

function DayModal({ date, events, mode, onClose, onSave }) {
  const [localEvents, setLocalEvents] = useState([...events]);
  const [form, setForm] = useState({ name: '', slot: 'Morning' });

  // Sync localEvents when events prop changes (e.g., when date changes)
  useEffect(() => {
    setLocalEvents([...events]);
  }, [events]);

  const add = () => {
    if (!form.name || localEvents.length >= MAX_EVENTS) return;
    setLocalEvents([...localEvents, { ...form, id: Date.now() }]);
    setForm({ name: '', slot: 'Morning' });
  };

  const remove = (id) => {
    setLocalEvents(localEvents.filter(e => e.id !== id));
  };

  const save = () => {
    onSave(format(date, 'yyyy-MM-dd'), localEvents);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4 transition-opacity duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl border border-slate-200 transform transition-all duration-300 ease-out max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#800000] tracking-tight">
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
          </div>

          <div className="space-y-3 mb-6">
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
            <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Add New Booking</h4>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Enter booking name"
                className="w-full p-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-all duration-200"
                onKeyDown={(e) => e.key === 'Enter' && add()}
              />
              <div className="flex gap-3">
                <select
                  value={form.slot}
                  onChange={e => setForm({ ...form, slot: e.target.value })}
                  className="flex-1 p-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-all duration-200"
                >
                  {TIME_SLOTS.map(s => <option key={s}>{s}</option>)}
                </select>
                <button 
                  onClick={add} 
                  disabled={!form.name}
                  className="bg-gradient-to-r from-[#800000] to-[#9a1a1a] text-white px-6 py-3.5 rounded-xl font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button 
              onClick={onClose} 
              className="flex-1 p-3.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all duration-200"
            >
              Close
            </button>
            {mode === 'admin' && (
              <button 
                onClick={save} 
                className="flex-1 p-3.5 bg-gradient-to-r from-[#D4AF37] to-[#e5c04a] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
