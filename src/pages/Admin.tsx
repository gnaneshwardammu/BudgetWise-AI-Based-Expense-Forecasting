import React, { useEffect, useState } from 'react';
import { api, AdminUser, AdminStats } from '../services/api';

const Admin: React.FC = () => {
  const [categories, setCategories] = useState<string[]>(['Income', 'Food', 'Housing', 'Transport', 'Entertainment']);
  const [newCategory, setNewCategory] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getAdminUsers().then(setUsers).catch(() => setError('Failed to load user data.'));
    api.getAdminStats().then(setStats).catch(() => {});
  }, []);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategory.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    setCategories((prev) => [...prev, trimmed]);
    setNewCategory('');
  };

  const handleDeleteCategory = (category: string) => {
    setCategories((prev) => prev.filter((c) => c !== category));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Admin</h1>
        <p>Manage categories, monitor user activity, and view system statistics.</p>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="grid-2">
        <section className="card">
          <h2 className="card-title">Category Management</h2>
          <form className="inline-form" onSubmit={handleAddCategory}>
            <input
              type="text"
              placeholder="Add new category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">
              Add
            </button>
          </form>
          <ul className="pill-list">
            {categories.map((category) => (
              <li key={category} className="pill-item">
                <span>{category}</span>
                <button className="pill-remove" type="button" onClick={() => handleDeleteCategory(category)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 className="card-title">System Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total users</span>
              <span className="stat-value">{stats?.total_users ?? users.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total transactions</span>
              <span className="stat-value">{(stats?.total_transactions ?? 0).toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total goals</span>
              <span className="stat-value">{stats?.total_goals ?? 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">System health</span>
              <span className="stat-badge">Healthy</span>
            </div>
          </div>
        </section>
      </div>

      <section className="card">
        <h2 className="card-title">User Summary</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Joined</th>
                <th className="align-right">Transactions</th>
                <th className="align-right">Goals</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.created_at.slice(0, 10)}</td>
                  <td className="align-right">{user.transactions.toLocaleString()}</td>
                  <td className="align-right">{user.goals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Admin;

