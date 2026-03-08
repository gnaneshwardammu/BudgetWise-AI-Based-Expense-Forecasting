import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Transaction } from '../services/api';

interface Props {
  transactions: Transaction[];
}

const COLORS = ['#2563EB', '#14B8A6', '#F97316', '#0EA5E9', '#6366F1', '#EC4899'];

const CategoryPieChart: React.FC<Props> = ({ transactions }) => {
  const expenseByCategory = transactions
    .filter((tx) => tx.type === 'Expense')
    .reduce<Record<string, number>>((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});

  const data = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  return (
    <section className="card">
      <h2 className="card-title">Spending by Category</h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default CategoryPieChart;

