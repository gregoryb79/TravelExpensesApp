import {Currency} from '../types/currency';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUpExpenses } from './expenseUtils';
import { getCurrentLocationWithAddress } from './locationUtils';
import { ca } from 'date-fns/locale';
import { countryToCurrency, currencyCodeToSymbol } from '../data/currency.data';



const baseCurrency = "ILS";
const localCurrency = "EUR";
export type slimCurrency = Omit<Currency, 'exchangeRate'>;
export function getCurrencies(): slimCurrency[] {
  return defaultCurrencies;
}

// export function getCurrencyByCountry(country: string): string {
//   return countryToCurrency[country] || 'USD'; // Default to USD if country not found
// }

// export function getCountriesList(): string[] {
//     return Object.keys(countryToCurrency);
// }

export async function getCurrenciesList(): Promise<Currency[]>{
    const result = await AsyncStorage.getItem('currencies'); 
    if (!result) {
        console.log('No currencies found in AsyncStorage, returning default currencies with exchange rate 1.0');
        return getCurrencies().map(currency => ({ ...currency, exchangeRate: 1.0 }));
    }   
    const currencies:Currency[] = JSON.parse(result);   
    return currencies;
}

export async function addToShortList(country: string): Promise<void> {
    const currencyCode = countryToCurrency[country];
    if (!currencyCode) {
        throw new Error(`Currency for country ${country} not found`);
    }
    const currenciesList = await getCurrenciesList();
    const currency = currenciesList.find(curr => curr.code === currencyCode);
    if (!currency) {
        const symbol = currencyCodeToSymbol[currencyCode] || currencyCode;       
        const newCurrency: Currency = {
            code: currencyCode,
            symbol: symbol,           
            exchangeRate: 1.0 
        }
        try{
            const result = await AsyncStorage.getItem('exchangeRates');
            if (result) {
                const parsedRates = JSON.parse(result);
                newCurrency.exchangeRate = parsedRates[currencyCode];
                console.log(`Exchange rate for ${currencyCode} found: ${newCurrency.exchangeRate}`);
            }else {
                console.log(`No exchange rate found for ${currencyCode}, setting to 1.0`);
            }
        }catch (error) {
            console.error(`Error fetching exchange rates for ${currencyCode}:`, error);
        }
        const updatedCurrenciesList = [...currenciesList, newCurrency];
        await AsyncStorage.setItem('currencies', JSON.stringify(updatedCurrenciesList));
        console.log(`Currency ${currencyCode} added to short list`);
    }else {
        console.log(`Currency ${currencyCode} already exists in short list`);
    }   
}

export async function removeFromShortList(currenciesList: string[]): Promise<void> {
    const allCurrencies = await getCurrenciesList();
    const updatedCurrenciesList = allCurrencies.filter(currency => !currenciesList.includes(currency.code));
    try {
        await AsyncStorage.setItem('currencies', JSON.stringify(updatedCurrenciesList));
        console.log('Short list updated, removed currencies:', currenciesList);
    } catch (error) {
        console.error('Error updating short list:', error);
    }
}

export async function updateExchangeRates(currencies: slimCurrency[]): Promise<Currency[]> {

    console.log('Updating exchange rates for currencies:');
    try{
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        const rates = data.rates;        
        if (!rates) {
            throw new Error('No exchange rates found in the response');
        }
        await AsyncStorage.setItem('allAwailableCurrencies', JSON.stringify(data));
        console.log('Exchange rates fetched:', rates);
        await AsyncStorage.setItem('exchangeRates', JSON.stringify(rates));
        console.log('Exchange rates saved to AsyncStorage');        
        const updatedCurrencies: Currency[] = currencies.map(currency => {
            if (rates[currency.code]) {
                return { ...currency, exchangeRate: rates[currency.code] };
            }
            return { ...currency, exchangeRate: 1.0 };
        });

        return updatedCurrencies;
    }catch (error) {
        console.error('Error fetching exchange rates:', error);
        const currenciesWithRate: Currency[] = currencies.map(currency => ({
            ...currency,
            exchangeRate: 1.0
        }));
        return currenciesWithRate; 
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

const defaultCurrencies: slimCurrency[] = [
  { code: 'USD', symbol: '$' },
  { code: 'ILS', symbol: '₪' },
  { code: 'EUR', symbol: '€'},
  { code: 'GBP', symbol: '£' },
  { code: 'CHF', symbol: 'CHF' },
  { code: 'HUF', symbol: 'Ft' },
  { code: 'CZK', symbol: 'Kč' },
  { code: 'DKK', symbol: 'kr' }
];

// const countryToCurrency: {[key: string]: string} = {
//   'United States': 'USD',
//   'US': 'USD',
//   'USA': 'USD',
//   'Germany': 'EUR',
//   'France': 'EUR',
//   'Spain': 'EUR',
//   'Italy': 'EUR',
//   'Netherlands': 'EUR',
//   'Austria': 'EUR',
//   'Belgium': 'EUR',
//   'Finland': 'EUR',
//   'Ireland': 'EUR',
//   'Luxembourg': 'EUR',
//   'Portugal': 'EUR',
//   'Slovenia': 'EUR',
//   'Slovakia': 'EUR',
//   'Estonia': 'EUR',
//   'Latvia': 'EUR',
//   'Lithuania': 'EUR',
//   'Malta': 'EUR',
//   'Cyprus': 'EUR',
//   'Croatia': 'EUR',
//   'United Kingdom': 'GBP',
//   'UK': 'GBP',
//   'England': 'GBP',
//   'Scotland': 'GBP',
//   'Wales': 'GBP',
//   'Israel': 'ILS',
//   'Switzerland': 'CHF',
//   'Hungary': 'HUF',
//   'Czech Republic': 'CZK',
//   'Czechia': 'CZK',
//   'Denmark': 'DKK',
//   'Canada': 'CAD',
//   'Australia': 'AUD',
//   'Japan': 'JPY',
//   'China': 'CNY',
//   'India': 'INR',
//   'Brazil': 'BRL',
//   'Mexico': 'MXN',
//   'South Korea': 'KRW',
//   'Russia': 'RUB',
//   'Turkey': 'TRY',
//   'South Africa': 'ZAR',
//   'Norway': 'NOK',
//   'Sweden': 'SEK',
//   'Poland': 'PLN',
//   'Thailand': 'THB',
//   'Singapore': 'SGD',
//   'New Zealand': 'NZD',
//   'Hong Kong': 'HKD',
//   'Argentina': 'ARS',
//   'Chile': 'CLP',
//   'Colombia': 'COP',
//   'Peru': 'PEN',
//   'Egypt': 'EGP',
//   'Morocco': 'MAD',
//   'Kenya': 'KES',
//   'Nigeria': 'NGN',
//   'Ghana': 'GHS',
//   'Indonesia': 'IDR',
//   'Malaysia': 'MYR',
//   'Philippines': 'PHP',
//   'Vietnam': 'VND',
//   'Bangladesh': 'BDT',
//   'Pakistan': 'PKR',
//   'Sri Lanka': 'LKR',
//   'Nepal': 'NPR',
//   'Myanmar': 'MMK',
//   'Cambodia': 'KHR',
//   'Laos': 'LAK',
//   'Mongolia': 'MNT',
//   'Kazakhstan': 'KZT',
//   'Uzbekistan': 'UZS',
//   'Georgia': 'GEL',
//   'Armenia': 'AMD',
//   'Azerbaijan': 'AZN',
//   'Belarus': 'BYN',
//   'Ukraine': 'UAH',
//   'Moldova': 'MDL',
//   'Romania': 'RON',
//   'Bulgaria': 'BGN',
//   'Serbia': 'RSD',
//   'North Macedonia': 'MKD',
//   'Albania': 'ALL',
//   'Montenegro': 'EUR',
//   'Bosnia and Herzegovina': 'BAM',
//   'Iceland': 'ISK',
//   'Greenland': 'DKK',
//   'Faroe Islands': 'DKK',
// };

// const currencyCodeToSymbol: {[key: string]: string} = {
//   'USD': '$',
//   'EUR': '€',
//   'GBP': '£',
//   'JPY': '¥',
//   'CNY': '¥',
//   'ILS': '₪',
//   'CHF': 'CHF',
//   'CAD': 'C$',
//   'AUD': 'A$',
//   'NZD': 'NZ$',
//   'HKD': 'HK$',
//   'SGD': 'S$',
//   'SEK': 'kr',
//   'NOK': 'kr',
//   'DKK': 'kr',
//   'PLN': 'zł',
//   'CZK': 'Kč',
//   'HUF': 'Ft',
//   'RUB': '₽',
//   'INR': '₹',
//   'KRW': '₩',
//   'THB': '฿',
//   'MYR': 'RM',
//   'PHP': '₱',
//   'IDR': 'Rp',
//   'VND': '₫',
//   'BRL': 'R$',
//   'MXN': '$',
//   'ARS': '$',
//   'CLP': '$',
//   'COP': '$',
//   'PEN': 'S/',
//   'TRY': '₺',
//   'ZAR': 'R',
//   'EGP': '£',
//   'MAD': 'د.م.',
//   'KES': 'KSh',
//   'NGN': '₦',
//   'GHS': '₵',
//   'UAH': '₴',
//   'RON': 'lei',
//   'BGN': 'лв',
//   'HRK': 'kn',
//   'RSD': 'дин',
//   'MKD': 'ден',
//   'ALL': 'L',
//   'BAM': 'KM',
//   'ISK': 'kr',
//   'GEL': '₾',
//   'AMD': '֏',
//   'AZN': '₼',
//   'BYN': 'Br',
//   'MDL': 'L',
//   'KZT': '₸',
//   'UZS': 'soʻm',
//   'BDT': '৳',
//   'PKR': '₨',
//   'LKR': '₨',
//   'NPR': '₨',
//   'MMK': 'K',
//   'KHR': '៛',
//   'LAK': '₭',
//   'MNT': '₮'
// };



