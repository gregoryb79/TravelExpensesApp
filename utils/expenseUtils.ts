import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '../types/expense';
import { getCurrenciesList, slimCurrency } from './currencyUtils';
import uuid from 'react-native-uuid';
import { Trip } from '../types/trip';
import { getCurrentTrip, saveCurrentTrip } from './tripUtils';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export const defaultExpenseCategories = ["Groceries", "Souvenirs", "Eating Out & TA", "Beer and Coffee", "Transport & Parking", "Attractions", "Other"];

export async function addExpense(amount: string, description: string, category: string, currency: slimCurrency): Promise<void> {
  
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
  
  const currentTrip = await getCurrentTrip();
  if (!currentTrip) {
    throw new Error('No current trip found');
  }
  console.log('Expences length before adding:', currentTrip?.expenses.length);
  currentTrip?.expenses.unshift(newExpense);  
  console.log('Expences length after adding:', currentTrip?.expenses.length);
  await saveCurrentTrip(currentTrip);
}

export async function editExpense(expenseId: string, amount: string, description: string, category: string, currency: slimCurrency): Promise<void> {
  
  if (!expenseId || !amount || !description || !category || !currency) {
    throw new Error('Please fill in all fields');
  }
  
  const currentTrip = await getCurrentTrip();
  if (!currentTrip) {
    throw new Error('No current trip found');
  }
  
  const expenseIndex = currentTrip.expenses.findIndex(exp => exp.id === expenseId);
  if (expenseIndex === -1) {
    throw new Error('Expense not found');
  }
  
  currentTrip.expenses[expenseIndex] = {
    ...currentTrip.expenses[expenseIndex],
    amount: parseFloat(amount),
    description,
    category,
    currency: currency.code,    
  };
  
  await saveCurrentTrip(currentTrip);
}

export async function removeFromExpenses(expensesList: string[]): Promise<void> {
    
    try {
        const currentTrip = await getCurrentTrip();
        if (currentTrip) {
          currentTrip.expenses = currentTrip.expenses.filter(expense => !expensesList.includes(expense.id));
          await saveCurrentTrip(currentTrip);
          console.log('Expenses updated successfully');
        } else {
          console.log('No current trip found, cannot remove expenses');
        }
    } catch (error) {
        console.error('Error updating expenses:', error);
    }
}

export async function getCategories(): Promise<string[]> {
  
  return defaultExpenseCategories;
}

export async function getExpenses (): Promise<Expense[]> {
    try {
        const currentTrip = await getCurrentTrip();
        if (!currentTrip) {
            console.log('No current trip found, returning empty expenses list');
            return [];
        }             
        return currentTrip.expenses;                
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return [];
    }
}



export async function calcTotal(currTrip : Trip): Promise<number> {
  
  const basicCurrencies = await getCurrenciesList();
  const baseCurrency = basicCurrencies.find(curr => curr.code === currTrip.baseCurrency.code);
     
  if (!baseCurrency) {
    throw new Error(`Currency ${baseCurrency} not found`);
  }

  const expenses = currTrip.expenses;
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

export async function getAllExpenses(): Promise<Expense[]> {

  const basicCurrencies = await getCurrenciesList();
  const expenses = await getExpenses();
  const allExpenses = expenses.map((expense) => {    
    const currency = basicCurrencies.find(curr => curr.code === expense.currency);      
    return {
      ...expense,
      currency: currency?.symbol || expense.currency
    };
  });
  return allExpenses;
  
}

export async function saveExpenses(expenses: Expense[] = []): Promise<void> {
  await AsyncStorage.setItem('expenses', JSON.stringify(expenses));
  console.log('Expenses saved:', expenses);
}

function expensesToCSV(expenses: Expense[]): string {
  const header = 'Date,Amount,Currency,Category,Description\n';
  const rows = expenses.map(exp =>
    [
      new Date(exp.created_at).toLocaleDateString(),
      exp.amount,
      exp.currency,
      `"${exp.category}"`,
      `"${exp.description || ''}"`
    ].join(',')
  );
  return header + rows.join('\n');
}

export async function exportExpensesToCSV(expenses: Expense[]) {
  const csv = expensesToCSV(expenses);
  const fileUri = FileSystem.documentDirectory + 'expenses.csv';  
  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/csv',
    dialogTitle: 'Share your expenses CSV',
    UTI: 'public.comma-separated-values-text'
  });
}



// export async function setUpExpenses(){  
//   await saveExpenses(mockExpenses);
// }

// const mockExpenses: Expense[] = [
//   {
//     id: '1',
//     amount: 25.50,
//     currency: 'EUR',
//     category: 'Eating Out & TA',
//     description: 'Lunch at Café Roma',
//     created_at: '2025-07-08T12:30:00Z'
//   },
//   {
//     id: '2',
//     amount: 2.50,
//     currency: 'EUR',
//     category: 'Gas + Parking',
//     description: 'Metro ticket',
//     created_at: '2025-07-08T09:15:00Z'
//   },
//   {
//     id: '3',
//     amount: 17.00,
//     currency: 'EUR',
//     category: 'Attractions',
//     description: 'Louvre Museum entrance',
//     created_at: '2025-07-07T14:45:00Z'
//   },
//   {
//     id: '4',
//     amount: 4.80,
//     currency: 'EUR',
//     category: 'Beer and Coffee',
//     description: 'Morning coffee and croissant',
//     created_at: '2025-07-07T08:20:00Z'
//   },
//   {
//     id: '5',
//     amount: 32.40,
//     currency: 'EUR',
//     category: 'Groceries',
//     description: 'Supermarket shopping',
//     created_at: '2025-07-06T16:10:00Z'
//   },
//   {
//     id: '6',
//     amount: 18.75,
//     currency: 'EUR',
//     category: 'Souvenirs',
//     description: 'Postcard and keychain',
//     created_at: '2025-07-06T11:25:00Z'
//   },
//   {
//     id: '7',
//     amount: 45.00,
//     currency: 'EUR',
//     category: 'Eating Out & TA',
//     description: 'Dinner at bistro',
//     created_at: '2025-07-05T19:30:00Z'
//   },
//   {
//     id: '8',
//     amount: 12.00,
//     currency: 'EUR',
//     category: 'Attractions',
//     description: 'Notre Dame donation',
//     created_at: '2025-07-05T15:00:00Z'
//   },
//   {
//     id: '9',
//     amount: 8.50,
//     currency: 'EUR',
//     category: 'Gas + Parking',
//     description: 'Taxi ride',
//     created_at: '2025-07-04T21:15:00Z'
//   },
//   {
//     id: '10',
//     amount: 15.30,
//     currency: 'EUR',
//     category: 'Beer and Coffee',
//     description: 'Evening drinks',
//     created_at: '2025-07-04T18:45:00Z'
//   },
//   {
//     id: '11',
//     amount: 28.90,
//     currency: 'EUR',
//     category: 'Eating Out & TA',
//     description: 'French bakery breakfast',
//     created_at: '2025-07-03T07:30:00Z'
//   },
//   {
//     id: '12',
//     amount: 55.00,
//     currency: 'EUR',
//     category: 'Souvenirs',
//     description: 'Paris t-shirt and mug',
//     created_at: '2025-07-03T13:20:00Z'
//   },
//   {
//     id: '13',
//     amount: 22.50,
//     currency: 'EUR',
//     category: 'Attractions',
//     description: 'Eiffel Tower elevator',
//     created_at: '2025-07-02T10:00:00Z'
//   },
//   {
//     id: '14',
//     amount: 6.75,
//     currency: 'EUR',
//     category: 'Gas + Parking',
//     description: 'Day pass metro',
//     created_at: '2025-07-02T08:00:00Z'
//   },
//   {
//     id: '15',
//     amount: 38.20,
//     currency: 'EUR',
//     category: 'Groceries',
//     description: 'Local market purchases',
//     created_at: '2025-07-01T17:45:00Z'
//   }
// ];