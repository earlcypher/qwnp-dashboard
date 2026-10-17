'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { listApiKeys, updateApiKey, type ApiKey } from '@/lib/api';

export default function TiersPage() {
  const [adminKey, setAdminKey] = useState('');
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [bulkTier, setBulkTier] = useState<'free' | 'premium' | 'enterprise'>('free');
  const router = useRouter();

  useEffect(() => {
    const savedKey = sessionStorage.getItem('adminKey');
    if (!savedKey) {
      router.push('/');
      return;
    }
    setAdminKey(savedKey);
    loadKeys(savedKey);
  }, [router]);

  const loadKeys = async (key: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await listApiKeys(key, false);
      setKeys(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load keys');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedKeys.size === 0) {
      setError('Please select at least one key');
      return;
    }

    setError('');
    setSuccess('');

    try {
      await Promise.all(
        Array.from(selectedKeys).map(keyId =>
          updateApiKey(adminKey, keyId, { tier: bulkTier })
        )
      );

      setSuccess(`✓ Updated ${selectedKeys.size} key(s) to ${bulkTier} tier`);
      setSelectedKeys(new Set());
      await loadKeys(adminKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update keys');
    }
  };

  const toggleKeySelection = (keyId: string) => {
    const newSelection = new Set(selectedKeys);
    if (newSelection.has(keyId)) {
      newSelection.delete(keyId);
    } else {
      newSelection.add(keyId);
    }
    setSelectedKeys(newSelection);
  };

  const selectAllInTier = (tier: string) => {
    const tierKeys = keys.filter(k => k.tier === tier).map(k => k.id);
    setSelectedKeys(new Set(tierKeys));
  };

  const keysByTier = {
    free: keys.filter(k => k.tier === 'free'),
    premium: keys.filter(k => k.tier === 'premium'),
    enterprise: keys.filter(k => k.tier === 'enterprise'),
  };

  const tierStats = {
    free: {
      count: keysByTier.free.length,
      active: keysByTier.free.filter(k => k.is_active).length,
      totalUsage: keysByTier.free.reduce((sum, k) => sum + k.usage_count, 0),
    },
    premium: {
      count: keysByTier.premium.length,
      active: keysByTier.premium.filter(k => k.is_active).length,
      totalUsage: keysByTier.premium.reduce((sum, k) => sum + k.usage_count, 0),
    },
    enterprise: {
      count: keysByTier.enterprise.length,
      active: keysByTier.enterprise.filter(k => k.is_active).length,
      totalUsage: keysByTier.enterprise.reduce((sum, k) => sum + k.usage_count, 0),
    },
  };

  const tierInfo = {
    free: {
      name: 'Free',
      color: 'text-gray-400',
      bgColor: 'bg-gray-700/30',
      borderColor: 'border-gray-700',
      features: ['20 requests/min (default)', 'No daily quota', 'All models'],
    },
    premium: {
      name: 'Premium',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/30',
      borderColor: 'border-blue-800',
      features: ['60 requests/min (default)', 'No daily quota', 'All models'],
    },
    enterprise: {
      name: 'Enterprise',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/30',
      borderColor: 'border-purple-800',
      features: ['120 requests/min (default)', 'No daily quota', 'All models', 'Admin access'],
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <div className="text-gray-400">Loading tier data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Tier Management</h1>
              <p className="text-gray-400 text-sm mt-1">Manage API key tiers and features</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 border border-[#333] text-gray-300 rounded text-sm font-medium hover:bg-[#252525] transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900/20 border border-green-800 text-green-300 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Tier Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {Object.entries(tierInfo).map(([tier, info]) => {
            const stats = tierStats[tier as keyof typeof tierStats];
            return (
              <div key={tier} className="card p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className={`text-lg font-semibold ${info.color}`}>{info.name}</h3>
                  <button
                    onClick={() => selectAllInTier(tier)}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Select All
                  </button>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Keys:</span>
                    <span className="text-gray-200 font-medium">{stats.count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Active:</span>
                    <span className="text-green-400 font-medium">{stats.active}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Usage:</span>
                    <span className="text-gray-200 font-medium">{stats.totalUsage.toLocaleString()}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#333]">
                  <p className="text-xs text-gray-500 mb-2">Features:</p>
                  <ul className="space-y-1">
                    {info.features.map((feature, i) => (
                      <li key={i} className="text-xs text-gray-400">• {feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bulk Actions */}
        {selectedKeys.size > 0 && (
          <div className="card p-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">{selectedKeys.size} key(s) selected</span>
              <select
                value={bulkTier}
                onChange={(e) => setBulkTier(e.target.value as any)}
                className="px-3 py-2 bg-[#1a1a1a] border border-[#333] text-gray-100 rounded text-sm"
              >
                <option value="free">Move to Free</option>
                <option value="premium">Move to Premium</option>
                <option value="enterprise">Move to Enterprise</option>
              </select>
              <button
                onClick={handleBulkUpdate}
                className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700"
              >
                Apply
              </button>
              <button
                onClick={() => setSelectedKeys(new Set())}
                className="px-4 py-2 border border-[#333] text-gray-300 rounded text-sm hover:bg-[#252525]"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Keys by Tier */}
        <div className="space-y-6">
          {Object.entries(tierInfo).map(([tier, info]) => {
            const tierKeys = keysByTier[tier as keyof typeof keysByTier];
            if (tierKeys.length === 0) return null;

            return (
              <div key={tier} className="card">
                <div className="px-6 py-4 border-b border-[#333]">
                  <h3 className={`text-lg font-medium ${info.color}`}>
                    {info.name} Tier ({tierKeys.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#333]">
                    <thead className="bg-[#151515]">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={tierKeys.every(k => selectedKeys.has(k.id))}
                            onChange={() => {
                              if (tierKeys.every(k => selectedKeys.has(k.id))) {
                                setSelectedKeys(new Set(Array.from(selectedKeys).filter(id => !tierKeys.find(k => k.id === id))));
                              } else {
                                selectAllInTier(tier);
                              }
                            }}
                            className="w-4 h-4 text-indigo-600 bg-[#1a1a1a] border-[#333] rounded"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Usage</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Last Used</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#333]">
                      {tierKeys.map((key) => (
                        <tr key={key.id} className="hover:bg-[#151515]">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedKeys.has(key.id)}
                              onChange={() => toggleKeySelection(key.id)}
                              className="w-4 h-4 text-indigo-600 bg-[#1a1a1a] border-[#333] rounded"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-200">{key.name}</td>
                          <td className="px-6 py-4">
                            <span className={`badge ${key.is_active ? 'badge-success' : 'badge-danger'}`}>
                              {key.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">{key.usage_count}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
