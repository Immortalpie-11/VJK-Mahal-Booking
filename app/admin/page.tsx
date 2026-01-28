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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Management Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p>Your admin content goes here</p>
        </div>
      </div>
    </div>
  );
}
