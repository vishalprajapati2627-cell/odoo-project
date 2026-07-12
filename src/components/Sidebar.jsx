import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/organization', label: 'Organization Setup', adminOnly: true },
  { to: '/assets', label: 'Assets' },
  { to: '/allocation', label: 'Allocation & Transfer' },
  { to: '/booking', label: 'Resource Booking' },
  { to: '/maintenance', label: 'Maintenance' },
  { to: '/audit', label: 'Audit' },
  { to: '/reports', label: 'Reports' },
  { to: '/notifications', label: 'Notifications' },
];

export default function Sidebar() {
  const { user } = useApp();
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">AssetFlow</div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.filter(i => !i.adminOnly || user?.role === 'Admin').map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
