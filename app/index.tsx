import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { getBasicCurrency, getCurrencies, getCurrenciesList, getLocalCurrency } from '../utils/currencyUtils';
import { Currency } from '../types/currency';
import { SafeAreaView } from 'react-native-safe-area-context';
import { calcTotal, getCategories, getExpenses, getRecentExpenses } from '../utils/expenseUtils';
import { Expense } from '../types/expense';
import { Picker } from '@react-native-picker/picker';
import { colors, typography, spacing, borderRadius } from '../styles/tokens';

export default function HomeScreen() {

    const [baseCurrency, setBaseCurrency] = useState<Currency>();
    const [localCurrency, setLocalCurrency] = useState<Currency>();
    const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]); 
    const [totalSpent, setTotalSpent] = useState<number>(0);
    const [categories, setCategories] = useState<string[]>([]);
    const [currenciesList, setCurrenciesList] = useState<string[]>([]);

    const [amount, setAmount] = useState('0.00');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [currency, setCurrency] = useState('');
    
    useEffect(() => {
        async function fetchSettings() {
            try {
                const result = await getBasicCurrency();
                setBaseCurrency(result);
                console.log('Base currency:', result);
            } catch (error) {
                console.error('Error fetching base currency:', error);
            }
            try {
                const result = await getLocalCurrency();
                setLocalCurrency(result);
                setCurrency(result?.symbol || '$');
                console.log('Local currency:', result);
            } catch (error) {
                console.error('Error fetching base currency:', error);
            }
            try {
                const result = await getRecentExpenses();
                
                setRecentExpenses(result);
                console.log('Recent expenses:', result.length);
                
            } catch (error) {
                console.error('Error fetching base currency:', error);
            }
            try {                
                const total = await calcTotal(localCurrency?.code||'USD');
                setTotalSpent(total);
                console.log('Total spent:', total);
            } catch (error) {
                console.error('Error fetching total spent:', error);
            }
            try{
                const result = await getCurrenciesList();
                setCurrenciesList(result);
                console.log('Currencies list:', result);
            }catch (error) {
                console.error('Error fetching currencies list:', error);
            }
            try{
                const result = await getCategories();
                setCategories(result);
                setCategory(result[0] || ''); 
                console.log('Categories:', result);
            }catch (error) {
                console.error('Error fetching categories:', error);
            }
        }
        fetchSettings();

    }, []);

    function handleExpenceSubmit() {
        console.log('Expense submitted:');
        console.log(`Amount: ${amount}`);
        console.log(`Description: ${description}`);
        console.log(`Category: ${category}`);
        setAmount('0.00');
        setDescription('');
        setCategory(categories[0] || '');
    }


  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>      
      
        <View style={styles.quickStats}>
            <Text style={styles.statsTitle}>{`💰 Total Spent: ${baseCurrency?.symbol} ${totalSpent.toFixed(2)}`}</Text>
            <Text style={styles.statsSubtitle}>🌍 Current Trip: Not set</Text>            
        </View>

        <View style={styles.addExpenseContainter}>
            <View style={styles.amountContainer}>
                <Text style={styles.text_md}>Amount:</Text>
                <View style={styles.amountInput}>
                    <TextInput
                        style={styles.amountInputBox}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        placeholder="0.00"
                    />
                    <Text style={styles.text_md}>{`${localCurrency?.symbol}`}</Text>
                </View>                              
            </View>
            <View style={styles.pickerContainer}>
                <Text style={styles.text_md}>Category:</Text>
                <Picker
                    style={styles.categoriesPicker}                    
                    selectedValue={category}
                    mode="dropdown"
                    onValueChange={setCategory}>
                        {categories.map((cat) => (
                            <Picker.Item key={cat} label={cat} value={cat} style={styles.text_md}/>
                        ))}
                </Picker>
            </View>
            <View style={styles.padding_sm}>
                <Text style={styles.text_md}>Description:</Text>
                <TextInput
                    style={styles.descriptionInput}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Expense description"
                />
            </View>           
            <TouchableOpacity style={styles.primaryButton} onPress={handleExpenceSubmit}>
                <Text style={styles.primaryButtonText}>Add Expense</Text>
            </TouchableOpacity>            
        </View>

        <View style={styles.recentExpencesContainter}>
            <Text style={[styles.h3, styles.padding_bottom_10]}>Recent Expenses</Text>
            <ScrollView>
                {recentExpenses.map((expense) => (
                <View key={expense.id} style={styles.listItem}>
                    <Text style={styles.text_md}>{expense.description}</Text>
                    <Text style={styles.text_md}>{`${expense.amount} ${expense.currency}`}</Text>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: colors.background,
        padding: spacing.lg,  
        gap: spacing.md,     
    },
    h3: {
        fontSize: typography.lg,
        fontWeight: typography.weights.bold,        
        color: colors.textPrimary,
    },
    padding_bottom_10: {
        paddingBottom: spacing.base,
    },
    text_md: {
        fontSize: typography.md,
        color: colors.textPrimary,
    },
    backgroundWhite:{
        backgroundColor: colors.textWhite,
    },
    borderRadius_sm:{
        borderRadius: borderRadius.sm,
    },
    padding_sm: {
        padding: spacing.sm,
    },
    title: {
        fontSize: typography.xxl,
        fontWeight: typography.weights.bold,
        textAlign: 'center',
        marginBottom: spacing.sm,
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: typography.base,
        textAlign: 'center',
        marginBottom: spacing.xl,
        color: colors.textSecondary,
    },
    quickStats: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: borderRadius.base,        
    },
    statsTitle: {
        fontSize: typography.md,
        fontWeight: typography.weights.semibold,
        marginBottom: spacing.sm,
        color: colors.textPrimary,
    },
    statsSubtitle: {
        fontSize: typography.base,
        color: colors.textSecondary,
    },
    buttonContainer: {
        gap: spacing.md,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: borderRadius.base,
        alignItems: 'center',
        minWidth: '60%',
        alignSelf: 'center',
        marginBottom: spacing.md,
    },
    primaryButtonText: {
        color: colors.textWhite,
        fontSize: typography.md,
        fontWeight: typography.weights.semibold,
    },
    secondaryButton: {
        backgroundColor: colors.surfaceLight,
        padding: spacing.md,
        borderRadius: borderRadius.base,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: colors.textPrimary,
        fontSize: typography.base,
        fontWeight: typography.weights.medium,
    },
    recentExpencesContainter: {
        flex: 1,        
        padding: spacing.base,
        backgroundColor: colors.surfaceSecondary,
        borderRadius: borderRadius.base,
    },    
    listItem: {
        padding: spacing.xs,
        flexDirection: 'row',
        justifyContent: 'space-between',               
        marginBottom: spacing.sm,
    },
    addExpenseContainter: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.base,
    },
    amountContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',        
        padding: spacing.sm,
    },
    amountInput: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,          
    }, 
    amountInputBox: {
        fontSize: typography.md,
        backgroundColor: colors.textWhite,
        borderRadius: borderRadius.sm,   
        width: typography.md*5,
        textAlign: 'right',    
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm,
        gap: spacing.sm,
    },   
    categoriesPicker: {        
        flex: 1,        
        backgroundColor: colors.textWhite,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.sm,        
    },
    descriptionInput: {
        backgroundColor: colors.textWhite,
        borderRadius: borderRadius.sm,
        padding: spacing.sm,
        fontSize: typography.md,              
    },
});
