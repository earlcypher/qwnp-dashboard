'use client';

import { useState, useEffect } from 'react';
import CookieGuide from './CookieGuide';
import { parseJWT, buildCookiesTxt, parseCookiesTxt, parseFullCookieString, parseFullHeaders } from '../lib/cookieUtils';

interface CookieStatus {
  source: 'environment' | 'file' | 'runtime';
  exists: boolean;
  valid: boolean;
  cookie_count: number;
  has_token: boolean;
  last_modified: string | null;
  file_path: string | null;
  file_size?: number;
}

interface CookieTestResult {
  success: boolean;
  status_code?: number;
  response_time?: number;
  error?: string;
  message: string;
}

interface CookieManagementProps {
  adminKey: string;
  apiUrl: string;
}

export default function CookieManagement({ adminKey, apiUrl }: CookieManagementProps) {
  const [status, setStatus] = useState<CookieStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testing, setTesting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Individual cookie fields
  const [token, setToken] = useState('');
  const [bxUa, setBxUa] = useState('');
  const [bxUmidtoken, setBxUmidtoken] = useState('');

  // Full paste fields
  const [fullCookieString, setFullCookieString] = useState('');
  const [fullHeaders, setFullHeaders] = useState('');

  // UI state
  const [showManualInput, setShowManualInput] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showCookieGuide, setShowCookieGuide] = useState(false);
  const [showQuickPaste, setShowQuickPaste] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiUrl}/admin/cookies/status`, {
        headers: {
          'Authorization': `Bearer ${adminKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cookie status');
      }

      const result = await response.json();
      setStatus(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cookie status');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setError('');
    setSuccess('');
    try {
      // Validate required fields before testing
      if (!token.trim()) {
        throw new Error('Token is required for testing');
      }
      if (!bxUa.trim()) {
        throw new Error('bx-ua header is required for testing');
      }

      // Build test payload with current form values
      const cookiesContent = buildCookiesTxt(token.trim(), undefined, bxUmidtoken.trim());
      const headersPayload = {
        bxUa: bxUa.trim(),
        bxUmidtoken: bxUmidtoken.trim() || undefined
      };

      const response = await fetch(`${apiUrl}/admin/cookies/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cookies: cookiesContent,
          headers: headersPayload
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to test connection');
      }

      const result = await response.json();
      const testResult: CookieTestResult = result.data;

      if (testResult.success) {
        setSuccess(`✓ ${testResult.message} (${testResult.response_time}ms)`);
      } else {
        setError(`✗ ${testResult.message}: ${testResult.error || 'Unknown error'}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test connection');
    } finally {
      setTesting(false);
    }
  };

  const handleSaveCookies = async () => {
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      if (!token.trim()) {
        throw new Error('Token is required');
      }

      // Validate JWT format
      const jwtParse = parseJWT(token);
      if (!jwtParse.valid) {
        throw new Error('Invalid JWT token format');
      }

      if (!bxUa.trim()) {
        throw new Error('bx-ua header is required for anti-bot protection');
      }

      // Build cookies.txt content (minimal - only required cookies)
      const cookiesContent = buildCookiesTxt(token.trim(), undefined, bxUmidtoken.trim());

      // Upload cookies
      const cookiesResponse = await fetch(`${apiUrl}/admin/cookies/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: cookiesContent }),
      });

      if (!cookiesResponse.ok) {
        const errorData = await cookiesResponse.json();
        throw new Error(errorData.error?.message || 'Failed to upload cookies');
      }

      // Upload headers (bx-ua and optional bx-umidtoken)
      const headersResponse = await fetch(`${apiUrl}/admin/headers/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bxUa: bxUa.trim(),
          bxUmidtoken: bxUmidtoken.trim() || undefined
        }),
      });

      if (!headersResponse.ok) {
        const errorData = await headersResponse.json();
        throw new Error(errorData.error?.message || 'Failed to upload headers');
      }

      const cookiesResult = await cookiesResponse.json();
      const headersResult = await headersResponse.json();
      const runtimeOnly = !cookiesResult.data.persisted || !headersResult.data.persisted;
      setSuccess(runtimeOnly
        ? '✓ Credentials updated for this process. Update COOKIES_B64/HEADERS_B64 in your deployment settings to survive a restart.'
        : '✓ Cookies and headers saved successfully.');
      setShowManualInput(false);
      await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save cookies');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (content: string) => {
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      if (!content.trim()) {
        throw new Error('File content cannot be empty');
      }

      // Parse to extract important cookies
      const parsed = parseCookiesTxt(content);

      if (parsed.token) setToken(parsed.token);
      if (parsed.bxUmidtoken) setBxUmidtoken(parsed.bxUmidtoken);

      const response = await fetch(`${apiUrl}/admin/cookies/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to upload cookies');
      }

      const result = await response.json();
      setSuccess(result.data.persisted
        ? `✓ ${result.data.cookie_count} cookies saved`
        : '✓ Cookies updated for this process only. Update COOKIES_B64 in deployment settings before a restart.');
      setShowFileUpload(false);
      await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload cookies');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleFileUpload(content);
    };
    reader.readAsText(file);
  };

  const handleQuickParse = () => {
    setError('');
    setSuccess('');

    try {
      // Parse cookies
      const parsedCookies = parseFullCookieString(fullCookieString);

      // Parse headers
      const parsedHeaders = parseFullHeaders(fullHeaders);

      // Auto-fill fields
      if (parsedCookies.token) {
        setToken(parsedCookies.token);
      }

      if (parsedCookies.bxUmidtoken) {
        setBxUmidtoken(parsedCookies.bxUmidtoken);
      }

      if (parsedHeaders.bxUa) {
        setBxUa(parsedHeaders.bxUa);
      }

      if (parsedHeaders.bxUmidtoken && !parsedCookies.bxUmidtoken) {
        setBxUmidtoken(parsedHeaders.bxUmidtoken);
      }

      // Check what was found
      const found = [];
      if (parsedCookies.token) found.push(`token (${parsedCookies.token.length} chars)`);
      if (parsedHeaders.bxUa) found.push(`bx-ua (${parsedHeaders.bxUa.length} chars)`);
      if (parsedCookies.bxUmidtoken || parsedHeaders.bxUmidtoken) found.push('bx-umidtoken');

      if (found.length > 0) {
        setSuccess(`✓ Parsed and filled: ${found.join(', ')}`);
        setShowQuickPaste(false);
        setShowManualInput(true);
      } else {
        setError('No valid credentials found in pasted content. Please check the format.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse credentials');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getTokenExpiration = () => {
    if (!token) return null;
    const parsed = parseJWT(token);
    if (!parsed.valid || !parsed.exp) return null;

    const now = Math.floor(Date.now() / 1000);
    const isExpired = parsed.exp < now;

    return {
      date: formatDate(parsed.exp),
      expired: isExpired,
      daysLeft: Math.floor((parsed.exp - now) / 86400)
    };
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
          <span className="text-gray-400">Loading cookie status...</span>
        </div>
      </div>
    );
  }

  const tokenExp = getTokenExpiration();

  return (
    <>
      <div className="card">
      <div className="px-6 py-4 border-b border-[#333]">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-100">Qwen API Authentication</h2>
            <p className="text-sm text-gray-400 mt-1">
              Manage authentication credentials for Qwen web chat API
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCookieGuide(true)}
              className="px-4 py-2 border border-[#333] text-gray-300 rounded text-sm font-medium hover:bg-[#252525] transition-colors"
            >
              📖 Cookie Guide
            </button>
            <button
              onClick={handleTest}
              disabled={testing || !status?.valid}
              className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {testing ? 'Testing...' : '🔍 Test Connection'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Notifications */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">✕</button>
          </div>
        )}
        {success && (
          <div className="bg-green-900/20 border border-green-800 text-green-300 px-4 py-3 rounded flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-300">✕</button>
          </div>
        )}

        {/* Cookie Expiry Warning */}
        {token && (() => {
          const tokenExp = getTokenExpiration();
          if (!tokenExp) return null;

          if (tokenExp.expired) {
            return (
              <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <div className="font-semibold">Token Expired</div>
                  <div className="text-sm text-red-400">
                    Your Qwen authentication token expired on {tokenExp.date}. Please capture fresh credentials.
                  </div>
                </div>
              </div>
            );
          } else if (tokenExp.daysLeft <= 3) {
            return (
              <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded flex items-center gap-3">
                <span className="text-2xl">🔴</span>
                <div className="flex-1">
                  <div className="font-semibold">Token Expiring Soon</div>
                  <div className="text-sm text-red-400">
                    Only {tokenExp.daysLeft} day{tokenExp.daysLeft !== 1 ? 's' : ''} left! Expires: {tokenExp.date}
                  </div>
                </div>
              </div>
            );
          } else if (tokenExp.daysLeft <= 7) {
            return (
              <div className="bg-yellow-900/20 border border-yellow-800 text-yellow-300 px-4 py-3 rounded flex items-center gap-3">
                <span className="text-2xl">🟡</span>
                <div className="flex-1">
                  <div className="font-semibold">Token Expiring</div>
                  <div className="text-sm text-yellow-400">
                    {tokenExp.daysLeft} days remaining. Expires: {tokenExp.date}
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Cookie Status Cards */}
        {status && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#0a0a0a] p-4 rounded border border-[#333]">
              <div className="text-sm text-gray-400">Status</div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${status.valid ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-lg font-semibold text-gray-100">
                  {status.valid ? 'Loaded (not verified)' : 'Not loaded'}
                </span>
              </div>
            </div>

            <div className="bg-[#0a0a0a] p-4 rounded border border-[#333]">
              <div className="text-sm text-gray-400">Has Token</div>
              <div className="mt-2 text-lg font-semibold text-gray-100">
                {status.has_token ? '✓ Yes' : '✗ No'}
              </div>
            </div>

            <div className="bg-[#0a0a0a] p-4 rounded border border-[#333]">
              <div className="text-sm text-gray-400">Cookie Count</div>
              <div className="mt-2 text-lg font-semibold text-gray-100">
                {status.cookie_count}
              </div>
            </div>

            <div className="bg-[#0a0a0a] p-4 rounded border border-[#333]">
              <div className="text-sm text-gray-400">Last Modified</div>
              <div className="mt-2 text-sm text-gray-100">
                {status.last_modified ? new Date(status.last_modified).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowQuickPaste(!showQuickPaste);
              setShowManualInput(false);
              setShowFileUpload(false);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
          >
            {showQuickPaste ? 'Hide Quick Paste' : '⚡ Quick Paste'}
          </button>
          <button
            onClick={() => {
              setShowManualInput(!showManualInput);
              setShowFileUpload(false);
              setShowQuickPaste(false);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            {showManualInput ? 'Hide Manual Input' : '✏️ Manual Input'}
          </button>
          <button
            onClick={() => {
              setShowFileUpload(!showFileUpload);
              setShowManualInput(false);
              setShowQuickPaste(false);
            }}
            className="px-4 py-2 border border-[#333] text-gray-300 rounded text-sm font-medium hover:bg-[#252525] transition-colors"
          >
            {showFileUpload ? 'Cancel Upload' : '📤 Upload cookies.txt'}
          </button>
        </div>

        {/* Quick Paste Form */}
        {showQuickPaste && (
          <div className="bg-[#0a0a0a] p-6 rounded border border-green-800 space-y-4">
            <div className="mb-4">
              <h3 className="text-md font-medium text-gray-100 mb-2">⚡ Quick Paste</h3>
              <p className="text-sm text-gray-400">
                Copy cookies and headers directly from DevTools and paste below. We'll extract the values automatically.
              </p>
            </div>

            {/* Full Cookie String */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Cookie String
              </label>
              <textarea
                value={fullCookieString}
                onChange={(e) => setFullCookieString(e.target.value)}
                placeholder="token=eyJhbGc...; bx-umidtoken=xxx; other=values..."
                rows={4}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] text-gray-100 rounded font-mono text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                📋 Copy from DevTools → Network tab → Request Headers → Cookie
              </p>
            </div>

            {/* Full Headers */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Headers (Optional)
              </label>
              <textarea
                value={fullHeaders}
                onChange={(e) => setFullHeaders(e.target.value)}
                placeholder="bx-ua: 234!5Rve...&#10;bx-umidtoken: xxx...&#10;user-agent: Mozilla/5.0..."
                rows={6}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] text-gray-100 rounded font-mono text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                📋 Copy from DevTools → Network tab → Request Headers (entire section)
              </p>
            </div>

            {/* Parse Button */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleQuickParse}
                disabled={!fullCookieString.trim() && !fullHeaders.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ⚡ Parse & Fill Fields
              </button>
              <button
                onClick={() => {
                  setFullCookieString('');
                  setFullHeaders('');
                }}
                className="px-4 py-2 border border-[#333] text-gray-300 rounded text-sm font-medium hover:bg-[#252525] transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Help Text */}
            <div className="bg-blue-900/20 border border-blue-800 rounded p-3">
              <p className="text-xs text-blue-300">
                💡 <strong>Tip:</strong> Paste the full cookie string and/or headers, then click "Parse & Fill".
                The individual fields below will be automatically populated. After that, click "Save Credentials" to apply.
              </p>
            </div>
          </div>
        )}

        {/* Manual Input Form */}
        {showManualInput && (
          <div className="bg-[#0a0a0a] p-6 rounded border border-indigo-800 space-y-4">
            <div className="mb-4">
              <h3 className="text-md font-medium text-gray-100 mb-2">Required Credentials</h3>
              <p className="text-sm text-gray-400">
                Enter the minimum required credentials. See QUICK-START.md for capture instructions.
              </p>
            </div>

            {/* Token Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Token (JWT) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] text-gray-100 rounded font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {tokenExp && (
                <div className={`text-xs mt-1 ${tokenExp.expired ? 'text-red-400' : 'text-green-400'}`}>
                  {tokenExp.expired ? '✗ Expired' : '✓ Valid'} • Expires: {tokenExp.date}
                  {!tokenExp.expired && ` (${tokenExp.daysLeft} days left)`}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                JWT authentication token from Qwen session (found in cookies)
              </p>
            </div>

            {/* bx-ua Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                bx-ua (Anti-bot Header) <span className="text-red-400">*</span>
              </label>
              <textarea
                value={bxUa}
                onChange={(e) => setBxUa(e.target.value)}
                placeholder="234!5RveKIpkeeP4DVsflwu+IuMItRRzqIvLlMR3Nmm..."
                rows={4}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] text-gray-100 rounded font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {bxUa && (
                <div className="text-xs mt-1 text-gray-400">
                  Length: {bxUa.length} chars {bxUa.length > 1500 ? '✓' : '⚠️ Too short (should be ~2000 chars)'}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Required for bypassing Qwen's anti-bot protection (captured from request headers)
              </p>
            </div>

            {/* bx-umidtoken Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                bx-umidtoken (Machine ID) <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="text"
                value={bxUmidtoken}
                onChange={(e) => setBxUmidtoken(e.target.value)}
                placeholder="T2gApOqwXfrS_qPdaTRShpgfFvvoyj4k6be6dFIPviL..."
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] text-gray-100 rounded font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Unique machine identifier token (has fallback if not provided)
              </p>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveCookies}
                disabled={uploading || !token.trim() || !bxUa.trim()}
                className="px-6 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {uploading ? 'Saving...' : '💾 Save Credentials'}
              </button>
              <button
                onClick={() => {
                  setShowManualInput(false);
                  setError('');
                }}
                className="px-4 py-2 border border-[#333] text-gray-300 rounded text-sm font-medium hover:bg-[#252525] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* File Upload Form */}
        {showFileUpload && (
          <div className="bg-[#0a0a0a] p-6 rounded border border-[#333] space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload cookies.txt file
              </label>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileSelect}
                disabled={uploading}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
              />
              <p className="text-xs text-gray-500 mt-2">
                Upload your cookies.txt file in Netscape format (exported from browser extension)
              </p>
            </div>
          </div>
        )}

        {/* Environment Warning */}
        {status?.source === 'environment' && (
          <div className="bg-yellow-900/20 border border-yellow-800 text-yellow-300 px-4 py-3 rounded text-sm">
            ℹ️ Cookies are loaded from environment variable. File uploads update the file but won't affect runtime until server restart.
          </div>
        )}
      </div>
      </div>

      {/* Cookie Guide Modal */}
      {showCookieGuide && (
        <CookieGuide onClose={() => setShowCookieGuide(false)} />
      )}
    </>
  );
}
