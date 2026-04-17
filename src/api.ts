/**
 * Thin TypeScript API client for the Java Spring Boot backend.
 *
 * Every function maps to one REST endpoint.  All amounts stored on the server
 * are in INR (the base currency); currency conversion is still handled in the
 * frontend so the UI behaviour is unchanged.
 */

import { Transaction, AppData, Currency, ExchangeRates, ExpenseCategory } from './types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${options?.method ?? 'GET'} ${path} failed (${res.status}): ${text}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ── Transactions ────────────────────────────────────────────────────────────

export const apiGetTransactions = (): Promise<Transaction[]> =>
  request<Transaction[]>('/transactions');

export const apiAddTransaction = (tx: Omit<Transaction, 'id'> & { id?: string }): Promise<Transaction> =>
  request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(tx) });

export const apiDeleteTransaction = (id: string): Promise<void> =>
  request<void>(`/transactions/${id}`, { method: 'DELETE' });

// ── Budgets ─────────────────────────────────────────────────────────────────

export const apiGetBudgets = (): Promise<Record<ExpenseCategory, number>> =>
  request<Record<ExpenseCategory, number>>('/budgets');

export const apiUpdateBudget = (category: ExpenseCategory, limitAmount: number): Promise<void> =>
  request<void>(`/budgets/${encodeURIComponent(category)}`, {
    method: 'PUT',
    body: JSON.stringify({ limitAmount }),
  });

// ── App Settings ─────────────────────────────────────────────────────────────

interface ApiSettings {
  id: number;
  userName: string;
  savingsGoal: number;
  initialBalance: number;
  currencyName: string;
  currencySymbol: string;
  currencyCode: string;
  currencyFlag: string;
  historyIncome: string;   // comma-separated numbers
  historyExpense: string;  // comma-separated numbers
}

function parseHistory(csv: string): number[] {
  return (csv || '0,0,0,0,0,0').split(',').map(Number);
}

function serializeHistory(arr: number[]): string {
  return arr.join(',');
}

export async function apiGetSettings(): Promise<Partial<AppData>> {
  const s = await request<ApiSettings>('/settings');
  return {
    userName: s.userName,
    savingsGoal: s.savingsGoal,
    initialBalance: s.initialBalance,
    currency: {
      name: s.currencyName,
      symbol: s.currencySymbol,
      code: s.currencyCode,
      flag: s.currencyFlag,
    } as Currency,
    history: {
      income: parseHistory(s.historyIncome),
      expense: parseHistory(s.historyExpense),
    },
  };
}

export async function apiSaveSettings(data: Partial<AppData>): Promise<void> {
  const body: Partial<ApiSettings> = {
    userName: data.userName,
    savingsGoal: data.savingsGoal,
    initialBalance: data.initialBalance,
    currencyName: data.currency?.name,
    currencySymbol: data.currency?.symbol,
    currencyCode: data.currency?.code,
    currencyFlag: data.currency?.flag,
    historyIncome: data.history ? serializeHistory(data.history.income) : undefined,
    historyExpense: data.history ? serializeHistory(data.history.expense) : undefined,
  };
  await request<ApiSettings>('/settings', { method: 'PUT', body: JSON.stringify(body) });
}

export const apiResetAll = (): Promise<void> =>
  request<void>('/settings/reset', { method: 'DELETE' });

// ── Exchange Rates ───────────────────────────────────────────────────────────

export const apiGetExchangeRates = (): Promise<ExchangeRates> =>
  request<ExchangeRates & { offline: boolean }>('/exchange-rates').then(r => ({
    rates: r.rates,
    lastUpdated: r.lastUpdated,
    isOffline: r.offline,
  }));
