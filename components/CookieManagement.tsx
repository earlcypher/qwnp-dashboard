'use client';

import { useState, useEffect } from 'react';

interface CookieStatus {
  source: 'environment' | 'file';
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
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [cookieContent, setCookieContent] = useState('');

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
      const response = await fetch(`${apiUrl}/admin/cookies/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to test connection');
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      if (!cookieContent.trim()) {
        throw new Error('Cookie content cannot be empty');
      }

      const response = await fetch(`${apiUrl}/admin/cookies/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: cookieContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to upload cookies');
      }

      const result = await response.json();
      setSuccess(`✓ ${result.message} - ${result.data.cookie_count} cookies uploaded`);
      setCookieContent('');
      setShowUploadForm(false);
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
      setCookieContent(content);
    };
    reader.readAsText(file);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleString();
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

  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-[#333]">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-100">Qwen API Cookies</h2>
            <p className="text-sm text-gray-400 mt-1">
              Manage authentication cookies for Qwen web chat API
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleTest}
              disabled={testing || !status?.valid}
              className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {testing ? 'Testing...' : '🔍 Test Connection'}
            </button>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="px-4 py-2 border border-[#333] text-gray-300 rounded text-sm font-medium hover:bg-[#252525] transition-colors"
            >
              {showUploadForm ? 'Cancel' : '📤 Upload Cookies'}
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

        {/* Cookie Status */}
        {status && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0a0a0a] p-4 rounded border border-[#333]">
              <div className="text-sm text-gray-400">Status</div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${status.valid ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-lg font-semibold text-gray-100">
                  {status.valid ? 'Valid' : 'Invalid'}
                </span>
              </div>
            </div>

            <div className="bg-[#0a0a0a] p-4 rounded border border-[#333]">
              <div className="text-sm text-gray-400">Source</div>
              <div className="mt-2 text-lg font-semibold text-gray-100 capitalize">
                {status.source}
              </div>
            </div>

            <div className="bg-[#0a0a0a] p-4 rounded border border-[#333]">
              <div className="text-sm text-gray-400">Cookie Count</div>
              <div className="mt-2 text-lg font-semibold text-gray-100">
                {status.cookie_count}
              </div>
            </div>

            <div className="bg-[#0a0a0a] p-4 rounded border border-[#333]">
              <div className="text-sm text-gray-400">Has Token</div>
              <div className="mt-2 text-lg font-semibold text-gray-100">
                {status.has_token ? '✓ Yes' : '✗ No'}
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        {status && (
          <div className="bg-[#0a0a0a] p-4 rounded border border-[#333] space-y-2 text-sm">
            {status.source === 'file' && status.file_path && (
              <div>
                <span className="text-gray-400">File Path:</span>
                <span className="ml-2 text-gray-200 font-mono text-xs">{status.file_path}</span>
              </div>
            )}
            {status.last_modified && (
              <div>
                <span className="text-gray-400">Last Modified:</span>
                <span className="ml-2 text-gray-200">{formatDate(status.last_modified)}</span>
              </div>
            )}
            {status.source === 'environment' && (
              <div className="text-yellow-400 text-sm">
                ℹ️ Cookies are loaded from COOKIES_B64 environment variable. File upload will update the file but won't affect runtime until restart.
              </div>
            )}
          </div>
        )}

        {/* Upload Form */}
        {showUploadForm && (
          <form onSubmit={handleUpload} className="bg-[#0a0a0a] p-6 rounded border border-[#333] space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload cookies.txt file or paste content
              </label>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 mb-3"
              />
              <textarea
                value={cookieContent}
                onChange={(e) => setCookieContent(e.target.value)}
                placeholder="# Netscape HTTP Cookie File&#10;# domain&#9;name&#9;value&#9;...&#10;qwen.chat.qq.com&#9;token&#9;your_token_value_here"
                rows={10}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] text-gray-100 rounded font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                Paste your cookies.txt file content in Netscape format. Must include the "token" cookie.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading || !cookieContent.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {uploading ? 'Uploading...' : 'Upload Cookies'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false);
                  setCookieContent('');
                }}
                className="px-4 py-2 border border-[#333] text-gray-300 rounded text-sm font-medium hover:bg-[#252525] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
