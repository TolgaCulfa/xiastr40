'use client';

import { useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

export default function DdosShieldPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const domain = (params?.domain as string) || 'deneme.xias.tr';
  const customTarget = searchParams.get('target');

  useEffect(() => {
    const token = `xias_sec_${Math.random().toString(36).substring(2, 12)}`;
    let url = `/underattack?domain=${encodeURIComponent(domain)}&token=${token}`;
    if (customTarget) {
      url += `&target=${encodeURIComponent(customTarget)}`;
    }
    router.replace(url);
  }, [domain, customTarget, router]);

  return null;
}
