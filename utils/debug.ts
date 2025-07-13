import AsyncStorage from '@react-native-async-storage/async-storage';

export async function debugAsyncStorage() {
    try {
        console.log('=== ASYNC STORAGE DEBUG ===');
        
        // Get all keys
        const keys = await AsyncStorage.getAllKeys();
        console.log('Available keys:', keys);
        
        // Get specific items
        // const baseCurrency = await AsyncStorage.getItem('baseCurrency');
        // const localCurrency = await AsyncStorage.getItem('localCurrency');
        // const currencies = await AsyncStorage.getItem('currencies');
        // const exchangeRates = await AsyncStorage.getItem('exchangeRates');
        // const expenses = await AsyncStorage.getItem('expenses');
        
        // console.log('Base Currency:', baseCurrency);
        // console.log('Local Currency:', localCurrency);
        // console.log('Currencies:', currencies);
        // console.log('Exchange Rates:', exchangeRates);
        // console.log('Expenses:', expenses);
        
        console.log('===========================');
    } catch (error) {
        console.error('Error reading AsyncStorage:', error);
    }
}