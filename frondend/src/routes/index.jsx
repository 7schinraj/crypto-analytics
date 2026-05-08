import { createBrowserRouter, Navigate } from 'react-router-dom';

// Auth pages (already exists)
import SignupPage   from '../modules/auth/pages/SignupPage.jsx';
import LoginPage    from '../modules/auth/pages/LoginPage.jsx';

// New pages
import Dashboard    from '../pages/Dashboard.jsx';
import ChartDetail  from '../pages/ChartDetail.jsx';
import Analytics    from '../pages/Analytics.jsx';
import Strategy     from '../pages/Strategy.jsx';

// Protect authenticated routes
function RequireAuth({ children }) {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: <RequireAuth><Dashboard /></RequireAuth>,
  },
  {
    path: '/chart/:symbol',
    element: <RequireAuth><ChartDetail /></RequireAuth>,
  },
  {
    path: '/analytics',
    element: <RequireAuth><Analytics /></RequireAuth>,
  },
  {
    path: '/strategy',
    element: <RequireAuth><Strategy /></RequireAuth>,
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
