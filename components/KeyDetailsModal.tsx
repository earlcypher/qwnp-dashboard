'use client';

import { useState, useEffect } from 'react';
import { getKeyAnalytics, updateApiKey, deleteApiKey, type KeyStats, type ApiKey } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface KeyDetailsModalProps {
  apiKey: ApiKey;
  adminKey: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function KeyDetailsModal({ apiKey, adminKey, onClose, onUpdate }: KeyDetailsModalProps) {
  const [stats, setStats] = useState<KeyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(apiKey.name);
  const [editTier, setEditTier] = useState(apiKey.tier);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStats();
  }, [apiKey.id]);

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getKeyAnalytics(adminKey, apiKey.id);
      setStats(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updates: any = {};
      if (editName !== apiKey.name) updates.name = editName;
      if (editTier !== apiKey.tier) updates.tier = editTier;

      if (Object.keys(updates).length > 0) {
        await updateApiKey(adminKey, apiKey.id, updates);
        onUpdate();
        setIsEditing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update key');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${apiKey.name}"? This cannot be undone.`)) return;

    try {
      await deleteApiKey(adminKey, apiKey.id);
      onUpdate();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete key');
    }
  };

  const handleToggleActive = async () => {
    try {
      await updateApiKey(adminKey, apiKey.id, { is_active: !apiKey.is_active });
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  const successRate = stats
    ? stats.total_requests > 0
      ? ((stats.success_count / stats.total_requests) * 100).toFixed(1)
      : '0'
    : '0';

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-[#0f1012] border-b border-[#25272a] px-6 py-4 flex justify-between items-start">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-xl font-semibold bg-[#050607] border border-[#25272a] text-gray-100 rounded px-2 py-1 w-full max-w-md"
              />
            ) : (
              <h2 className="text-xl font-semibold text-gray-100">{apiKey.name}</h2>
            )}
            <div className="flex items-center gap-3 mt-2">
              {isEditing ? (
                <select
                  value={editTier}
                  onChange={(e) => setEditTier(e.target.value as any)}
                  className="text-sm px-2 py-1 bg-[#050607] border border-[#25272a] text-gray-100 rounded"
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              ) : (
                <span className={`badge ${
                  apiKey.tier === 'enterprise' ? 'bg-purple-900/30 text-purple-400 border-purple-800' :
                  apiKey.tier === 'premium' ? 'bg-blue-900/30 text-blue-400 border-blue-800' :
                  'bg-gray-700/30 text-gray-400 border-gray-700'
                }`}>
                  {apiKey.tier}
                </span>
              )}
              <span className={`badge ${apiKey.is_active ? 'badge-success' : 'badge-danger'}`}>
                {apiKey.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="bg-[#0b0c0e] p-5 rounded-xl border border-[#25272a]">
              <div className="text-sm text-gray-400">Total Requests</div>
              <div className="text-2xl font-semibold text-gray-100 mt-1">
                {stats?.total_requests || 0}
              </div>
            </div>
            <div className="bg-[#0b0c0e] p-5 rounded-xl border border-[#25272a]">
              <div className="text-sm text-gray-400">Success Rate</div>
              <div className="text-2xl font-semibold text-green-400 mt-1">
                {successRate}%
              </div>
            </div>
            <div className="bg-[#0b0c0e] p-5 rounded-xl border border-[#25272a]">
              <div className="text-sm text-gray-400">Avg Response</div>
              <div className="text-2xl font-semibold text-blue-400 mt-1">
                {stats?.avg_response_time ? `${stats.avg_response_time.toFixed(0)}ms` : 'N/A'}
              </div>
            </div>
            <div className="bg-[#0b0c0e] p-5 rounded-xl border border-[#25272a]">
              <div className="text-sm text-gray-400">Last Used</div>
              <div className="text-sm font-medium text-gray-300 mt-2">
                {formatDate(apiKey.last_used_at)}
              </div>
            </div>
          </div>

          {/* Usage Chart */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
              <div className="text-gray-400 text-sm">Loading statistics...</div>
            </div>
          ) : stats && stats.requests_by_day && stats.requests_by_day.length > 0 ? (
            <div className="bg-[#0b0c0e] p-5 rounded-xl border border-[#25272a]">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Usage Over Time</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats.requests_by_day} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 6" stroke="#222427" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#85868b', fontSize: 10 }} tickMargin={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#85868b', fontSize: 10 }} width={38} />
                  <Tooltip contentStyle={{ backgroundColor: '#111214', border: '1px solid #2a2b2f', borderRadius: 12, color: '#f4f4f5' }} />
                  <Legend iconType="circle" iconSize={7} wrapperStyle={{ color: '#a0a1a6', fontSize: 10, paddingTop: 8 }} />
                  <Line type="monotone" dataKey="total" stroke="#a394ff" name="Total" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="success" stroke="#41d6a3" name="Success" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="errors" stroke="#ff707d" name="Errors" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-[#0b0c0e] p-8 rounded-xl border border-[#25272a] text-center">
              <div className="text-gray-500">No usage data available</div>
            </div>
          )}

          {/* Key Details */}
          <div className="bg-[#0b0c0e] p-5 rounded-xl border border-[#25272a] space-y-2">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Key Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Created:</span>
                <span className="ml-2 text-gray-200">{formatDate(apiKey.created_at)}</span>
              </div>
              <div>
                <span className="text-gray-400">Key ID:</span>
                <span className="ml-2 text-gray-200 font-mono text-xs">{apiKey.id}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-[#25272a]">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-500 text-white rounded text-sm font-medium hover:bg-indigo-400 disabled:opacity-50 transition-colors duration-150"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(apiKey.name);
                    setEditTier(apiKey.tier);
                  }}
                  disabled={saving}
                  className="px-4 py-2 border border-[#25272a] text-gray-300 rounded text-sm font-medium hover:bg-[#1d1e20] disabled:opacity-50 transition-colors duration-150"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded text-sm font-medium hover:bg-indigo-400 transition-colors duration-150"
                >
                  Edit Key
                </button>
                <button
                  onClick={handleToggleActive}
                  className="px-4 py-2 border border-[#25272a] text-gray-300 rounded text-sm font-medium hover:bg-[#1d1e20] transition-colors duration-150"
                >
                  {apiKey.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors duration-150"
                >
                  Delete Key
                </button>
                <button
                  onClick={onClose}
                  className="ml-auto px-4 py-2 border border-[#25272a] text-gray-300 rounded text-sm font-medium hover:bg-[#1d1e20] transition-colors duration-150"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
