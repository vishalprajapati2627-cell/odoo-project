import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useApp } from '../context/AppContext';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useApp();
  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-col">
        <header className="topbar">
          <div className="topbar-spacer" />
          <div className="topbar-user">
            <span className="topbar-role">{user.role}</span>
            <span className="topbar-email">{user.email}</span>
            <button className="btn btn-ghost" onClick={logout}>Log out</button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
