import {Currency} from '../types/currency';

const basicCurrencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1.0 },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', exchangeRate: 1.0 },
  { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 1.0 },
  { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 1.0 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', exchangeRate: 1.0 },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', exchangeRate: 1.0 },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', exchangeRate: 1.0 },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', exchangeRate: 1.0 }
];

export function getBasicCurrencies(): Currency[] {
  return basicCurrencies;
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
    const currenciesArray = getBasicCurrencies();
    console.log('Basic Currencies:', currenciesArray);
    const updatedExchangeRates = await updateExchangeRates(currenciesArray);
    console.log('Updated Exchange Rates:', updatedExchangeRates);
    
}



