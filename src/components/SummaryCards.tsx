import React from 'react';

interface Props {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
}

const SummaryCards: React.FC<Props> = ({ totalIncome, totalExpense, balance, savingsRate }) => {
  const cards = [
    { label: 'Total Income', value: totalIncome, accent: 'card-income' },
    { label: 'Total Expense', value: totalExpense, accent: 'card-expense' },
    { label: 'Current Balance', value: balance, accent: 'card-balance' },
    { label: 'Savings Rate', value: savingsRate, suffix: '%', accent: 'card-savings' }
  ];

  const formatCurrency = (amount: number) =>
    amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    });

  return (
    <section className="summary-grid">
      {cards.map((card) => (
        <div key={card.label} className={`card summary-card ${card.accent}`}>
          <div className="summary-label">{card.label}</div>
          <div className="summary-value">
            {'suffix' in card ? `${card.value.toFixed(1)}${card.suffix}` : formatCurrency(card.value)}
          </div>
        </div>
      ))}
    </section>
  );
};

export default SummaryCards;

