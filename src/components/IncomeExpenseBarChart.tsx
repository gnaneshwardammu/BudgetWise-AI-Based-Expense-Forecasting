import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Transaction } from '../services/api';

interface Props {
  transactions: Transaction[];
}

const IncomeExpenseBarChart: React.FC<Props> = ({ transactions }) => {
  const byMonth: Record<string, { month: string; income: number; expense: number }> = {};

  transactions.forEach((tx) => {
    const monthKey = tx.date ? new Date(tx.date).toISOString().slice(0, 7) : 'Unknown';
    if (!byMonth[monthKey]) {
      byMonth[monthKey] = { month: monthKey, income: 0, expense: 0 };
    }
    if (tx.type === 'Income') {
      byMonth[monthKey].income += tx.amount;
    } else {
      byMonth[monthKey].expense += tx.amount;
    }
  });

  const data = Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <section className="card">
      <h2 className="card-title">Income vs Expense</h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" fill="#2563EB" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expense" fill="#EF4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default IncomeExpenseBarChart;

