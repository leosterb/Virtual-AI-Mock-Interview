'use client';

import { useRouter } from 'next/navigation';
import { Role } from '@/lib/types';
import { RoleSelector } from '@/components/RoleSelector';

export default function Home() {
  const router = useRouter();

  const handleSelectRole = (role: Role) => {
    // Store role in sessionStorage for the interview page
    sessionStorage.setItem('interviewRole', JSON.stringify(role));
    router.push('/interview');
  };

  return <RoleSelector onSelectRole={handleSelectRole} />;
}