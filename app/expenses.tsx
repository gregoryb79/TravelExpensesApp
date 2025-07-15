import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../styles/tokens';
import { styles } from '../styles/styles';
import { useEffect, useState } from 'react';
import { getAllExpenses, removeFromExpenses } from '../utils/expenseUtils';
import { Expense } from '../types/expense';
import { MainButton } from '../components/MainButton';
import { debugAsyncStorage } from '../utils/debug';
import { ExpenseContainer } from '../components/ExpenseContainer';
import { slimCurrency } from '../utils/currencyUtils';
import { getCurrentTrip } from '../utils/tripUtils';

export default function ExpensesScreen() {

  const [expences, setExpenses] = useState<Expense[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [currenciesList, setCurrenciesList] = useState<slimCurrency[]>([]);

  useEffect(() => {
  
      async function fetchSettings() {
        
        try{
          const result = await getCurrentTrip();
          setExpenses(result?.expenses|| []);
          setCurrenciesList(result?.currenciesList || []);        
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
  }

  const [editExpenseVisible, setEditExpenseVisible] = useState(false);
  const [amountToEdit, setAmountToEdit] = useState<string>('');
  const [currencyToEdit, setCurrencyToEdit] = useState<slimCurrency>();
  const [categoryToEdit, setCategoryToEdit] = useState<string>('');
  const [descriptionToEdit, setDescriptionToEdit] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState<string>('');

  async function handleEditSelected() {
    if (selectedExpenses.length !== 1) {
      console.warn('Please select exactly one expense to edit.');
      return;
    }
    const expenseId = selectedExpenses[0];
    console.log('Editing expense:', expenseId);
    setEditExpenseVisible(true);
    const expenseToEdit = expences.find(exp => exp.id === expenseId);
    if (!expenseToEdit) {
      console.error('Expense not found for editing:', expenseId);
      return;
    }
    setAmountToEdit(expenseToEdit.amount.toString());
    setCurrencyToEdit(expenseToEdit.currency);
    setCategoryToEdit(expenseToEdit.category);
    setDescriptionToEdit(expenseToEdit.description || '');  
    setExpenseDate(new Date(expenseToEdit.created_at).toLocaleDateString());

  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>  
      <Text style={styles.title}>Expenses List</Text>

      <View>        
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
            onPress={handleEditSelected}
            disabled={selectedExpenses.length === 0 || selectedExpenses.length > 1} // Disable if no expenses selected
          />
          <MainButton
            label="Delete Selected" 
            onPress={handleRemoveFromExpenses}
            disabled={selectedExpenses.length === 0}
          />
        </View>
      </View>

      <Modal
        visible={editExpenseVisible}
        animationType="slide"
        transparent={true}
        >
        <View style={styles.editExpenseContainer}>
          <Text style={[styles.h3, styles.padding_bottom_10]}>Edit Expense</Text>
          <ExpenseContainer
            amount={amountToEdit}
            onAmountChangeText={setAmountToEdit}
            currency={currencyToEdit}
            onCurrencyValueChange={setCurrencyToEdit}
            currenciesList={[]} 
            category={categoryToEdit}
            onCategoryValueChange={setCategoryToEdit}
            categories={[]}
            description={descriptionToEdit}
            onDescriptionChangeText={setDescriptionToEdit}
            onSubmit={() => {}}
          />

        </View>
      </Modal>
      
      
      
    </SafeAreaView>
  );
}
