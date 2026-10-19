'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { listApiKeys, revealApiKey, type ApiKey } from './api';

/** Lists active keys and reveals only the user-selected secret, in memory for this view. */
export function usePlaygroundApiKey(adminSession: string) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [secret, setSecret] = useState('');
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [error, setError] = useState('');
  const requestSequence = useRef(0);

  useEffect(() => {
    let cancelled = false;
    ++requestSequence.current;
    setKeys([]); setSelectedId(''); setSecret(''); setError(''); setLoadingSecret(false);
    if (!adminSession) { setLoadingKeys(false); return; }
    setLoadingKeys(true);
    listApiKeys(adminSession, true).then(result => {
      if (!cancelled) setKeys(result.data.filter(key => key.is_active));
    }).catch(err => {
      if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load active API keys');
    }).finally(() => { if (!cancelled) setLoadingKeys(false); });
    return () => { cancelled = true; ++requestSequence.current; };
  }, [adminSession]);

  const selectKey = useCallback(async (keyId: string) => {
    const sequence = ++requestSequence.current;
    setSelectedId(keyId); setSecret(''); setError('');
    if (!keyId) { setLoadingSecret(false); return; }
    setLoadingSecret(true);
    try {
      const result = await revealApiKey(adminSession, keyId);
      if (sequence === requestSequence.current) setSecret(result.data.key);
    } catch (err) {
      if (sequence === requestSequence.current) setError(err instanceof Error ? err.message : 'Could not prepare selected API key');
    } finally {
      if (sequence === requestSequence.current) setLoadingSecret(false);
    }
  }, [adminSession]);

  return { keys, selectedId, selectedKey: keys.find(key => key.id === selectedId) || null, secret, loadingKeys, loadingSecret, error, selectKey };
}
