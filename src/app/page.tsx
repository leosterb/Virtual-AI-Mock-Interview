'use client';

import { useState } from 'react';
import { LandingPage } from '@/components/LandingPage';
import { ProviderSetup } from '@/components/ProviderSetup';
import { getProviderSettings, setProviderSettings } from '@/lib/providers';
import { useRouter } from 'next/navigation';
import { Role } from '@/lib/types';
import { RoleSelector } from '@/components/RoleSelector';

export default function Home() {
  const router = useRouter();
  const [screen, setScreen] = useState<'landing' | 'setup' | 'roles'>(() => getProviderSettings() ? 'roles' : 'landing');

  const handleSelectRole = (role: Role) => {
    // Store role in sessionStorage for the interview page
    sessionStorage.setItem('interviewRole', JSON.stringify(role));
    router.push('/interview');
  };

  if (screen === 'landing') return <LandingPage onStart={() => setScreen(getProviderSettings() ? 'roles' : 'setup')} />;
  if (screen === 'setup') return <ProviderSetup onReady={() => setScreen('roles')} onBack={() => setScreen(getProviderSettings() ? 'roles' : 'landing')} />;

  const settings = getProviderSettings();
  return <RoleSelector onSelectRole={handleSelectRole} onHome={() => setScreen('landing')}
    providerLabel={settings?.provider === 'gemini' ? 'Google Gemini' : 'Your AI provider'}
    onChangeProvider={() => setScreen('setup')}
    onClearKey={() => { setProviderSettings(null); setScreen('landing'); }} />;
}
