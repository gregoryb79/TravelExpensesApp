import { Currency } from './currency';

export type Expense = {
  id: string;
  amount: string;
  currency: string;
  category: string;
  description?: string;
  date: string;
};