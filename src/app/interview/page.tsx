'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProviderSettings } from '@/lib/providers';
import { Role } from '@/lib/types';
import { InterviewRoom } from '@/components/InterviewRoom';

export default function InterviewPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!getProviderSettings()) {
      router.replace('/');
      return;
    }
    // Get role from sessionStorage
    const roleData = sessionStorage.getItem('interviewRole');
    if (roleData) {
      try {
        const parsedRole = JSON.parse(roleData) as Role;
        setRole(parsedRole);
      } catch {
        router.push('/');
      }
    } else {
      router.push('/');
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center text-white">
        <div className="text-xl">Loading interview...</div>
      </div>
    );
  }

  if (!role) {
    return null;
  }

  return <InterviewRoom role={role} />;
}