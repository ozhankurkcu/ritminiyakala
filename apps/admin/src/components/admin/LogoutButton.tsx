'use client';

import { useRouter } from 'next/navigation';
import { apiPath } from '@/lib/apiPath';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch(apiPath('/api/auth'), { method: 'DELETE' });
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors text-sm"
    >
      <span>🚪</span>
      Çıkış Yap
    </button>
  );
}
