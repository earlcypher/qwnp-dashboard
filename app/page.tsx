'use client';

import { API_BASE_URL } from '@/lib/environment';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [adminKey, setAdminKey] = useState('');
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

    // Validate key is not empty
    if (!adminKey.trim()) {
      setError('Please enter an API key');
      setLoading(false);
      return;
    }

    try {
      // Test the key by making a request to the stats endpoint
      const apiUrl = API_BASE_URL;
      const response = await fetch(`${apiUrl}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${adminKey}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Invalid API key or insufficient permissions. Admin access required.');
        } else {
          setError('Failed to authenticate. Please try again.');
        }
        setLoading(false);
        return;
      }

      // Save to sessionStorage and redirect
      sessionStorage.setItem('adminKey', adminKey);
      router.push('/dashboard');
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-100">
            Qwen Proxy Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter your admin API key to continue
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="admin-key" className="sr-only">
                Admin API Key
              </label>
              <input
                id="admin-key"
                name="admin-key"
                type="password"
                autoComplete="off"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-[#333] bg-[#1a1a1a] placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-900/20 border border-red-800 p-4">
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verifying...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Only enterprise-tier API keys have admin access
          </p>
        </div>
      </div>
    </div>
  );
}
