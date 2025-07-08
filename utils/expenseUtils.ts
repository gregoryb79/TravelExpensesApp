import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '../types/expense';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { getBasicCurrencies } from './currencyUtils';

export const expenseCategories = ["Groceries", "Souvenirs", "Eating Out & TA", "Beer and Coffee", "Gas + Parking", "Attractions"];

const expenses = [] as Expense[];

export async function addExpense(expense: Expense) {
  expenses.unshift(expense);  
  await saveExpenses();
}

export async function getExpenses(): Promise<Expense[]> {
  return mockExpenses; // For now, return mock expenses
}

export async function calcTotal(baseCurrencyCode: string): Promise<number> {
  const basicCurrencies = getBasicCurrencies();
  const baseCurrency = basicCurrencies.find(curr => curr.code === baseCurrencyCode);
     
  if (!baseCurrency) {
    throw new Error(`Currency ${baseCurrency} not found`);
  }

  const expenses = await getExpenses();
  const total = expenses.reduce((acc, expense) => {
    if (expense.currency === baseCurrency.code) {
      return acc + expense.amount;
    } else if (expense.currency === 'USD') {      
      const exchangeRate = baseCurrency.exchangeRate; 
      return acc + (expense.amount * exchangeRate);
    } else {
      const expenseCurrencytoUSD = basicCurrencies.find(curr => curr.code === expense.currency);
      if (!expenseCurrencytoUSD) {
        throw new Error(`Currency ${expense.currency} not found`);
      }
      const exchangeRate = baseCurrency.exchangeRate*expenseCurrencytoUSD.exchangeRate;
      return acc + (expense.amount * exchangeRate);
    }
  }, 0);

  return total;
  
}

export async function getRecentExpenses(): Promise<Expense[]> {

  const basicCurrencies = getBasicCurrencies();
  const recentExpenses = mockExpenses.slice(0, 10).map((expense) => {    
    const currency = basicCurrencies.find(curr => curr.code === expense.currency);      
    return {
      ...expense,
      currency: currency?.symbol || expense.currency
    };
  });
  return recentExpenses;
}

export async function saveExpenses() {
  await AsyncStorage.setItem('expenses', JSON.stringify(expenses));
  console.log('Expenses saved:', expenses);
}

const mockExpenses: Expense[] = [
  {
    id: '1',
    amount: 25.50,
    currency: 'EUR',
    category: 'Eating Out & TA',
    description: 'Lunch at Café Roma',
    created_at: '2025-07-08T12:30:00Z'
  },
  {
    id: '2',
    amount: 2.50,
    currency: 'EUR',
    category: 'Gas + Parking',
    description: 'Metro ticket',
    created_at: '2025-07-08T09:15:00Z'
  },
  {
    id: '3',
    amount: 17.00,
    currency: 'EUR',
    category: 'Attractions',
    description: 'Louvre Museum entrance',
    created_at: '2025-07-07T14:45:00Z'
  },
  {
    id: '4',
    amount: 4.80,
    currency: 'EUR',
    category: 'Beer and Coffee',
    description: 'Morning coffee and croissant',
    created_at: '2025-07-07T08:20:00Z'
  },
  {
    id: '5',
    amount: 32.40,
    currency: 'EUR',
    category: 'Groceries',
    description: 'Supermarket shopping',
    created_at: '2025-07-06T16:10:00Z'
  },
  {
    id: '6',
    amount: 18.75,
    currency: 'EUR',
    category: 'Souvenirs',
    description: 'Postcard and keychain',
    created_at: '2025-07-06T11:25:00Z'
  },
  {
    id: '7',
    amount: 45.00,
    currency: 'EUR',
    category: 'Eating Out & TA',
    description: 'Dinner at bistro',
    created_at: '2025-07-05T19:30:00Z'
  },
  {
    id: '8',
    amount: 12.00,
    currency: 'EUR',
    category: 'Attractions',
    description: 'Notre Dame donation',
    created_at: '2025-07-05T15:00:00Z'
  },
  {
    id: '9',
    amount: 8.50,
    currency: 'EUR',
    category: 'Gas + Parking',
    description: 'Taxi ride',
    created_at: '2025-07-04T21:15:00Z'
  },
  {
    id: '10',
    amount: 15.30,
    currency: 'EUR',
    category: 'Beer and Coffee',
    description: 'Evening drinks',
    created_at: '2025-07-04T18:45:00Z'
  },
  {
    id: '11',
    amount: 28.90,
    currency: 'EUR',
    category: 'Eating Out & TA',
    description: 'French bakery breakfast',
    created_at: '2025-07-03T07:30:00Z'
  },
  {
    id: '12',
    amount: 55.00,
    currency: 'EUR',
    category: 'Souvenirs',
    description: 'Paris t-shirt and mug',
    created_at: '2025-07-03T13:20:00Z'
  },
  {
    id: '13',
    amount: 22.50,
    currency: 'EUR',
    category: 'Attractions',
    description: 'Eiffel Tower elevator',
    created_at: '2025-07-02T10:00:00Z'
  },
  {
    id: '14',
    amount: 6.75,
    currency: 'EUR',
    category: 'Gas + Parking',
    description: 'Day pass metro',
    created_at: '2025-07-02T08:00:00Z'
  },
  {
    id: '15',
    amount: 38.20,
    currency: 'EUR',
    category: 'Groceries',
    description: 'Local market purchases',
    created_at: '2025-07-01T17:45:00Z'
  }
];