'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getProviderSettings } from '@/lib/providers';
import { roles } from '@/lib/interviewPrompts';
import { useSessionValue } from '@/hooks/useSessionValue';
import { InterviewRoom } from '@/components/InterviewRoom';

export default function InterviewPage() {
  const router = useRouter();
  const { value, hydrated } = useSessionValue('interviewRole');
  const role = useMemo(() => {
    try { return roles.find(role => role.id === JSON.parse(value || 'null')?.id) ?? null; }
    catch { return null; }
  }, [value]);
  const configured = Boolean(getProviderSettings());
  useEffect(() => {
    if (hydrated && (!role || !configured)) router.replace('/');
  }, [configured, hydrated, role, router]);

  if (!hydrated || !role || !configured) return (
    <div className="app-surface min-h-dvh flex items-center justify-center text-white">
      <div className="text-xl">Loading interview...</div>
    </div>
  );
  return <InterviewRoom role={role} />;
}
