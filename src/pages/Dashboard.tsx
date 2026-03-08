import React, { useEffect, useMemo, useState } from 'react';
import SummaryCards from '../components/SummaryCards';
import CategoryPieChart from '../components/CategoryPieChart';
import IncomeExpenseBarChart from '../components/IncomeExpenseBarChart';
import ForecastChart from '../components/ForecastChart';
import { api, ForecastPoint, Transaction } from '../services/api';

const DASHBOARD_CATEGORIES = ['Food', 'Transport', 'Rent', 'Utilities', 'Shopping', 'Other'] as const;

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const [formDate, setFormDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formAmount, setFormAmount] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formCategory, setFormCategory] = useState<(typeof DASHBOARD_CATEGORIES)[number]>('Food');
  const [formType, setFormType] = useState<'Income' | 'Expense'>('Expense');

  useEffect(() => {
    api.getTransactions().then(setTransactions);
    api.getForecast().then(setForecast);
  }, []);

  const summary = useMemo(() => {
    const totalIncome = transactions.filter((t) => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter((t) => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
    return { totalIncome, totalExpense, balance, savingsRate };
  }, [transactions]);

  const openAddModal = () => {
    setEditingTx(null);
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormAmount('');
    setFormDescription('');
    setFormCategory('Food');
    setFormType('Expense');
    setIsModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setFormDate(tx.date);
    setFormAmount(String(tx.amount));
    setFormDescription(tx.description);
    // If the tx category isn't in the dashboard dropdown, map it to Other.
    const safeCategory = (DASHBOARD_CATEGORIES as readonly string[]).includes(tx.category)
      ? (tx.category as (typeof DASHBOARD_CATEGORIES)[number])
      : 'Other';
    setFormCategory(safeCategory);
    setFormType(tx.type);
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setModalError(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(formAmount);
    if (!formDate || !formDescription.trim() || !amt) return;
    setModalError(null);

    try {
      if (editingTx) {
        const updated = await api.updateTransaction(editingTx.id, {
          date: formDate, amount: amt, description: formDescription.trim(), category: formCategory, type: formType,
        });
        setTransactions((prev) => prev.map((t) => (t.id === editingTx.id ? updated : t)));
      } else {
        const created = await api.addTransaction({
          date: formDate, amount: amt, description: formDescription.trim(), category: formCategory, type: formType,
        });
        setTransactions((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to save transaction.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch {
      // Silently ignore — could surface a toast instead
    }
  };

  const formatINR = (amount: number) => amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

  return (
    <div className="page">
      <div className="page-header page-header-row">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your cash flow, spending, and AI-powered forecasts.</p>
        </div>
        <button className="btn btn-accent" onClick={openAddModal}>
          + Add Transaction
        </button>
      </div>

      <SummaryCards
        totalIncome={summary.totalIncome}
        totalExpense={summary.totalExpense}
        balance={summary.balance}
        savingsRate={summary.savingsRate}
      />

      <section className="card dashboard-table-card">
        <div className="card-header">
          <h2 className="card-title">Recent Transactions</h2>
          <span className="muted">{transactions.length} total</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th className="align-right">Amount (₹)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No transactions yet. Click “Add Transaction” to get started.
                  </td>
                </tr>
              )}
              {transactions.slice(0, 8).map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.date}</td>
                  <td>{tx.description}</td>
                  <td>{tx.category}</td>
                  <td>
                    <span className={`tag ${tx.type === 'Income' ? 'tag-income' : 'tag-expense'}`}>{tx.type}</span>
                  </td>
                  <td className="align-right">{formatINR(tx.amount)}</td>
                  <td className="actions-cell">
                    <button className="btn btn-ghost" onClick={() => openEditModal(tx)}>
                      Edit
                    </button>
                    <button className="btn btn-danger-ghost" onClick={() => handleDelete(tx.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid-2">
        <CategoryPieChart transactions={transactions} />
        <IncomeExpenseBarChart transactions={transactions} />
      </div>

      <div className="grid-2">
        <ForecastChart data={forecast} />
        <section className="card alerts-card">
          <h2 className="card-title">AI Insights & Alerts</h2>
          <ul className="alerts-list">
            <li>
              <span className="alert-pill alert-warning">Overspending risk</span>
              Your spending on <strong>Food</strong> is trending 18% above your usual pattern this month.
            </li>
            <li>
              <span className="alert-pill alert-info">Forecast insight</span>
              You are on track to maintain a positive cash flow over the next 3 months.
            </li>
            <li>
              <span className="alert-pill alert-success">Savings opportunity</span>
              Reducing discretionary expenses by 10% could increase your savings rate to 55%.
            </li>
          </ul>
        </section>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">{editingTx ? 'Edit Transaction' : 'Add Transaction'}</h2>
                <p className="modal-subtitle">Quickly record income and expenses.</p>
              </div>
              <button className="btn btn-outline modal-close" onClick={closeModal} type="button">
                Close
              </button>
            </div>

            <form className="form modal-form" onSubmit={handleSubmit}>
              {modalError && <div className="alert alert-error">{modalError}</div>}
              <div className="form-grid modal-grid">
                <div className="form-field">
                  <label htmlFor="dashDate">Date</label>
                  <input id="dashDate" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                </div>
                <div className="form-field">
                  <label htmlFor="dashAmount">Amount (₹)</label>
                  <input
                    id="dashAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="e.g. 1200"
                  />
                </div>
                <div className="form-field modal-span-2">
                  <label htmlFor="dashDescription">Description</label>
                  <input
                    id="dashDescription"
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="e.g. Groceries, Salary"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="dashCategory">Category</label>
                  <select
                    id="dashCategory"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as (typeof DASHBOARD_CATEGORIES)[number])}
                  >
                    {DASHBOARD_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="dashType">Type</label>
                  <select
                    id="dashType"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as 'Income' | 'Expense')}
                  >
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-outline" type="button" onClick={closeModal}>
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit">
                  {editingTx ? 'Save Changes' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

