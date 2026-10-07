'use client';

import { useState } from 'react';
import { ProviderSetup } from '@/components/ProviderSetup';
import { getProviderSettings, setProviderSettings } from '@/lib/providers';
import { useRouter } from 'next/navigation';
import { Role } from '@/lib/types';
import { RoleSelector } from '@/components/RoleSelector';

export default function Home() {
  const router = useRouter();
  const [configured, setConfigured] = useState(() => Boolean(getProviderSettings()));

  const handleSelectRole = (role: Role) => {
    // Store role in sessionStorage for the interview page
    sessionStorage.setItem('interviewRole', JSON.stringify(role));
    router.push('/interview');
  };

  if (!configured) return <ProviderSetup onReady={() => setConfigured(true)} />;

  return <>
    <div className="bg-slate-900 px-6 pt-6 text-right text-white">
      <button className="underline" onClick={() => setConfigured(false)}>Change provider or key</button>
      <button className="ml-6 underline" onClick={() => { setProviderSettings(null); setConfigured(false); }}>Clear key</button>
    </div>
    <RoleSelector onSelectRole={handleSelectRole} />
  </>;
}