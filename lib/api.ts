/**
 * API Client for Qwen Proxy Admin API
 */

// API base URL - configurable via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiKey {
  id: string;
  key?: string; // Only present on creation
  name: string;
  tier: 'free' | 'premium' | 'enterprise';
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  usage_count: number;
}

export interface StatsResponse {
  success: boolean;
  data: {
    total_keys: number;
    active_keys: number;
    total_requests: number;
    by_tier: {
      free: number;
      premium: number;
      enterprise: number;
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

interface ApiErrorResponse {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

/**
 * List all API keys
 */
export async function listApiKeys(
  adminKey: string,
  activeOnly: boolean = false
): Promise<ApiResponse<ApiKey[]>> {
  const url = new URL(`${API_BASE_URL}/admin/api-keys`);
  if (activeOnly) {
    url.searchParams.set('active_only', 'true');
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
    throw new ApiError(error.error?.message || 'Failed to list API keys', response.status);
  }

  return response.json();
}

/**
 * Create a new API key
 */
export async function createApiKey(
  adminKey: string,
  name: string,
  tier: 'free' | 'premium' | 'enterprise'
): Promise<ApiResponse<ApiKey>> {
  const response = await fetch(`${API_BASE_URL}/admin/api-keys`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, tier }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error.message || 'Failed to create API key');
  }

  return response.json();
}

/**
 * Update an API key
 */
export async function updateApiKey(
  adminKey: string,
  keyId: string,
  updates: {
    name?: string;
    tier?: 'free' | 'premium' | 'enterprise';
    is_active?: boolean;
  }
): Promise<ApiResponse<ApiKey>> {
  const response = await fetch(`${API_BASE_URL}/admin/api-keys/${keyId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error.message || 'Failed to update API key');
  }

  return response.json();
}

/**
 * Delete an API key
 */
export async function deleteApiKey(
  adminKey: string,
  keyId: string
): Promise<ApiResponse<{ id: string; name: string; is_active: boolean }>> {
  const response = await fetch(`${API_BASE_URL}/admin/api-keys/${keyId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error.message || 'Failed to delete API key');
  }

  return response.json();
}

/**
 * Get usage statistics
 */
export async function getStats(adminKey: string): Promise<StatsResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error.message || 'Failed to get statistics');
  }

  return response.json();
}

// ===== Analytics API Functions =====

export interface RequestLog {
  id: string;
  api_key_id: string | null;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number | null;
  error_message: string | null;
  error_type: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  api_keys?: {
    id: string;
    name: string;
    tier: string;
  };
}

export interface UsageStats {
  total_requests: number;
  success_count: number;
  error_count: number;
  requests_by_day: Array<{
    date: string;
    total: number;
    success: number;
    errors: number;
  }>;
  requests_by_status: Record<string, number>;
  top_keys: Array<{
    id: string;
    name: string;
    tier: string;
    request_count: number;
  }>;
}

export interface KeyStats {
  total_requests: number;
  success_count: number;
  error_count: number;
  avg_response_time: number;
  last_used: string | null;
  requests_by_day: Array<{
    date: string;
    total: number;
    success: number;
    errors: number;
  }>;
}

/**
 * Get request logs with optional filters
 */
export async function getRequestLogs(
  adminKey: string,
  filters?: {
    limit?: number;
    offset?: number;
    api_key_id?: string;
    status_code?: number;
    start_date?: string;
    end_date?: string;
  }
): Promise<ApiResponse<RequestLog[]> & { pagination: { limit: number; offset: number; total: number } }> {
  const params = new URLSearchParams();

  if (filters?.limit) params.set('limit', filters.limit.toString());
  if (filters?.offset) params.set('offset', filters.offset.toString());
  if (filters?.api_key_id) params.set('api_key_id', filters.api_key_id);
  if (filters?.status_code) params.set('status_code', filters.status_code.toString());
  if (filters?.start_date) params.set('start_date', filters.start_date);
  if (filters?.end_date) params.set('end_date', filters.end_date);

  const response = await fetch(`${API_BASE_URL}/admin/analytics/logs?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error.message || 'Failed to fetch request logs');
  }

  return response.json();
}

/**
 * Get usage analytics
 */
export async function getUsageAnalytics(
  adminKey: string,
  filters?: {
    days?: number;
    api_key_id?: string;
  }
): Promise<ApiResponse<UsageStats>> {
  const params = new URLSearchParams();

  if (filters?.days) params.set('days', filters.days.toString());
  if (filters?.api_key_id) params.set('api_key_id', filters.api_key_id);

  const response = await fetch(`${API_BASE_URL}/admin/analytics/usage?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error.message || 'Failed to fetch usage analytics');
  }

  return response.json();
}

/**
 * Get statistics for a specific API key
 */
export async function getKeyAnalytics(
  adminKey: string,
  keyId: string
): Promise<ApiResponse<KeyStats>> {
  const response = await fetch(`${API_BASE_URL}/admin/analytics/keys/${keyId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error.message || 'Failed to fetch key analytics');
  }

  return response.json();
}
