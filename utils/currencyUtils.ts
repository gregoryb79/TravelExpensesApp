import {Currency} from '../types/currency';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentLocationWithAddress } from './locationUtils';
import { countryToCurrency, currencyCodeToSymbol } from '../data/currency.data';
import { getCurrentTrip, saveCurrentTrip } from './tripUtils';
import { Trip } from '../types/trip';
import { tr } from 'date-fns/locale';



const baseCurrency = "ILS";
const localCurrency = "EUR";
export type slimCurrency = Omit<Currency, 'exchangeRate'>;
export function getCurrencies(): slimCurrency[] {
  return defaultCurrencies;
}

export async function getCurrenciesList(): Promise<Currency[]>{
    const result = await AsyncStorage.getItem('currencies'); 
    if (!result) {
        console.log('No currencies found in AsyncStorage, returning default currencies with exchange rate 1.0');
        return getCurrencies().map(currency => ({ ...currency, exchangeRate: 1.0 }));
    }   
    const currencies:Currency[] = JSON.parse(result);   
    return currencies;
}

export async function getLocalCurrencyfromLocation(trip: Trip): Promise<Trip> {
    const location = await getCurrentLocationWithAddress();
    if (!location || !location.country ) {
        console.log('No location found, returning trip as is');
        return trip;
    }
    if (location.ageMinutes > 60) {
        console.log('Location is too old, returning trip as is');
        return trip;
    }
    const country = location.country;
    const currencyCode = countryToCurrency[country];
    const symbol = currencyCodeToSymbol[currencyCode];
    if (!currencyCode || !symbol) {
        console.log(`No currency found for country ${country}, returning trip as is`);
        return trip;
    }
    const updatedLocalCurrency = {
        code: currencyCode,
        symbol: symbol,
    }
    trip.localCurrency = updatedLocalCurrency;
    const existingCurrency = trip.currenciesList.find(curr => curr.code === currencyCode);
    if (!existingCurrency) {
        trip.currenciesList.push(updatedLocalCurrency);
    }

    return trip;
}

export async function addToShortList(country: string): Promise<void> {
    const currencyCode = countryToCurrency[country];
    if (!currencyCode) {
        throw new Error(`Currency for country ${country} not found`);
    }
    const currTrip = await getCurrentTrip();
    if (!currTrip) {
        throw new Error('No current trip found');
    }
    const currenciesList = currTrip.currenciesList;
    const currency = currenciesList.find(curr => curr.code === currencyCode);
    if (!currency) {
        const symbol = currencyCodeToSymbol[currencyCode] || currencyCode;       
        const newCurrency: slimCurrency = {
            code: currencyCode,
            symbol: symbol,           
            // exchangeRate: 1.0 
        }
        // try{
        //     const result = await AsyncStorage.getItem('exchangeRates');
        //     if (result) {
        //         const parsedRates = JSON.parse(result);
        //         newCurrency.exchangeRate = parsedRates[currencyCode];
        //         console.log(`Exchange rate for ${currencyCode} found: ${newCurrency.exchangeRate}`);
        //     }else {
        //         console.log(`No exchange rate found for ${currencyCode}, setting to 1.0`);
        //     }
        // }catch (error) {
        //     console.error(`Error fetching exchange rates for ${currencyCode}:`, error);
        // }
        currTrip.currenciesList.push(newCurrency);
        await saveCurrentTrip(currTrip);
        console.log(`Currency ${currencyCode} added to current trip's currencies list`);        
    }else {
        console.log(`Currency ${currencyCode} already exists in short list`);
    }   
}

export async function removeFromShortList(currenciesToRemove: string[]): Promise<void> {
    const currTrip = await getCurrentTrip();
    if (!currTrip) {
        throw new Error('No current trip found');
    }
    currTrip.currenciesList = currTrip.currenciesList.filter(currency => !currenciesToRemove.includes(currency.code));
    try {
        await saveCurrentTrip(currTrip);
        console.log(`Current trip's currencies list updated, removed currencies:`, currenciesToRemove);
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




