'use client';

import { useState } from 'react';

export default function PinLogin({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('isAdmin', 'true');
      onSuccess();
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen min-h-[100dvh] p-4 sm:p-6 bg-gray-100">
      <div className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-lg shadow-md w-full max-w-sm mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Management Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN"
            className="w-full min-h-[48px] px-4 py-3 sm:py-2 border border-gray-300 rounded-lg text-black text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
            maxLength={4}
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full min-h-[48px] bg-blue-600 text-white py-3 sm:py-2 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors touch-manipulation active:scale-[0.98]"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
