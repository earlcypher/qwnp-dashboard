'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    if (!sessionStorage.getItem('adminKey')) {
      router.replace('/');
    }
  }, [router]);
}
