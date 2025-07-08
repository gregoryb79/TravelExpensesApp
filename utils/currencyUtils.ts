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

export function getCurrencies(): Currency[] {
  return defaultCurrencies;
}

export async function getCurrenciesList(): Promise<string[]>{
    const currencies = getCurrencies();
    const currenciesList = currencies.map(currency => (
        currency.code
    ));
    return currenciesList;
}

export async function updateExchangeRates(currencies: Currency[]): Promise<Currency[]> {

    console.log('Updating exchange rates for currencies:');
    try{
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        const rates = data.rates;
        console.log('Exchange rates fetched:', rates);
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



    await AsyncStorage.setItem('baseCurrencie', JSON.stringify(updatedExchangeRates.find(currency => currency.code === 'ILS')));
    await AsyncStorage.setItem('localCurrencie', JSON.stringify(updatedExchangeRates.find(currency => currency.code === 'EUR')));
    
}

export async function getBasicCurrencie() : Promise<Currency> {
    const result = await AsyncStorage.getItem('baseCurrencie');
    if (!result) {
        throw new Error('Base currency not found in AsyncStorage');
    }    
    const baseCurrencie = JSON.parse(result);    
    console.log('Base currency retrieved:', baseCurrencie);
    return baseCurrencie;
}

export async function getLocalCurrencie() : Promise<Currency> {
    const result = await AsyncStorage.getItem('localCurrencie');
    if (!result) {
        throw new Error('Base currency not found in AsyncStorage');
    }    
    const localCurrencie = JSON.parse(result);    
    console.log('Local currency retrieved:', localCurrencie);
    return localCurrencie;
}



