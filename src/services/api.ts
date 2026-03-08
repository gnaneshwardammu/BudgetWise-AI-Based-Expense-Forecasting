const BASE_URL = import.meta.env.VITE_API_URL;

function getToken(): string | null {
  return localStorage.getItem('budgetwise_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    // 401 = expired/invalid token, 422 = malformed token (e.g. stale mock token)
    if (res.status === 401 || res.status === 422) {
      localStorage.removeItem('budgetwise_token');
      localStorage.removeItem('budgetwise_user');
      window.location.href = '/login';
    }
    // Flask-JWT-Extended uses 'msg' for its own errors, backend uses 'error'
    throw new Error(data.error || data.msg || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'Income' | 'Expense';
  amount: number;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
}

export interface ForecastPoint {
  month: string;
  expected: number;
  lower: number;
  upper: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

export interface AdminUser {
  id: number;
  email: string;
  created_at: string;
  transactions: number;
  goals: number;
}

export interface AdminStats {
  total_users: number;
  total_transactions: number;
  total_goals: number;
  total_volume: number;
}

// Map backend transaction (snake_case, lowercase type) to frontend shape
function mapTransaction(t: Record<string, unknown>): Transaction {
  return {
    id: String(t.id),
    date: t.date as string,
    description: t.description as string,
    category: t.category as string,
    type: ((t.type as string).charAt(0).toUpperCase() + (t.type as string).slice(1)) as 'Income' | 'Expense',
    amount: t.amount as number,
  };
}

// Map backend goal (goal_name, current_progress) to frontend shape
function mapGoal(g: Record<string, unknown>): Goal {
  return {
    id: String(g.id),
    name: g.goal_name as string,
    targetAmount: g.target_amount as number,
    currentAmount: g.current_progress as number,
    targetDate: g.target_date as string,
  };
}

export const api = {
  async login(payload: LoginPayload): Promise<{ token: string; email: string; role: 'user' | 'admin' }> {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: payload.email, password: payload.password }),
    });
    const data = await handleResponse<{ access_token: string; email: string }>(res);
    return {
      token: data.access_token,
      email: data.email,
      role: data.email.includes('admin') ? 'admin' : 'user',
    };
  },

  async register(payload: RegisterPayload): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: payload.email, password: payload.password }),
    });
    await handleResponse<{ message: string }>(res);
    return { success: true };
  },

  async getTransactions(): Promise<Transaction[]> {
    const res = await fetch(`${BASE_URL}/transactions`, { headers: authHeaders() });
    const data = await handleResponse<Record<string, unknown>[]>(res);
    return data.map(mapTransaction);
  },

  async addTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        date: tx.date,
        amount: tx.amount,
        description: tx.description,
        type: tx.type.toLowerCase(),
        category: tx.category,
      }),
    });
    const data = await handleResponse<Record<string, unknown>>(res);
    return mapTransaction(data);
  },

  async updateTransaction(id: string, tx: Partial<Omit<Transaction, 'id'>>): Promise<Transaction> {
    const body: Record<string, unknown> = { ...tx };
    if (tx.type) body.type = tx.type.toLowerCase();
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const data = await handleResponse<Record<string, unknown>>(res);
    return mapTransaction(data);
  },

  async deleteTransaction(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    await handleResponse<{ message: string }>(res);
  },

  async getSummary(): Promise<Summary> {
    const res = await fetch(`${BASE_URL}/summary/income-expense`, { headers: authHeaders() });
    const data = await handleResponse<{ income: number; expense: number; balance: number; savings_rate: number }>(res);
    return {
      totalIncome: data.income,
      totalExpense: data.expense,
      balance: data.balance,
      savingsRate: data.savings_rate,
    };
  },

  async getForecast(): Promise<ForecastPoint[]> {
    const res = await fetch(`${BASE_URL}/forecast`, { headers: authHeaders() });
    const data = await handleResponse<{ forecast?: { ds: string; yhat: number; yhat_lower: number; yhat_upper: number }[]; error?: string }>(res);
    if (!data.forecast) return [];
    return data.forecast.map((f) => ({
      month: f.ds,
      expected: f.yhat,
      lower: f.yhat_lower,
      upper: f.yhat_upper,
    }));
  },

  async getGoals(): Promise<Goal[]> {
    const res = await fetch(`${BASE_URL}/goals`, { headers: authHeaders() });
    const data = await handleResponse<Record<string, unknown>[]>(res);
    return data.map(mapGoal);
  },

  async addGoal(goal: Omit<Goal, 'id'>): Promise<Goal> {
    const res = await fetch(`${BASE_URL}/goals`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        goal_name: goal.name,
        target_amount: goal.targetAmount,
        target_date: goal.targetDate,
        current_progress: goal.currentAmount,
      }),
    });
    const data = await handleResponse<Record<string, unknown>>(res);
    return mapGoal(data);
  },

  async updateGoal(id: string, goal: Partial<Omit<Goal, 'id'>>): Promise<Goal> {
    const body: Record<string, unknown> = {};
    if (goal.name !== undefined) body.goal_name = goal.name;
    if (goal.targetAmount !== undefined) body.target_amount = goal.targetAmount;
    if (goal.targetDate !== undefined) body.target_date = goal.targetDate;
    if (goal.currentAmount !== undefined) body.current_progress = goal.currentAmount;
    const res = await fetch(`${BASE_URL}/goals/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const data = await handleResponse<Record<string, unknown>>(res);
    return mapGoal(data);
  },

  async deleteGoal(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/goals/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    await handleResponse<{ message: string }>(res);
  },

  async getAdminUsers(): Promise<AdminUser[]> {
    const res = await fetch(`${BASE_URL}/admin/users`, { headers: authHeaders() });
    return handleResponse<AdminUser[]>(res);
  },

  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${BASE_URL}/admin/stats`, { headers: authHeaders() });
    return handleResponse<AdminStats>(res);
  },
};

