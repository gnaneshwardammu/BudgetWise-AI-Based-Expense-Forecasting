import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(() => localStorage.getItem('bw_theme') === 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('bw_theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <span className="navbar-logo">BudgetWise</span>
        <span className="navbar-subtitle">AI Expense Forecasting</span>
      </div>
      <div className="navbar-right">
        <button className="dark-toggle" onClick={() => setDark((d) => !d)}>
          {dark ? '☀️ Light' : '🌙 Dark'}
        </button>
        {user && (
          <>
            <span className="navbar-user-email">{user.email}</span>
            <button
              className="btn btn-outline"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
              onClick={logout}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;

