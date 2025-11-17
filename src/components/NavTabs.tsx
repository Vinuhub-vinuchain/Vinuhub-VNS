'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: 'Home', href: '/' },
  { name: 'Search', href: '/search' },
  { name: 'Register', href: '/register' },
  { name: 'Transfer', href: '/transfer' },
  { name: 'Marketplace', href: '/marketplace' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'History', href: '/history' },
];

export default function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-8 border-b border-gray-800">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`py-4 px-2 text-sm font-medium transition-colors ${
            pathname === tab.href
              ? 'text-white border-b-2 border-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {tab.name}
        </Link>
      ))}
    </nav>
  );
}
