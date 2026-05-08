import { NavLink, useLocation } from 'react-router-dom';

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 21H4.6c-.56 0-.84 0-1.054-.109a1 1 0 0 1-.437-.437C3 20.24 3 19.96 3 19.4V3" />
    <path d="m7 14 4-4 4 4 6-6" />
    <path d="m17 8 4 0" />
    <path d="m21 8 0 4" />
  </svg>
);

const StrategyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93" />
    <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" />
    <path d="M11.25 9.93v2.32a2 2 0 0 1-.79 1.59L8 16" />
    <path d="M12.75 9.93v2.32a2 2 0 0 0 .79 1.59L16 16" />
    <path d="M8 16h8" />
    <path d="M9 20h6" />
    <path d="M9 16v4" />
    <path d="M15 16v4" />
  </svg>
);

const NAV_ITEMS = [
  { to: '/dashboard', icon: DashboardIcon, label: 'Markets'   },
  { to: '/analytics', icon: AnalyticsIcon, label: 'Analytics' },
  { to: '/strategy',  icon: StrategyIcon,  label: 'Strategy'  },
];

export default function BottomNav() {
  const location = useLocation();

  const isLinkActive = (to) => {
    if (to === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname.startsWith('/chart');
    }
    return location.pathname === to;
  };

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
        const active = isLinkActive(to);
        return (
          <NavLink
            key={to}
            to={to}
            className={`bottom-nav-item${active ? ' active' : ''}`}
          >
            <span className="nav-icon"><Icon /></span>
            <span>{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
