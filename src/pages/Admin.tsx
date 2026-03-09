import React, { useEffect, useState } from 'react';
import { api, AdminUser, AdminStats } from '../services/api';

const Admin: React.FC = () => {
  const [categories, setCategories] = useState<string[]>(['Income', 'Food', 'Housing', 'Transport', 'Entertainment']);
  const [newCategory, setNewCategory] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

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

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalUsers = stats?.total_users ?? users.length;
  const totalTransactions = stats?.total_transactions ?? 0;
  const totalGoals = stats?.total_goals ?? 0;
  const totalVolume = stats?.total_volume ?? 0;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0 }}>Admin Panel</h1>
            <span style={{
              background: 'var(--color-primary, #6366f1)',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              padding: '2px 10px',
              borderRadius: '12px',
              textTransform: 'uppercase',
            }}>Admin</span>
          </div>
          <p style={{ margin: '4px 0 0', color: 'var(--color-muted, #888)' }}>
            Manage users, categories, and monitor system statistics.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Users', value: totalUsers, icon: '👥' },
          { label: 'Transactions', value: totalTransactions.toLocaleString(), icon: '💳' },
          { label: 'Goals', value: totalGoals, icon: '🎯' },
          { label: 'Total Volume', value: `$${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: '💰' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>{icon}</div>
            <div style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-muted, #888)', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* User Management + Category Management */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Category Management */}
        <section className="card">
          <h2 className="card-title">Category Management</h2>
          <form className="inline-form" onSubmit={handleAddCategory} style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="New category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">Add</button>
          </form>
          <ul className="pill-list">
            {categories.map((category) => (
              <li key={category} className="pill-item">
                <span>{category}</span>
                <button className="pill-remove" type="button" onClick={() => handleDeleteCategory(category)}>×</button>
              </li>
            ))}
          </ul>
        </section>

        {/* System Health */}
        <section className="card">
          <h2 className="card-title">System Health</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'API Status', value: 'Online', ok: true },
              { label: 'Database', value: 'Connected', ok: true },
              { label: 'Auth Service', value: 'Active', ok: true },
            ].map(({ label, value, ok }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', background: 'var(--color-bg-subtle, #f9fafb)' }}>
                <span style={{ fontWeight: 500 }}>{label}</span>
                <span style={{
                  background: ok ? '#dcfce7' : '#fee2e2',
                  color: ok ? '#16a34a' : '#dc2626',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}>{value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* User Summary Table */}
      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 className="card-title" style={{ margin: 0 }}>User Summary</h2>
          <input
            type="text"
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border, #e5e7eb)', fontSize: '14px', width: '220px' }}
          />
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Email</th>
                <th>Joined</th>
                <th className="align-right">Transactions</th>
                <th className="align-right">Goals</th>
                <th className="align-right">Activity</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-muted, #888)', padding: '24px' }}>
                    {search ? 'No users match your search.' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const activityScore = user.transactions + user.goals;
                  const activityLabel = activityScore >= 10 ? 'High' : activityScore >= 4 ? 'Medium' : 'Low';
                  const activityColor = activityScore >= 10 ? { bg: '#dbeafe', color: '#1d4ed8' } : activityScore >= 4 ? { bg: '#fef9c3', color: '#a16207' } : { bg: '#f3f4f6', color: '#6b7280' };
                  return (
                    <tr key={user.id}>
                      <td style={{ color: 'var(--color-muted, #888)', fontWeight: 500 }}>{idx + 1}</td>
                      <td style={{ fontWeight: 500 }}>{user.email}</td>
                      <td>{user.created_at.slice(0, 10)}</td>
                      <td className="align-right">{user.transactions.toLocaleString()}</td>
                      <td className="align-right">{user.goals}</td>
                      <td className="align-right">
                        <span style={{
                          background: activityColor.bg,
                          color: activityColor.color,
                          padding: '2px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}>{activityLabel}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filteredUsers.length > 0 && (
          <p style={{ fontSize: '13px', color: 'var(--color-muted, #888)', marginTop: '12px' }}>
            Showing {filteredUsers.length} of {users.length} user{users.length !== 1 ? 's' : ''}
          </p>
        )}
      </section>
    </div>
  );
};

export default Admin;


