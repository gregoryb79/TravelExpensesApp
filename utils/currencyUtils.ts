import {Currency} from '../types/currency';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultCurrencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1.0 },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', exchangeRate: 1.0 },
  { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 1.0 },
  { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 1.0 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', exchangeRate: 1.0 },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', exchangeRate: 1.0 },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', exchangeRate: 1.0 },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', exchangeRate: 1.0 }
];

const baseCurrency = "ILS";
const localCurrency = "EUR";

export function getCurrencies(): Currency[] {
  return defaultCurrencies;
}

export async function getCurrenciesList(): Promise<Currency[]>{
    const currencies = getCurrencies();    
    return currencies;
}

export async function updateExchangeRates(currencies: Currency[]): Promise<Currency[]> {

    console.log('Updating exchange rates for currencies:');
    try{
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        const rates = data.rates;
        if (!rates) {
            throw new Error('No exchange rates found in the response');
        }
        console.log('Exchange rates fetched:', rates);
        await AsyncStorage.setItem('exchangeRates', JSON.stringify(rates));
        console.log('Exchange rates saved to AsyncStorage');        
        const updatedCurrencies = currencies.map(currency => {
            if (rates[currency.code]) {
                return { ...currency, exchangeRate: rates[currency.code] };
            }
            return currency;
        });

        return updatedCurrencies;
    }catch (error) {
        console.error('Error fetching exchange rates:', error);
        return currencies; 
    }
      
}

export async function getAllAwailableCurrencies(): Promise<string[]> {
    try {
        const result = await AsyncStorage.getItem('exchangeRates');
        if (result) {
            const rates = JSON.parse(result);
            const listOfCurrenices = Object.keys(rates);
            return listOfCurrenices;
        } else {
            console.log('No currencies found in AsyncStorage returning default currencies');
            return (await getCurrenciesList()).map(currency => currency.code);
        }
    } catch (error) {
        console.error('Error retrieving currencies from AsyncStorage:', error);
        return (await getCurrenciesList()).map(currency => currency.code);
    }
}

export async function setupData() {
    //FOR DEV PURPOSES ONLY
        // await AsyncStorage.clear(); 
        // console.log('AsyncStorage cleared for development purposes');   
        // try {
        //     const result = await AsyncStorage.getItem('currencies');
        //     if (result) {
        //         console.log('Currencies already set up:', JSON.parse(result));                
        //     }
        // } catch (error) {
        //     console.error('There is nothing in storage', error);
        // }
    //****************** */
    console.log('Setting up data...');
    
    const lastExchaneRatesUpdate = await AsyncStorage.getItem('currenciesLastUpdated');
    const shouldUpdate = !lastExchaneRatesUpdate || 
        (Date.now() - new Date(lastExchaneRatesUpdate).getTime()) > (24*60*60*1000); // 24 hours in milliseconds

    
    if (shouldUpdate) {
        console.log('Updating exchange rates...');
        const currenciesArray = getCurrencies();
        const updatedExchangeRates = await updateExchangeRates(currenciesArray);
        console.log('UExchange rates updadted');

        await AsyncStorage.setItem('currencies', JSON.stringify(updatedExchangeRates));
        await AsyncStorage.setItem('currenciesLastUpdated', new Date().toISOString());
        console.log('Currencies saved to AsyncStorage');               
    } else {
        console.log('Exchange rates are up to date, no need to update');
    }
      
    const result = await AsyncStorage.getItem('currencies');
    
    const updatedExchangeRates:Currency[] = result ? JSON.parse(result) : getCurrencies();

    const chekbaseCurrency = await AsyncStorage.getItem('baseCurrency');
    if (!chekbaseCurrency) {
        console.log('Base currency not found in AsyncStorage, setting default base currency');
        await AsyncStorage.setItem('baseCurrency', JSON.stringify(updatedExchangeRates.find(currency => currency.code === baseCurrency)));
    } else {
        console.log('Base currency already set:', JSON.parse(chekbaseCurrency));
    }
    const chekLocalCurrency = await AsyncStorage.getItem('localCurrency');
    if (!chekLocalCurrency) {
        console.log('Local currency not found in AsyncStorage, setting default local currency');
        await AsyncStorage.setItem('localCurrency', JSON.stringify(updatedExchangeRates.find(currency => currency.code === localCurrency)));
    }    
}

export async function getBasicCurrency() : Promise<Currency> {
    const result = await AsyncStorage.getItem('baseCurrency');
    if (!result) {
        throw new Error('Base currency not found in AsyncStorage');
    }    
    const baseCurrencie = JSON.parse(result);    
    console.log('Base currency retrieved:', baseCurrencie);
    return baseCurrencie;
}

export async function getLocalCurrency() : Promise<Currency> {
    const result = await AsyncStorage.getItem('localCurrency');
    if (!result) {
        throw new Error('Base currency not found in AsyncStorage');
    }    
    const localCurrencie = JSON.parse(result);    
    console.log('Local currency retrieved:', localCurrencie);
    return localCurrencie;
}



