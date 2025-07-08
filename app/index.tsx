import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { getBasicCurrencie, getLocalCurrencie } from '../utils/currencyUtils';
import { Currency } from '../types/currency';
import { SafeAreaView } from 'react-native-safe-area-context';
import { calcTotal, getExpenses, getRecentExpenses } from '../utils/expenseUtils';
import { Expense } from '../types/expense';

export default function HomeScreen() {

    const [baseCurrency, setBaseCurrency] = useState<Currency>();
    const [localCurrency, setLocalCurrency] = useState<Currency>();
    const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]); 
    const [totalSpent, setTotalSpent] = useState<number>(0);
    
    useEffect(() => {
        async function fetchSettings() {
            try {
                const result = await getBasicCurrencie();
                setBaseCurrency(result);
                console.log('Base currency:', result);
            } catch (error) {
                console.error('Error fetching base currency:', error);
            }
            try {
                const result = await getLocalCurrencie();
                setLocalCurrency(result);
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
        }
        fetchSettings();

    }, []);


  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>      
      
        <View style={styles.quickStats}>
            <Text style={styles.statsTitle}>{`💰 Total Spent: ${baseCurrency?.symbol} ${totalSpent.toFixed(2)}`}</Text>
            <Text style={styles.statsSubtitle}>🌍 Current Trip: Not set</Text> 
            {/* <Text style={styles.statsSubtitle}>{`Local Currency ${localCurrency?.symbol}`}</Text>        */}
        </View>

        <View style={styles.buttonContainer}>
            <Link href="/add-expense" asChild>
            <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>+ Add Expense</Text>
            </TouchableOpacity>
            </Link>
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
        backgroundColor: '#fff',
        padding: 20,       
    },
    h3: {
        fontSize: 20,
        fontWeight: 'bold',        
        color: '#333',
    },
    padding_bottom_10: {
        paddingBottom: 10,
    },
    text_md: {
        fontSize: 18,
        color: '#333',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        color: '#666',
    },
    quickStats: {
        backgroundColor: '#f5f5f5',
        padding: 20,
        borderRadius: 10,
        marginBottom: 40,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    statsSubtitle: {
        fontSize: 16,
        color: '#666',
    },
    buttonContainer: {
        gap: 15,
    },
    primaryButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '500',
    },
    recentExpencesContainter: {
        flex: 1,
        marginTop: 10,
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
    },    
    listItem: {
        padding: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',               
        marginBottom: 5,
    }
});
