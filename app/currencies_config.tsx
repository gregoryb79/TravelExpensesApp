import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../styles/tokens';
import { styles } from '../styles/styles';
import { useEffect, useState } from 'react';
import { addToShortList, getCurrenciesList, removeFromShortList, slimCurrency } from '../utils/currencyUtils';
import { MainButton } from '../components/MainButton';
import { GeneralPicker } from '../components/GeneralPicker';
import { countryToCurrency } from '../data/currency.data';
import { getExpenses } from '../utils/expenseUtils';

export default function CurrenciesConfig() {
 
  const [currenciesList, setCurrenciesList] = useState<slimCurrency[]>([]);
  const [countriesList, setCountriesList] = useState<string[]>([]);
  const [country, setCountry] = useState<string>('');
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);



  useEffect(() => {

    async function fetchSettings() {
      
      try{
        const result = await getCurrenciesList();
        setCurrenciesList(result);        
      }catch (error) {
          console.error('Error fetching currencies list:', error);
      }                      
    }

    const sortedCountries = Object.keys(countryToCurrency).sort((a, b) => a.localeCompare(b));
    setCountriesList(sortedCountries);
    setCountry(sortedCountries[0]);
    fetchSettings();

  }, []);

  async function handleAddToShortList() {
    try{
      await addToShortList(country);
    } catch (error) {
      console.error('Error adding currency to short list:', error);
    }

    try{
      const result = await getCurrenciesList();
      setCurrenciesList(result);        
    }catch (error) {
        console.error('Error fetching currencies list:', error);
    }      
  }

  async function handleRemoveFromShortList() {
    if (selectedCurrencies.length === 0) {
      console.warn('No currencies selected for removal.');
      return;
    }
    const expenses = await getExpenses();
    if (expenses.length > 0 && expenses.some(expense => selectedCurrencies.includes(expense.currency))) {
      console.warn('Cannot remove currencies that are used in expenses.');
      alert('Cannot remove currencies that are used in expenses.');
      return;
    }
    try{
      await removeFromShortList(selectedCurrencies);
      setSelectedCurrencies([]); 
    }catch (error) {
      console.error('Error removing currency from short list:', error);
    }
    try{
      const result = await getCurrenciesList();
      setCurrenciesList(result);
    } catch (error) {
      console.error('Error fetching currencies list:', error);
    }
  }

  function handleCurrencySelect(currencyCode: string) {
    console.log('Selected currency:', currencyCode);
    setSelectedCurrencies(prevSelected => {
        if (prevSelected.includes(currencyCode)) {            
            return prevSelected.filter(code => code !== currencyCode);
        } else {           
            return [...prevSelected, currencyCode];
        }
    });    
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>  
      <View style={styles.newTripHeader}>
        <Text style={styles.h3}>Configure currencies</Text>
      </View>        
      
      <GeneralPicker 
          input={country} 
          inputArray={countriesList} 
          extraStyles={{width: '100%', backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.sm, padding: spacing.md}}
          onValueChange={setCountry} 
      /> 
      <MainButton
        label="Add To Short List" 
        onPress={handleAddToShortList}
      />        

      <View>
        <Text style={styles.h3}>Currencies Short List:</Text>
        <ScrollView style={styles.curenciesListContainer}>
            {currenciesList.map((currency) => (
              <TouchableOpacity key={currency.code} style={styles.listItem}
                onPress={() => handleCurrencySelect(currency.code)}
              >
                  <Text style={[styles.text_md, selectedCurrencies.includes(currency.code) && styles.selectedItem]}>{currency.code}</Text>                                           
                  <Text style={[styles.text_md, selectedCurrencies.includes(currency.code) && styles.selectedItem]}>{currency.symbol}</Text>                   
              </TouchableOpacity>
            ))}                          
        </ScrollView>

        <MainButton
          label="Remove From Short List" 
          onPress={handleRemoveFromShortList}
          disabled={selectedCurrencies.length === 0}
        />
      </View>  

      
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
// );
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
// });