import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../styles/tokens';
import { styles } from '../styles/styles';
import { useCallback, useEffect, useState } from 'react';
import { Trip } from '../types/trip';
import { getCurrentTrip, getTrips, saveTrip } from '../utils/tripUtils';
import { Link, router, useFocusEffect } from 'expo-router';
import { getCurrenciesList, slimCurrency } from '../utils/currencyUtils';
import { MainButton } from '../components/MainButton';
import { CurrencyPicker } from '../components/CurrencyPicker';
import SettingsButton from '../components/SettingsButton';

export default function SettingsScreen() {

  const [currTrip, setCurrTrip] = useState<Trip>();
  const [listOfTrips, setListOfTrips] = useState<Trip[]>([]);

  const [tripName, setTripName] = useState<string>('');
  const [localCurrency, setLocalCurrency] = useState<slimCurrency>();
  const [baseCurrency, setBaseCurrency] = useState<slimCurrency>();
  const [currenciesList, setCurrenciesList] = useState<slimCurrency[]>([]);  

  
  useFocusEffect(useCallback(() => {

    async function fetchSettings() {
      try {
        const result = await getCurrentTrip();
        if (result) {
          setCurrTrip(result);
          setTripName(result.name);
          console.log('Current trip:', result.name);
          setLocalCurrency(result.localCurrency);
          console.log('Local currency:', result.localCurrency);
          setBaseCurrency(result.baseCurrency);
          console.log('Base currency:', result.baseCurrency);
        }else {
          console.log('No current trip found');
          const result = await getCurrenciesList();
          setCurrenciesList(result);        
          setLocalCurrency(result[0]);
          setBaseCurrency(result[0]);
        }
      } catch (error) {
        console.error('Error fetching current trip:', error);
      }
      try {
        const result = await getTrips();
        if (result) {
          setListOfTrips(result);
          console.log('List of trips length:', result.length);
        }
      } catch (error) {
        console.error('Error fetching list of trips:', error);
      }      
    }

    fetchSettings();

  }, []));

  async function handleTripSubmit() {
    if (!tripName || !localCurrency || !baseCurrency) {
        console.error('Please fill in all fields');
        alert('Please fill in all fields');
        return;
    }
  
    try {
        await saveTrip( currTrip?.id || '', tripName, baseCurrency, localCurrency, currenciesList);        
    } catch (error) {   
        console.error('Error saving trip:', error);
        alert('Error saving trip. Please try again.');
    }        
    try {
      const result = await getTrips();
      if (result) {
        setListOfTrips(result);
        console.log('List of trips length:', result.length);
      }
    } catch (error) {
      console.error('Error fetching list of trips:', error);
    }    
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}> 
      
      <View style={styles.newTripForm}>
        <Text style={styles.h3}>Current trip:</Text>
          <TextInput            
              style={[styles.descriptionInput, styles.h3 ]}
              value={tripName}
              onChangeText={setTripName}
              placeholder="Enter Trip Name"
              placeholderTextColor={colors.textSecondary}
          />
          <View style={styles.currenciesContainter}>
            <View style={styles.currencyContainter}>
              <Text style={styles.text_md}>Home Currency:</Text>
              <CurrencyPicker 
                  currency={baseCurrency} 
                  currenciesList={currTrip?.currenciesList||[]} 
                  extraStyles={{width: typography.md*7}}
                  onValueChange={setBaseCurrency} 
              />            
            </View>
            <SettingsButton onPress={() => {router.push('/currencies_config')}}/>
            <View style={styles.currencyContainter}>
              <Text style={styles.text_md}>Travel Currency:</Text>
              <CurrencyPicker 
                  currency={localCurrency} 
                  currenciesList={currTrip?.currenciesList||[]} 
                  extraStyles={{width: typography.md*7}}
                  onValueChange={setLocalCurrency} 
              />           
            </View>            
          </View>
                
          <View style={styles.buttonContainer}>
            <MainButton label="Update Trip" onPress={handleTripSubmit} extraStyles={{minWidth: '60%'}}/>          
          </View>
      </View>      

      <View style={styles.recentTripsContainter}>
        <Text style={[styles.h3, styles.padding_bottom_10]}>All Trips</Text>
        <ScrollView>
            {(listOfTrips.length > 0) && listOfTrips.map((trip) => (
              <View key={trip.id} style={styles.listItem}>
                  <Text style={styles.text_md}>{trip.name}</Text>
                  <Text style={styles.text_md}>{new Date(trip.created_at).toLocaleDateString()}</Text>                           
              </View>
            ))}   
            {(listOfTrips.length === 0) && <Text style={styles.h3}>No trips available. Create a new trip.</Text>}             
        </ScrollView>
        <View style={styles.buttonContainer}>
          <MainButton
            label="New Trip" 
            onPress={() => {}}            
          />
          <MainButton
            label="Delete Selected" 
            onPress={() => {}}            
          />
        </View>
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