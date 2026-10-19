'use client';

import { APP_ENV, API_BASE_URL } from '@/lib/environment';
import { readAdminSession, saveAdminSession, clearLegacyAdminKey } from '@/lib/adminSession';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bootstrapToken, setBootstrapToken] = useState('');
  const [setupRequired, setSetupRequired] = useState(false);
  const [setupAvailable, setSetupAvailable] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(APP_ENV === 'production');
  const [setupCheckFailed, setSetupCheckFailed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const production = APP_ENV === 'production';

  useEffect(() => {
    clearLegacyAdminKey();
    if (readAdminSession()) {
      router.push('/dashboard');
      return;
    }
    if (!production) {
      setCheckingSetup(false);
      return;
    }

    let cancelled = false;
    fetch(`${API_BASE_URL}/admin/session/setup-status`, { cache: 'no-store' })
      .then(async response => {
        const result = await response.json().catch(() => null);
        if (!response.ok || !result) throw new Error('Setup status unavailable');
        if (!cancelled) {
          setSetupRequired(Boolean(result.setupRequired));
          setSetupAvailable(Boolean(result.setupAvailable));
        }
      })
      .catch(() => {
        if (!cancelled) setSetupCheckFailed(true);
      })
      .finally(() => {
        if (!cancelled) setCheckingSetup(false);
      });
    return () => { cancelled = true; };
  }, [production, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const isFirstSetup = production && setupRequired;

    if (isFirstSetup && !setupAvailable) {
      setError('First-time setup is not enabled yet. Ask the service owner to configure the one-time setup code.');
      return;
    }
    if (!password) {
      setError(isFirstSetup ? 'Choose an admin password.' : 'Enter your dashboard password.');
      return;
    }
    if (isFirstSetup && password.length < 16) {
      setError('Choose a password with at least 16 characters.');
      return;
    }
    if (isFirstSetup && password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }
    if (isFirstSetup && !bootstrapToken) {
      setError('Enter the one-time setup code.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isFirstSetup ? 'setup' : 'login';
      const body = isFirstSetup
        ? { bootstrapToken, password, confirmPassword }
        : { password };
      const response = await fetch(`${API_BASE_URL}/admin/session/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        cache: 'no-store'
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const code = result?.error?.code;
        if (response.status === 429) setError('Too many attempts. Please wait before trying again.');
        else if (code === 'invalid_bootstrap_token') setError('The one-time setup code is invalid.');
        else if (code === 'setup_already_complete') {
          setSetupRequired(false);
          setSetupAvailable(false);
          setError('Initial setup is already complete. Sign in with your admin password.');
        } else if (code === 'setup_required') {
          setSetupRequired(true);
          setError('Complete the one-time setup before signing in.');
        } else if (code === 'password_too_short') setError('Choose a password with at least 16 characters.');
        else if (response.status === 401) setError(isFirstSetup ? 'The setup code was rejected.' : 'Incorrect password.');
        else setError(isFirstSetup ? 'First-time setup is temporarily unavailable.' : 'Sign-in is temporarily unavailable.');
        setLoading(false);
        return;
      }
      if (typeof result?.token !== 'string' || !result.token) throw new Error('The server did not issue a dashboard session.');
      saveAdminSession(result.token);
      setPassword('');
      setConfirmPassword('');
      setBootstrapToken('');
      router.push('/dashboard');
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const isFirstSetup = production && setupRequired;
  const blocked = checkingSetup || setupCheckFailed || (isFirstSetup && !setupAvailable);

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="card max-w-md w-full space-y-7 p-8 sm:p-10">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-100">
            {isFirstSetup ? 'Set up your private dashboard' : 'Qwen Proxy Dashboard'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {isFirstSetup ? 'One-time owner setup' : 'Sign in to your private dashboard'}
          </p>
        </div>

        {checkingSetup && <p className="text-center text-sm text-gray-400">Checking dashboard setup…</p>}
        {setupCheckFailed && (
          <div className="rounded-lg bg-red-900/20 border border-red-800 p-4 text-sm text-red-300">
            Could not check whether first-time setup is complete. The dashboard service may need its database migration and setup settings.
          </div>
        )}
        {isFirstSetup && !setupAvailable && !checkingSetup && !setupCheckFailed && (
          <div className="rounded-lg bg-yellow-900/20 border border-yellow-800 p-4 text-sm text-yellow-200">
            First-time setup is not enabled yet. The service owner must configure the one-time setup code on the backend.
          </div>
        )}

        {!blocked && <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-lg shadow-sm space-y-4">
            {isFirstSetup && <div>
              <label htmlFor="dashboard-bootstrap-code" className="sr-only">One-time setup code</label>
              <input
                id="dashboard-bootstrap-code"
                name="bootstrapToken"
                type="password"
                autoComplete="off"
                required
                maxLength={512}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-[#25272a] bg-[#0f1012] placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="One-time setup code"
                value={bootstrapToken}
                onChange={e => setBootstrapToken(e.target.value)}
              />
            </div>}
            <div>
              <label htmlFor="dashboard-password" className="sr-only">{isFirstSetup ? 'New admin password' : 'Dashboard password'}</label>
              <input
                id="dashboard-password"
                name="password"
                type="password"
                autoComplete={isFirstSetup ? 'new-password' : 'current-password'}
                required
                minLength={isFirstSetup ? 16 : undefined}
                maxLength={1024}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-[#25272a] bg-[#0f1012] placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder={isFirstSetup ? 'Create admin password (16+ characters)' : 'Enter password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {isFirstSetup && <div>
              <label htmlFor="dashboard-password-confirm" className="sr-only">Confirm admin password</label>
              <input
                id="dashboard-password-confirm"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={16}
                maxLength={1024}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-[#25272a] bg-[#0f1012] placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Confirm admin password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>}
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/20 border border-red-800 p-4">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-500 hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {loading ? (isFirstSetup ? 'Setting up…' : 'Verifying…') : (isFirstSetup ? 'Set admin password' : 'Sign in')}
          </button>
        </form>}

        <div className="text-center">
          <p className="text-xs text-gray-500">
            {isFirstSetup ? 'The setup code is used once and is not saved after setup.' : 'Private access · short-lived secure session'}
          </p>
        </div>
      </div>
    </div>
  );
}
