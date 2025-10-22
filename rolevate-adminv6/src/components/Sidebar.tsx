'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Companies', path: '/companies' },
    { label: 'Candidates', path: '/candidates' },
    { label: 'Applications', path: '/applications' },
    { label: 'Jobs', path: '/jobs' },
    { label: 'Users', path: '/users' },
    { label: 'Reports', path: '/reports' },
  ];

  return (
    <div className="w-64 bg-primary-600 text-white min-h-screen flex flex-col">
      <div className="p-4">
        <h2 className="text-xl font-bold">Rolevate Admin</h2>
      </div>
      <nav className="mt-4 flex-1">
        {menuItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={`block px-4 py-2 hover:bg-primary-700 transition-colors ${
              pathname === item.path ? 'bg-primary-700 border-l-4 border-white' : ''
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="px-4 py-2 hover:bg-primary-700 text-left transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
