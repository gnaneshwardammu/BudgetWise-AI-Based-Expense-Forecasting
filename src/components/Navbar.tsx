import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <span className="navbar-logo">BudgetWise</span>
        <span className="navbar-subtitle">AI Expense Forecasting</span>
      </div>
      <div className="navbar-right">
        {user && (
          <>
            <span className="navbar-user-email">{user.email}</span>
            <button className="btn btn-outline" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;

