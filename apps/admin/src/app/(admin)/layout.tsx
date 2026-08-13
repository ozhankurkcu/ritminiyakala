import Link from 'next/link';
import { LogoutButton } from '@/components/admin/LogoutButton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">R</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">ritminiyakala</p>
              <p className="text-gray-500 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavLink href="/dashboard" icon="📊">Dashboard</NavLink>
          <NavLink href="/users"     icon="👥">Kullanıcılar</NavLink>
          <NavLink href="/activities"  icon="🏃">Aktiviteler</NavLink>
          <NavLink href="/hero"            icon="🖼️">Hero Slider</NavLink>
          <NavLink href="/activity-types" icon="🏷️">Aktivite Türleri</NavLink>
          <NavLink href="/ai-providers"   icon="🤖">AI Entegrasyonları</NavLink>
          <NavLink href="/plans"          icon="💳">Planlar</NavLink>
        </nav>

        <div className="p-3 border-t border-gray-800">
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm no-underline"
    >
      <span>{icon}</span>
      {children}
    </Link>
  );
}
