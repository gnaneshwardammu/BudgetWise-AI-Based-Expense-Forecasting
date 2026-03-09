import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <button className="sidebar-toggle" onClick={() => setCollapsed((prev) => !prev)}>
        {collapsed ? '›' : '‹'}
      </button>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          Dashboard
        </NavLink>
        <NavLink to="/transactions" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          Transactions
        </NavLink>
        <NavLink to="/goals" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          Goals
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Admin
          </NavLink>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;

