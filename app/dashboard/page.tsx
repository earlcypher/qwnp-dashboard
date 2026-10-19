'use client';
import { readAdminSession, clearAdminSession } from '@/lib/adminSession';

import { API_BASE_URL } from '@/lib/environment';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { listApiKeys, createApiKey, updateApiKey, deleteApiKey, getStats, getUsageAnalytics, ApiError, type ApiKey, type StatsResponse, type UsageStats } from '@/lib/api';
import UsageChart from '@/components/UsageChart';
import TopKeysChart from '@/components/TopKeysChart';
import KeyDetailsModal from '@/components/KeyDetailsModal';
import CookieManagement from '@/components/CookieManagement';
import PlaygroundModal from '@/components/PlaygroundModal';
import DocsModal from '@/components/DocsModal';
import TiersModal from '@/components/TiersModal';
import LogsModal from '@/components/LogsModal';

export default function DashboardPage() {
  const [adminKey, setAdminKey] = useState('');
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [filteredKeys, setFilteredKeys] = useState<ApiKey[]>([]);
  const [stats, setStats] = useState<StatsResponse['data'] | null>(null);
  const [analytics, setAnalytics] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyTier, setNewKeyTier] = useState<'free' | 'premium' | 'enterprise'>('free');
  const [createdKey, setCreatedKey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showPlaygroundModal, setShowPlaygroundModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showTiersModal, setShowTiersModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedKey = readAdminSession();
    if (!savedKey) {
      router.push('/');
      return;
    }
    setAdminKey(savedKey);
    loadData(savedKey);
  }, [router]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = keys.filter(key =>
        key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.tier.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredKeys(filtered);
    } else {
      setFilteredKeys(keys);
    }
  }, [searchQuery, keys]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !adminKey) return;

    const interval = setInterval(() => {
      loadData(adminKey);
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, adminKey]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close modal
      if (e.key === 'Escape' && showCreateModal && !createdKey) {
        setShowCreateModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCreateModal, createdKey]);

  const loadData = async (key: string) => {
    setLoading(true);
    setError('');
    try {
      const [keysResponse, statsResponse, analyticsResponse] = await Promise.all([
        listApiKeys(key, false),
        getStats(key),
        getUsageAnalytics(key, { days: 30 }).catch(() => ({ data: null })), // Graceful fallback if analytics not available
      ]);
      setKeys(keysResponse.data);
      setFilteredKeys(keysResponse.data);
      setStats(statsResponse.data);
      setAnalytics(analyticsResponse.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      if (err instanceof ApiError && err.status === 401) {
        clearAdminSession();
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    router.push('/');
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await createApiKey(adminKey, newKeyName, newKeyTier);
      setCreatedKey(response.data.key || '');
      setNewKeyName('');
      setNewKeyTier('free');
      await loadData(adminKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create key');
    }
  };

  const handleToggleActive = async (keyId: string, currentStatus: boolean) => {
    try {
      await updateApiKey(adminKey, keyId, { is_active: !currentStatus });
      setSuccess(`Key ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      setTimeout(() => setSuccess(''), 3000);
      await loadData(adminKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update key');
    }
  };

  const handleDeleteKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Delete "${keyName}"? This cannot be undone.`)) return;
    try {
      await deleteApiKey(adminKey, keyId);
      setSuccess('Key deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      await loadData(adminKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const maskKey = (key: string) => {
    if (key.length <= 12) return key;
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050607] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <div className="text-gray-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050607] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="mb-5 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-100">Qwen Proxy Dashboard</h1>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowPlaygroundModal(true)}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-500 transition-colors duration-150"
              >
                Playground
              </button>
              <button
                onClick={() => setShowDocsModal(true)}
                className="rounded-lg border border-[#25272a] bg-[#17181b] px-4 py-2 text-sm font-medium text-gray-300 transition-colors duration-150 hover:bg-[#222428]"
              >
                API Docs
              </button>
              <button
                onClick={() => setShowTiersModal(true)}
                className="rounded-lg border border-[#25272a] bg-[#17181b] px-4 py-2 text-sm font-medium text-gray-300 transition-colors duration-150 hover:bg-[#222428]"
              >
                Tiers
              </button>
              <button
                onClick={() => setShowLogsModal(true)}
                className="rounded-lg border border-[#25272a] bg-[#17181b] px-4 py-2 text-sm font-medium text-gray-300 transition-colors duration-150 hover:bg-[#222428]"
              >
                Logs
              </button>
              <button
                onClick={() => loadData(adminKey)}
                className="px-4 py-2 border border-[#25272a] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#1d1e20] transition-colors duration-150"
                title="Refresh data"
              >
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-[#25272a] rounded-lg text-sm font-medium text-gray-300 hover:bg-[#1d1e20] transition-colors duration-150"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Auto-refresh controls */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[#25272a] pt-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-[#0f1012] border-[#25272a] rounded focus:ring-indigo-500"
              />
              <label htmlFor="autoRefresh" className="text-sm text-gray-300">
                Auto-refresh
              </label>
            </div>
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                className="px-3 py-1 bg-[#0f1012] border border-[#25272a] text-gray-100 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="30">Every 30s</option>
                <option value="60">Every 1m</option>
                <option value="300">Every 5m</option>
              </select>
            )}
            {lastUpdated && (
              <span className="text-xs text-gray-500 ml-auto">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">×</button>
          </div>
        )}
        {success && (
          <div className="bg-green-900/20 border border-green-800 text-green-300 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-300">×</button>
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="mb-6 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="card flex min-h-[140px] flex-col justify-between p-5">
              <div className="text-sm font-medium text-gray-400">Total Keys</div>
              <div className="mt-4 text-3xl font-semibold tabular-nums text-gray-100">{stats.total_keys}</div>
            </div>
            <div className="card flex min-h-[140px] flex-col justify-between p-5">
              <div className="text-sm font-medium text-gray-400">Active Keys</div>
              <div className="mt-4 text-3xl font-semibold tabular-nums text-emerald-300">{stats.active_keys}</div>
            </div>
            <div className="card flex min-h-[140px] flex-col justify-between p-5">
              <div className="text-sm font-medium text-gray-400">Total Requests</div>
              <div className="mt-4 text-3xl font-semibold tabular-nums text-sky-300">{stats.total_requests}</div>
            </div>
            <div className="card flex min-h-[140px] flex-col p-5">
              <div className="text-sm font-medium text-gray-400">By Tier</div>
              <div className="mt-3 space-y-1 text-sm text-gray-300">
                <div>Free: {stats.by_tier.free}</div>
                <div>Premium: {stats.by_tier.premium}</div>
                <div>Enterprise: {stats.by_tier.enterprise}</div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Charts */}
        {analytics && (
          <div className="mb-6 grid grid-cols-1 items-stretch gap-4 xl:grid-cols-2">
            <section className="card flex min-w-0 flex-col p-5">
              <div className="mb-3 flex min-h-12 items-start justify-between gap-3">
                <div><h3 className="text-base font-semibold text-gray-100">Usage over time</h3><p className="mt-1 text-xs text-gray-500">Daily request volume and outcomes</p></div>
                <span className="rounded-lg border border-[#25272a] bg-[#141517] px-2.5 py-1 text-[11px] font-medium text-gray-400">30 days</span>
              </div>
              <div className="min-h-[300px] flex-1"><UsageChart data={analytics.requests_by_day} /></div>
            </section>
            <section className="card flex min-w-0 flex-col p-5">
              <div className="mb-3 flex min-h-12 items-start justify-between gap-3">
                <div><h3 className="text-base font-semibold text-gray-100">Top API keys</h3><p className="mt-1 text-xs text-gray-500">Request volume by tier</p></div>
                <span className="rounded-lg border border-[#25272a] bg-[#141517] px-2.5 py-1 text-[11px] font-medium text-gray-400">Ranked</span>
              </div>
              <div className="min-h-[300px] flex-1"><TopKeysChart data={analytics.top_keys} /></div>
            </section>
          </div>
        )}

        {/* Cookie Management */}
        <section className="mb-6">
          <CookieManagement adminKey={adminKey} apiUrl={API_BASE_URL} />
        </section>

        {/* API Keys List */}
        <div className="card">
          <div className="px-6 py-4 border-b border-[#25272a] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-lg font-medium text-gray-100">API Keys ({filteredKeys.length})</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search keys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 bg-[#0f1012] border border-[#25272a] text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-400 whitespace-nowrap transition-colors duration-150"
              >
                + Create Key
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredKeys.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">No API keys found</div>
                <div className="text-gray-600 text-sm mb-4">
                  {searchQuery ? 'Try adjusting your search' : 'Create your first API key to get started'}
                </div>
                {!searchQuery && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-400 transition-colors duration-150"
                  >
                    Create First Key
                  </button>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-[#25272a]">
                <thead className="bg-[#141517]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Usage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#25272a]">
                  {filteredKeys.map((key) => (
                    <tr
                      key={key.id}
                      className="hover:bg-[#141517] transition-colors duration-150 cursor-pointer"
                      onClick={() => setSelectedKey(key)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{key.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${
                          key.tier === 'enterprise' ? 'bg-purple-900/30 text-purple-400 border-purple-800' :
                          key.tier === 'premium' ? 'bg-blue-900/30 text-blue-400 border-blue-800' :
                          'bg-gray-700/30 text-gray-400 border-gray-700'
                        }`}>
                          {key.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${
                          key.is_active ? 'badge-success' : 'badge-danger'
                        }`}>
                          {key.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{key.usage_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 hidden sm:table-cell">
                        {new Date(key.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActive(key.id, key.is_active);
                            }}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors duration-150 text-left"
                          >
                            {key.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteKey(key.id, key.name);
                            }}
                            className="text-red-400 hover:text-red-300 transition-colors duration-150 text-left"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !createdKey) {
              setShowCreateModal(false);
            }
          }}
        >
          <div className="card max-w-md w-full p-6 animate-slide-in">
            <h3 className="text-lg font-medium text-gray-100 mb-4">Create New API Key</h3>
            {createdKey ? (
              <div>
                <p className="text-sm text-gray-400 mb-3">Your new API key has been created. Copy it now - you won't see it again!</p>
                <div className="bg-[#050607] p-3 rounded-xl border border-[#25272a] mb-4">
                  <code className="text-sm text-indigo-400 break-all">{createdKey}</code>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => copyToClipboard(createdKey)}
                    className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-400 transition-colors duration-150"
                  >
                    Copy Key
                  </button>
                  <button
                    onClick={() => {
                      setCreatedKey('');
                      setShowCreateModal(false);
                    }}
                    className="flex-1 px-4 py-2 border border-[#25272a] rounded-lg text-sm font-medium text-gray-300 hover:bg-[#1d1e20] transition-colors duration-150"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateKey}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#050607] border border-[#25272a] text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="My Application"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tier</label>
                  <select
                    value={newKeyTier}
                    onChange={(e) => setNewKeyTier(e.target.value as 'free' | 'premium' | 'enterprise')}
                    className="w-full px-3 py-2 bg-[#050607] border border-[#25272a] text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-400 transition-colors duration-150"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-[#25272a] rounded-lg text-sm font-medium text-gray-300 hover:bg-[#1d1e20] transition-colors duration-150"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Key Details Modal */}
      {selectedKey && (
        <KeyDetailsModal
          apiKey={selectedKey}
          adminKey={adminKey}
          onClose={() => setSelectedKey(null)}
          onUpdate={() => {
            loadData(adminKey);
            setSelectedKey(null);
          }}
        />
      )}

      {/* Playground Modal */}
      {showPlaygroundModal && (
        <PlaygroundModal
          adminKey={adminKey}
          onClose={() => setShowPlaygroundModal(false)}
        />
      )}

      {/* API Docs Modal */}
      {showDocsModal && (
        <DocsModal onClose={() => setShowDocsModal(false)} />
      )}

      {/* Tiers Modal */}
      {showTiersModal && (
        <TiersModal
          adminKey={adminKey}
          onClose={() => setShowTiersModal(false)}
          onUpdate={() => loadData(adminKey)}
        />
      )}

      {/* Logs Modal */}
      {showLogsModal && (
        <LogsModal
          adminKey={adminKey}
          onClose={() => setShowLogsModal(false)}
        />
      )}
    </div>
  );
}
