'use client';

import { API_BASE_URL } from '@/lib/environment';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    const savedKey = sessionStorage.getItem('adminKey');
    if (savedKey) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!password) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/session/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }), cache: 'no-store'
      });
      if (!response.ok) {
        setError(response.status === 429 ? 'Too many attempts. Please wait before trying again.' : response.status === 401 ? 'Incorrect password.' : 'Sign-in is temporarily unavailable.');
        setLoading(false); return;
      }
      const session = await response.json();
      sessionStorage.setItem('adminKey', session.token);
      setPassword('');
      router.push('/dashboard');
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="card max-w-md w-full space-y-7 p-8 sm:p-10">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-100">
            Qwen Proxy Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Sign in to your private staging dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-lg shadow-sm -space-y-px">
            <div>
              <label htmlFor="dashboard-password" className="sr-only">
                Dashboard password
              </label>
              <input
                id="dashboard-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-[#25272a] bg-[#0f1012] placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/20 border border-red-800 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-500 hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors duration-150"
            >
              {loading ? 'Verifying...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Staging access · short-lived secure session
          </p>
        </div>
      </div>
    </div>
  );
}
