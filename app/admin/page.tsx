'use client';

import { useState, useEffect } from 'react';
import PinLogin from '@/components/PinLogin';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <PinLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-100 p-4 sm:p-6 md:p-8 overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Management Dashboard</h1>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 sm:py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors touch-manipulation shrink-0"
          >
            Logout
          </button>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-lg shadow-md">
          <p className="text-slate-600">Your admin content goes here</p>
        </div>
      </div>
    </div>
  );
}
