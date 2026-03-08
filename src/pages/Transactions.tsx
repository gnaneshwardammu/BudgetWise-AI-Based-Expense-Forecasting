import React, { useEffect, useState } from 'react';
import TransactionForm from '../components/TransactionForm';
import TransactionTable from '../components/TransactionTable';
import { api, Transaction } from '../services/api';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getTransactions().then(setTransactions).catch(() => setError('Failed to load transactions.'));
  }, []);

  const handleAdd = async (tx: Omit<Transaction, 'id'>) => {
    try {
      const created = await api.addTransaction(tx);
      setTransactions((prev) => [created, ...prev]);
    } catch {
      setError('Failed to add transaction.');
    }
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
  };

  const handleUpdate = async (tx: Omit<Transaction, 'id'>) => {
    if (!editingTx) return;
    try {
      const updated = await api.updateTransaction(editingTx.id, tx);
      setTransactions((prev) => prev.map((t) => (t.id === editingTx.id ? updated : t)));
      setEditingTx(null);
    } catch {
      setError('Failed to update transaction.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError('Failed to delete transaction.');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Transactions</h1>
        <p>Manage your income and expenses, and keep your ledger clean.</p>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="grid-1-2">
        <TransactionForm
          onSubmit={editingTx ? handleUpdate : handleAdd}
          initialValues={editingTx ?? undefined}
          onCancel={editingTx ? () => setEditingTx(null) : undefined}
        />
        <TransactionTable transactions={transactions} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </div>
  );
};

export default Transactions;

