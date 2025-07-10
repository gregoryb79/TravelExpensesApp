import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '../types/expense';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { getCurrencies, getCurrenciesList, slimCurrency } from './currencyUtils';
import { Currency } from '../types/currency';
import uuid from 'react-native-uuid';

export const defaultExpenseCategories = ["Groceries", "Souvenirs", "Eating Out & TA", "Beer and Coffee", "Gas + Parking", "Attractions"];

export async function addExpense(amount: string, description: string, category: string, currency: slimCurrency) {
  
  if (!amount || !description || !category || !currency) {
    throw new Error('Please fill in all fields');
  }
  
  const newExpense: Expense = {
    id: uuid.v4() as string,
    amount: parseFloat(amount),
    currency: currency.code,
    category,
    description,
    created_at: new Date().toISOString()
  }

  
  const expenses = await getExpenses();
  console.log('Expences length before adding:', expenses.length);
  expenses.unshift(newExpense);  
  console.log('Expences length after adding:', expenses.length);
  await saveExpenses(expenses);
}

export async function getCategories(): Promise<string[]> {
  
  return defaultExpenseCategories;
}

export async function getExpenses(): Promise<Expense[]> {
  try {
    const result = await AsyncStorage.getItem('expenses');
    if (result) {
      const storedExpenses: Expense[] = JSON.parse(result);
      return storedExpenses;
    }else {
      console.log('No expenses found in storage');
      return mockExpenses; 
    }   
  } catch (error) {
    console.error('Error fetching expenses from storage:', error);
    return mockExpenses; 
  }
}



export async function calcTotal(baseCurrencyCode: string): Promise<number> {
  const basicCurrencies = await getCurrenciesList();
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
      const exchangeRate = baseCurrency.exchangeRate/expenseCurrencytoUSD.exchangeRate;
      return acc + (expense.amount * exchangeRate);
    }
  }, 0);

  return total;
  
}

export async function getRecentExpenses(): Promise<Expense[]> {

  const basicCurrencies = await getCurrenciesList();
  const expenses = await getExpenses();
  const recentExpenses = expenses.slice(0, 10).map((expense) => {    
    const currency = basicCurrencies.find(curr => curr.code === expense.currency);      
    return {
      ...expense,
      currency: currency?.symbol || expense.currency
    };
  });
  return recentExpenses;
  
}

export async function saveExpenses(expenses: Expense[] = []): Promise<void> {
  await AsyncStorage.setItem('expenses', JSON.stringify(expenses));
  console.log('Expenses saved:', expenses);
}

export async function setUpExpenses(){  
  await saveExpenses(mockExpenses);
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