'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getAvailableModels, type AvailableModel } from './api';

/** Loads the server's current Qwen catalog and picks its first available model by default. */
export function useAvailableModels(adminSession: string) {
  const [models, setModels] = useState<AvailableModel[]>([]);
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestSequence = useRef(0);

  const refresh = useCallback(async () => {
    const sequence = ++requestSequence.current;
    if (!adminSession) {
      setModels([]); setModel(''); setLoading(false); setError('');
      return;
    }
    setLoading(true); setError('');
    try {
      const result = await getAvailableModels(adminSession);
      if (sequence !== requestSequence.current) return;
      const available = result.data.filter(item => typeof item.id === 'string' && item.id.trim());
      setModels(available);
      setModel(current => available.some(item => item.id === current) ? current : available[0]?.id || '');
      if (available.length === 0) setError('Qwen returned no available models. Refresh the list to retry.');
    } catch (err) {
      if (sequence === requestSequence.current) setError(err instanceof Error ? err.message : 'Could not load current Qwen models');
    } finally {
      if (sequence === requestSequence.current) setLoading(false);
    }
  }, [adminSession]);

  useEffect(() => {
    setModels([]); setModel(''); setError('');
    void refresh();
    return () => { ++requestSequence.current; };
  }, [refresh]);

  return { models, model, setModel, loading, error, refresh };
}
