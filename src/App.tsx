import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Admin from './pages/Admin';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="app-shell">
    <Navbar />
    <div className="app-body">
      <Sidebar />
      <main className="app-main">{children}</main>
    </div>
  </div>
);

const App: React.FC = () => {
  const { token, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element=
        {
          <ProtectedRoute>
            <AppLayout>
              <Transactions />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/goals"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Goals />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Admin />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
};

export default App;

