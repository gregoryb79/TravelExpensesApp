import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { getBasicCurrency, getCurrencies, getCurrenciesList, getLocalCurrency, slimCurrency } from '../utils/currencyUtils';
import { Currency } from '../types/currency';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addExpense, calcTotal, getCategories, } from '../utils/expenseUtils';
import { Expense } from '../types/expense';
import { Picker } from '@react-native-picker/picker';
import { colors, typography, spacing, borderRadius } from '../styles/tokens';
import { MainButton } from '../components/MainButton';
import { CurrencyPicker } from '../components/CurrencyPicker';
import { debugAsyncStorage } from '../utils/debug';
import { Trip } from '../types/trip';
import { ca } from 'date-fns/locale';
import { getCurrentTrip, getCurrentTripName } from '../utils/tripUtils';
import { ExpenseContainer } from '../components/ExpenseContainer';
import { styles } from '../styles/styles';
// import { useFocusEffect } from '@react-navigation/native';


export default function HomeScreen() {

    const [baseCurrency, setBaseCurrency] = useState<slimCurrency>();
    const [localCurrency, setLocalCurrency] = useState<slimCurrency>();
    const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]); 
    const [totalSpent, setTotalSpent] = useState<number>(0);
    const [categories, setCategories] = useState<string[]>([]);
    const [currenciesList, setCurrenciesList] = useState<slimCurrency[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTrip, setCurrentTrip] = useState<Trip>();

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [currency, setCurrency] = useState<slimCurrency>();
    
    useFocusEffect(useCallback(() => {
        async function fetchSettings() {

            let localCurrencyResult: slimCurrency | undefined;
            let baseCurrencyResult: slimCurrency | undefined;

            try{
                const result = await getCurrentTrip();
                if (result) {
                    setCurrentTrip(result);
                    localCurrencyResult = result.localCurrency;
                    baseCurrencyResult = result.baseCurrency;
                    setCurrency(result.localCurrency);
                    console.log(`Current trip set: ${result.name}, Local Currency: ${localCurrencyResult?.code}, Base Currency: ${baseCurrencyResult?.code}`);
                } else {
                    console.log('No current trip set');
                }
            }catch (error) {
                console.error('Error fetching current trip:', error);
            }
            
            try {                
                const total = currentTrip ? await calcTotal(currentTrip) : 0;
                setTotalSpent(total);
                console.log('Total spent:', total);
            } catch (error) {
                console.error('Error fetching total spent:', error);
            }            
            try{
                const result = await getCategories();
                setCategories(result);
                setCategory(result[0] || ''); 
                console.log('Categories:', result);
            }catch (error) {
                console.error('Error fetching categories:', error);
            }
            setLoading(false);
        }
        fetchSettings();

    }, []));

    async function handleExpenceSubmit() {
        console.log('Expense submitted:');
        console.log(`Amount: ${amount}`);
        console.log(`Description: ${description}`);
        console.log(`Category: ${category}`);
        console.log(`Currency: ${currency?.code || 'USD'}`);
        if (!amount || !category || !currency) {
            console.error('Please fill in all fields');
            alert('Please fill in all fields');
            return;
        }       
      
        try {
            await addExpense(amount, (description) ? description : category, category, currency);
            console.log('Expense added successfully');
        }catch (error) {
            console.error('Error adding expense:', error);
            alert('Error adding expense');
            return;
        }

        try {
            const result = await getCurrentTrip();            
            if ( result){
                setCurrentTrip(result);
                console.log('Expenses:', result.expenses.length);
                const total = await calcTotal(result);
                setTotalSpent(total);
                setCurrency(result.localCurrency);
            }            
        } catch (error) {
            console.error('Error fetching current trip:', error);
        }       

        setAmount('');
        setDescription('');
        setCategory(categories[0] || '');
        
    }

    if (loading) {
        return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
            <Text>Initializing app...</Text>        
        </View>
        );
    }

    // debugAsyncStorage();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>      
      
        <View style={styles.quickStats}>
            <Text style={styles.statsTitle}>{`💰 Total Spent: ${currentTrip?.baseCurrency.symbol} ${totalSpent.toFixed(2)}`}</Text>
            <Text style={styles.statsSubtitle}>{`Current Trip: ${currentTrip?.name ? currentTrip?.name : "Not Set"}`}</Text>            
        </View>

        <ExpenseContainer
            amount={amount}
            onAmountChangeText={setAmount}
            currency={currency}
            onCurrencyValueChange={setCurrency}
            currenciesList={currentTrip?.currenciesList || []}
            category={category}
            onCategoryValueChange={setCategory}
            categories={categories}
            description={description}
            onDescriptionChangeText={setDescription}
            onSubmit={handleExpenceSubmit}
        />
        
        <View style={styles.recentExpencesContainter}>
            <Text style={[styles.h3, styles.padding_bottom_10]}>Recent Expenses</Text>
            <ScrollView>
                {currentTrip?.expenses.slice(0, 10).map((expense) => (
                <View key={expense.id} style={styles.listItem}>
                    <Text style={styles.text_md}>{expense.description}</Text>
                    <Text style={styles.text_md}>{`${expense.amount} ${currenciesList.find(c => c.code === expense.currency)?.symbol || expense.currency}`}</Text>
                </View>
                ))}                
            </ScrollView>
        </View>


        <View style={styles.buttonContainer}>
            <Link href="/expenses" asChild>
                <TouchableOpacity style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>View All Expenses</Text>
                </TouchableOpacity>
            </Link>        
        </View>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         flexDirection: 'column',
//         backgroundColor: colors.background,
//         padding: spacing.lg,  
//         gap: spacing.md,     
//     },
//     h3: {
//         fontSize: typography.lg,
//         fontWeight: typography.weights.bold,        
//         color: colors.textPrimary,
//     },
//     padding_bottom_10: {
//         paddingBottom: spacing.base,
//     },
//     text_md: {
//         fontSize: typography.md,
//         color: colors.textPrimary,
//     },
//     backgroundWhite:{
//         backgroundColor: colors.textWhite,
//     },
//     borderRadius_sm:{
//         borderRadius: borderRadius.sm,
//     },
//     padding_sm: {
//         padding: spacing.sm,
//     },
//     title: {
//         fontSize: typography.xxl,
//         fontWeight: typography.weights.bold,
//         textAlign: 'center',
//         marginBottom: spacing.sm,
//         color: colors.textPrimary,
//     },
//     subtitle: {
//         fontSize: typography.base,
//         textAlign: 'center',
//         marginBottom: spacing.xl,
//         color: colors.textSecondary,
//     },
//     quickStats: {
//         backgroundColor: colors.surface,
//         padding: spacing.lg,
//         borderRadius: borderRadius.base,        
//     },
//     statsTitle: {
//         fontSize: typography.md,
//         fontWeight: typography.weights.semibold,
//         marginBottom: spacing.sm,
//         color: colors.textPrimary,
//     },
//     statsSubtitle: {
//         fontSize: typography.base,
//         color: colors.textSecondary,
//     },
//     buttonContainer: {
//         gap: spacing.md,
//     },
//     primaryButton: {
//         backgroundColor: colors.primary,
//         padding: spacing.md,
//         borderRadius: borderRadius.base,
//         alignItems: 'center',
//         minWidth: '60%',
//         alignSelf: 'center',
//         marginBottom: spacing.md,
//     },
//     primaryButtonText: {
//         color: colors.textWhite,
//         fontSize: typography.md,
//         fontWeight: typography.weights.semibold,
//     },
//     secondaryButton: {
//         backgroundColor: colors.surfaceLight,
//         padding: spacing.md,
//         borderRadius: borderRadius.base,
//         alignItems: 'center',
//     },
//     secondaryButtonText: {
//         color: colors.textPrimary,
//         fontSize: typography.base,
//         fontWeight: typography.weights.medium,
//     },
//     recentExpencesContainter: {
//         flex: 1,        
//         padding: spacing.base,
//         backgroundColor: colors.surfaceSecondary,
//         borderRadius: borderRadius.base,
//     },    
//     listItem: {
//         padding: spacing.xs,
//         flexDirection: 'row',
//         justifyContent: 'space-between',               
//         marginBottom: spacing.sm,
//     },
//     addExpenseContainter: {
//         backgroundColor: colors.surface,
//         borderRadius: borderRadius.base,
//     },
//     amountContainer:{
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',        
//         padding: spacing.sm,
//     },
//     amountInput: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: spacing.sm,          
//     }, 
//     amountInputBox: {
//         fontSize: typography.md,
//         backgroundColor: colors.textWhite,
//         borderRadius: borderRadius.sm,   
//         width: typography.md*5,
//         textAlign: 'right',    
//     },
//     pickerContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         padding: spacing.sm,
//         gap: spacing.sm,
//     },   
//     categoriesPicker: {        
//         flex: 1,        
//         backgroundColor: colors.textWhite,
//         borderRadius: borderRadius.sm,
//         marginBottom: spacing.sm,        
//     },
//     currencyPicker: {        
//         // flex: 1,        
//         backgroundColor: colors.textWhite,
//         width: typography.md*7,
//         borderRadius: borderRadius.sm,
//         marginBottom: spacing.sm,        
//     },
//     descriptionInput: {
//         backgroundColor: colors.textWhite,
//         borderRadius: borderRadius.sm,
//         padding: spacing.sm,
//         fontSize: typography.md,              
//     },
// });
