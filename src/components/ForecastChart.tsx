import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line } from 'recharts';
import type { ForecastPoint } from '../services/api';

interface Props {
  data: ForecastPoint[];
}

const ForecastChart: React.FC<Props> = ({ data }) => (
  <section className="card">
    <h2 className="card-title">Cash Flow Forecast</h2>
    <p className="card-subtitle">Projected monthly net cash flow with confidence band.</p>
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="forecastArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="upper"
            stroke="transparent"
            fill="#ffedd5"
            fillOpacity={0.8}
            activeDot={false}
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="transparent"
            fill="#fff7ed"
            fillOpacity={1}
            activeDot={false}
          />
          <Line type="monotone" dataKey="expected" stroke="#F97316" strokeWidth={2.2} dot={{ r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </section>
);

export default ForecastChart;

