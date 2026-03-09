import React, { useMemo, useState } from 'react';
import type { Transaction } from '../services/api';
import { getCategoryIcon } from '../utils/categoryIcons';

interface Props {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionTable: React.FC<Props> = ({ transactions, onEdit, onDelete }) => {
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = tx.description.toLowerCase().includes(search.toLowerCase());
      const matchesMonth =
        monthFilter === 'all' ||
        (tx.date && new Date(tx.date).toISOString().slice(0, 7) === monthFilter);
      return matchesSearch && matchesMonth;
    });
  }, [transactions, search, monthFilter]);

  const uniqueMonths = Array.from(
    new Set(
      transactions
        .map((tx) => (tx.date ? new Date(tx.date).toISOString().slice(0, 7) : null))
        .filter((v): v is string => Boolean(v))
    )
  ).sort();

  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Transactions</h2>
        <div className="table-filters">
          <input
            type="text"
            placeholder="Search by description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
            <option value="all">All months</option>
            {uniqueMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th className="align-right">Amount</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-state">
                  No transactions found.
                </td>
              </tr>
            )}
            {filtered.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.date}</td>
                <td>{tx.description}</td>
                <td>
                  <span className="category-tag">
                    {getCategoryIcon(tx.category)} {tx.category}
                  </span>
                </td>
                <td>
                  <span className={`tag ${tx.type === 'Income' ? 'tag-income' : 'tag-expense'}`}>{tx.type}</span>
                </td>
                <td className="align-right">
                  {tx.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                </td>
                <td className="actions-cell">
                  <button className="btn btn-ghost" onClick={() => onEdit(tx)}>
                    Edit
                  </button>
                  <button className="btn btn-danger-ghost" onClick={() => onDelete(tx.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TransactionTable;

