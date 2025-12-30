import { NavLink } from 'react-router-dom';

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
  return (
    <nav className="flex space-x-8 border-b border-gray-800">
      {tabs.map((tab) => (
        <NavLink
          key={tab.href}
          to={tab.href}
          className={({ isActive }) =>
            `py-4 px-2 text-sm font-medium transition-colors ${
              isActive
                ? 'text-white border-b-2 border-white'
                : 'text-gray-400 hover:text-white'
            }`
          }
        >
          {tab.name}
        </NavLink>
      ))}
    </nav>
  );
}
