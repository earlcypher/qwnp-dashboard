'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { readAdminSession, clearLegacyAdminKey } from './adminSession';

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    clearLegacyAdminKey();
    if (!readAdminSession()) {
      router.replace('/');
    }
  }, [router]);
}
