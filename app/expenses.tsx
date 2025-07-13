import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../styles/tokens';
import { styles } from '../styles/styles';
import { useEffect, useState } from 'react';
import { getAllExpenses, removeFromExpenses } from '../utils/expenseUtils';
import { Expense } from '../types/expense';
import { MainButton } from '../components/MainButton';
import { debugAsyncStorage } from '../utils/debug';

export default function ExpensesScreen() {

  const [expences, setExpenses] = useState<Expense[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);

  useEffect(() => {
  
      async function fetchSettings() {
        
        try{
          const result = await getAllExpenses();
          setExpenses(result);        
        }catch (error) {
            console.error('Error fetching currencies list:', error);
        }                      
      }

      fetchSettings();
  
    }, []);

  function handleExpenseSelect(expenseId: string) {
    console.log('Selected expense:', expenseId);
    setSelectedExpenses(prevSelected => {
        if (prevSelected.includes(expenseId)) {            
            return prevSelected.filter(code => code !== expenseId);
        } else {           
            return [...prevSelected, expenseId];
        }
    });    
  }

  async function handleRemoveFromExpenses() {
    if (selectedExpenses.length === 0) {
      console.warn('No expenses selected for removal.');
      return;
    }
    
    try {
      await removeFromExpenses(selectedExpenses);
    } catch (error) {
      console.error('Error removing expenses:', error); 
      return;
    }
    try{
      const result = await getAllExpenses();
      setExpenses(result);        
      setSelectedExpenses([]); // Clear selection after removal
    }catch (error) {
        console.error('Error fetching expenses list:', error);
    }
    await debugAsyncStorage();
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>  
      <Text style={styles.title}>Expenses List</Text>

      <View>
        <Text style={styles.h3}>Currencies Short List:</Text>
        <ScrollView style={styles.expensesListContainer}>
            {expences.map((expense) => (
              <TouchableOpacity key={expense.id} style={styles.expenseListItem}
                onPress={() => handleExpenseSelect(expense.id)}
              >
                <View style={styles.expenseListItemRow}>
                  <Text style={[styles.text_md, selectedExpenses.includes(expense.id) && styles.selectedItem]}>{new Date(expense.created_at).toLocaleDateString()}</Text>  
                  <Text style={[styles.text_md, selectedExpenses.includes(expense.id) && styles.selectedItem]}>{`${expense.amount}${expense.currency}`}</Text> 
                </View>                                  
                <Text style={[styles.text_md, selectedExpenses.includes(expense.id) && styles.selectedItem]}>{expense.category}</Text>                   
                {(expense.category != expense.description) && <Text style={[styles.text_md, selectedExpenses.includes(expense.id) && styles.selectedItem]}>{expense.description}</Text>}                                  
              </TouchableOpacity>
            ))}                          
        </ScrollView>

        <View style={styles.buttonContainer}>
          <MainButton
            label="Edit Selected" 
            onPress={() => {}}
            disabled={selectedExpenses.length === 0 || selectedExpenses.length > 1} // Disable if no expenses selected
          />
          <MainButton
            label="Delete Selected" 
            onPress={handleRemoveFromExpenses}
            disabled={selectedExpenses.length === 0}
          />
        </View>
      </View>
      
      
    </SafeAreaView>
  );
}
