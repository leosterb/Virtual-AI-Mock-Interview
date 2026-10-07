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

  const settings = getProviderSettings();
  return <RoleSelector onSelectRole={handleSelectRole}
    providerLabel={settings?.provider === 'gemini' ? 'Google Gemini' : 'Your AI provider'}
    onChangeProvider={() => setConfigured(false)}
    onClearKey={() => { setProviderSettings(null); setConfigured(false); }} />;
}
