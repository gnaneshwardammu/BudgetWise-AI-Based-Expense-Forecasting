import React from 'react';
import type { Goal } from '../services/api';

interface Props {
  goal: Goal;
}

const GoalProgress: React.FC<Props> = ({ goal }) => {
  const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  const today = new Date();
  const target = new Date(goal.targetDate);
  const daysRemaining = Math.max(0, Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="card goal-card">
      <div className="goal-header">
        <h3 className="goal-name">{goal.name}</h3>
        <span className="goal-percentage">{progress.toFixed(1)}%</span>
      </div>
      <div className="goal-meta">
        <span>
          {goal.currentAmount.toLocaleString(undefined, { style: 'currency', currency: 'USD' })} /{' '}
          {goal.targetAmount.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
        </span>
        <span className="goal-date">Target: {goal.targetDate}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="goal-footer">
        {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Target date reached'}
      </div>
    </div>
  );
};

export default GoalProgress;

