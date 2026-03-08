import React, { useEffect, useState } from 'react';
import type { Transaction } from '../services/api';

interface Props {
  onSubmit: (tx: Omit<Transaction, 'id'>) => void;
  initialValues?: Transaction;
  onCancel?: () => void;
}

const defaultCategories = ['Income', 'Food', 'Housing', 'Transport', 'Entertainment', 'Other'];

const TransactionForm: React.FC<Props> = ({ onSubmit, initialValues, onCancel }) => {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [category, setCategory] = useState<string>('Food');

  useEffect(() => {
    if (initialValues) {
      setDate(initialValues.date);
      setAmount(String(initialValues.amount));
      setDescription(initialValues.description);
      setType(initialValues.type);
      setCategory(initialValues.category);
    } else {
      setDate(new Date().toISOString().slice(0, 10));
      setAmount('');
      setDescription('');
      setType('Expense');
      setCategory('Food');
    }
  }, [initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!description || !numericAmount || !date) return;

    onSubmit({ date, description, category, type, amount: numericAmount });

    if (!initialValues) {
      setAmount('');
      setDescription('');
    }
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2 className="card-title">{initialValues ? 'Edit Transaction' : 'Add Transaction'}</h2>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="date">Date</label>
          <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="amount">Amount (₹)</label>
          <input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="description">Description</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Groceries, Salary"
          />
        </div>
        <div className="form-field">
          <label htmlFor="type">Type</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value as 'Income' | 'Expense')}>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {defaultCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit">
          {initialValues ? 'Update Transaction' : 'Save Transaction'}
        </button>
        {onCancel && (
          <button className="btn btn-outline" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TransactionForm;

