import {Currency} from '../types/currency';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUpExpenses } from './expenseUtils';
import { getCurrentLocationWithAddress } from './locationUtils';
import { ca } from 'date-fns/locale';

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

export function getCurrencyByCountry(country: string): string {
  return countryToCurrency[country] || 'USD'; // Default to USD if country not found
}

export async function getCurrenciesList(): Promise<Currency[]>{

    const result = await AsyncStorage.getItem('currencies');    
    const currencies:Currency[] = result ? JSON.parse(result) : getCurrencies();   
    return currencies;

}

export async function updateExchangeRates(currencies: Currency[]): Promise<Currency[]> {

    console.log('Updating exchange rates for currencies:');
    try{
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        const rates = data.rates;
        // console.log('DATA:', data);
        if (!rates) {
            throw new Error('No exchange rates found in the response');
        }
        await AsyncStorage.setItem('allAwailableCurrencies', JSON.stringify(data));
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
        // await setUpExpenses();
    //****************** */
    console.log('Setting up data...');
    
    const lastExchaneRatesUpdate = await AsyncStorage.getItem('currenciesLastUpdated');
    const shouldUpdateER = !lastExchaneRatesUpdate || 
        (Date.now() - new Date(lastExchaneRatesUpdate).getTime()) > (24*60*60*1000); // 24 hours in milliseconds
    if (shouldUpdateER) {
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

    try{
        const chekbaseCurrency = await AsyncStorage.getItem('baseCurrency');
        if (!chekbaseCurrency) {
            console.log('Base currency not found in AsyncStorage, setting default base currency');
            await AsyncStorage.setItem('baseCurrency', JSON.stringify(updatedExchangeRates.find(currency => currency.code === baseCurrency)));
        } else {
            console.log('Base currency already set:', JSON.parse(chekbaseCurrency));
        }
    }catch (error) {
        console.error('Error checking base currency in AsyncStorage:', error);
    }
    
    try{
        const chekLocalCurrency = await AsyncStorage.getItem('localCurrency');
        if (!chekLocalCurrency) {
            console.log('Local currency not found in AsyncStorage, setting default local currency');
            await AsyncStorage.setItem('localCurrency', JSON.stringify(updatedExchangeRates.find(currency => currency.code === localCurrency)));
        }else {
            console.log('Local currency already set:', JSON.parse(chekLocalCurrency));
        } 
    }catch (error) {
        console.error('Error checking local currency in AsyncStorage:', error);
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

const countryToCurrency: {[key: string]: string} = {
  'United States': 'USD',
  'US': 'USD',
  'USA': 'USD',
  'Germany': 'EUR',
  'France': 'EUR',
  'Spain': 'EUR',
  'Italy': 'EUR',
  'Netherlands': 'EUR',
  'Austria': 'EUR',
  'Belgium': 'EUR',
  'Finland': 'EUR',
  'Ireland': 'EUR',
  'Luxembourg': 'EUR',
  'Portugal': 'EUR',
  'Slovenia': 'EUR',
  'Slovakia': 'EUR',
  'Estonia': 'EUR',
  'Latvia': 'EUR',
  'Lithuania': 'EUR',
  'Malta': 'EUR',
  'Cyprus': 'EUR',
  'Croatia': 'EUR',
  'United Kingdom': 'GBP',
  'UK': 'GBP',
  'England': 'GBP',
  'Scotland': 'GBP',
  'Wales': 'GBP',
  'Israel': 'ILS',
  'Switzerland': 'CHF',
  'Hungary': 'HUF',
  'Czech Republic': 'CZK',
  'Czechia': 'CZK',
  'Denmark': 'DKK',
  'Canada': 'CAD',
  'Australia': 'AUD',
  'Japan': 'JPY',
  'China': 'CNY',
  'India': 'INR',
  'Brazil': 'BRL',
  'Mexico': 'MXN',
  'South Korea': 'KRW',
  'Russia': 'RUB',
  'Turkey': 'TRY',
  'South Africa': 'ZAR',
  'Norway': 'NOK',
  'Sweden': 'SEK',
  'Poland': 'PLN',
  'Thailand': 'THB',
  'Singapore': 'SGD',
  'New Zealand': 'NZD',
  'Hong Kong': 'HKD',
  'Argentina': 'ARS',
  'Chile': 'CLP',
  'Colombia': 'COP',
  'Peru': 'PEN',
  'Egypt': 'EGP',
  'Morocco': 'MAD',
  'Kenya': 'KES',
  'Nigeria': 'NGN',
  'Ghana': 'GHS',
  'Indonesia': 'IDR',
  'Malaysia': 'MYR',
  'Philippines': 'PHP',
  'Vietnam': 'VND',
  'Bangladesh': 'BDT',
  'Pakistan': 'PKR',
  'Sri Lanka': 'LKR',
  'Nepal': 'NPR',
  'Myanmar': 'MMK',
  'Cambodia': 'KHR',
  'Laos': 'LAK',
  'Mongolia': 'MNT',
  'Kazakhstan': 'KZT',
  'Uzbekistan': 'UZS',
  'Georgia': 'GEL',
  'Armenia': 'AMD',
  'Azerbaijan': 'AZN',
  'Belarus': 'BYN',
  'Ukraine': 'UAH',
  'Moldova': 'MDL',
  'Romania': 'RON',
  'Bulgaria': 'BGN',
  'Serbia': 'RSD',
  'North Macedonia': 'MKD',
  'Albania': 'ALL',
  'Montenegro': 'EUR',
  'Bosnia and Herzegovina': 'BAM',
  'Iceland': 'ISK',
  'Greenland': 'DKK',
  'Faroe Islands': 'DKK',
};



