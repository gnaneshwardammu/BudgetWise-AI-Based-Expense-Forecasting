import React, { useEffect, useState } from 'react';
import GoalProgress from '../components/GoalProgress';
import { api, Goal } from '../services/api';

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getGoals().then(setGoals).catch(() => setError('Failed to load goals.'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(targetAmount);
    if (!name || !amount || !targetDate) return;
    setError(null);

    try {
      const created = await api.addGoal({ name, targetAmount: amount, currentAmount: 0, targetDate });
      setGoals((prev) => [created, ...prev]);
      setName('');
      setTargetAmount('');
      setTargetDate('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal.');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Goals</h1>
        <p>Create financial goals and track your progress over time.</p>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="grid-2">
        <form className="card form" onSubmit={handleSubmit}>
          <h2 className="card-title">Create Goal</h2>
          <div className="form-field">
            <label htmlFor="goalName">Goal name</label>
            <input
              id="goalName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Emergency Fund"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="targetAmount">Target amount</label>
            <input
              id="targetAmount"
              type="number"
              min="0"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="targetDate">Target date</label>
            <input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Save Goal
          </button>
        </form>

        <section>
          <h2 className="section-title">Goal Progress</h2>
          {goals.length === 0 && <p className="muted">No goals yet. Create your first savings goal.</p>}
          <div className="goals-list">
            {goals.map((goal) => (
              <GoalProgress key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Goals;

