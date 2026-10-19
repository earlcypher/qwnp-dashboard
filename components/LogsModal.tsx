'use client';

import { useState, useEffect } from 'react';
import { getRequestLogs, type RequestLog } from '@/lib/api';

interface LogsModalProps {
  adminKey: string;
  onClose: () => void;
}

export default function LogsModal({ adminKey, onClose }: LogsModalProps) {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    loadLogs();
  }, [statusFilter, limit]);

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const filters: any = { limit };
      if (statusFilter) filters.status_code = parseInt(statusFilter);

      const response = await getRequestLogs(adminKey, filters);
      setLogs(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) return 'badge-success';
    if (status >= 400 && status < 500) return 'bg-yellow-900/30 text-yellow-400 border-yellow-800';
    if (status >= 500) return 'badge-danger';
    return 'bg-gray-700/30 text-gray-400 border-gray-700';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
        <div className="card p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <div className="text-gray-400">Loading logs...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="card max-w-7xl w-full my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#25272a]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-100">Request Logs</h2>
              <p className="text-gray-400 text-sm mt-1">View all API requests and responses</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#0f1012] border border-[#25272a] text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="200">Success (2xx)</option>
                <option value="400">Client Errors (4xx)</option>
                <option value="500">Server Errors (5xx)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Limit
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#0f1012] border border-[#25272a] text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="25">25 logs</option>
                <option value="50">50 logs</option>
                <option value="100">100 logs</option>
                <option value="200">200 logs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Logs Table */}
        <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          <div className="bg-[#050607] rounded-xl border border-[#25272a] overflow-hidden">
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">No logs found</div>
                <div className="text-gray-600 text-sm">
                  Requests will appear here once your API starts receiving traffic
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#25272a]">
                  <thead className="bg-[#141517]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Method
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Endpoint
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Time (ms)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        API Key
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#25272a]">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#141517] transition-colors duration-150">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                          {formatTime(log.created_at)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded bg-[#1d1e20] text-gray-300">
                            {log.method}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300 font-mono">
                          {log.endpoint}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`badge ${getStatusBadge(log.status_code)}`}>
                            {log.status_code}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                          {log.response_time_ms ? `${log.response_time_ms}ms` : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                          {log.api_keys?.name || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer Info */}
          {logs.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Showing {logs.length} most recent logs
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
