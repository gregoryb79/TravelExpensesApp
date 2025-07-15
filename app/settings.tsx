import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../styles/tokens';
import { styles } from '../styles/styles';
import { useCallback, useEffect, useState } from 'react';
import { Trip } from '../types/trip';
import { getCurrentTrip, getTrips, saveTrip, getNewTrip, removeFromTrips, saveCurrentTrip, backupAllTripsToFile, importAllTripsFromBackup } from '../utils/tripUtils';
import { Link, router, useFocusEffect } from 'expo-router';
import { getCurrenciesList, slimCurrency } from '../utils/currencyUtils';
import { MainButton } from '../components/MainButton';
import { CurrencyPicker } from '../components/CurrencyPicker';
import SettingsButton from '../components/SettingsButton';
import { se } from 'date-fns/locale';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function SettingsScreen() {

  const [currTrip, setCurrTrip] = useState<Trip>();
  const [listOfTrips, setListOfTrips] = useState<Trip[]>([]);

  const [tripName, setTripName] = useState<string>('');
  const [localCurrency, setLocalCurrency] = useState<slimCurrency>();
  const [baseCurrency, setBaseCurrency] = useState<slimCurrency>();
  const [currenciesList, setCurrenciesList] = useState<slimCurrency[]>([]);  
  const [newTrip, setNewTrip] = useState<boolean>(false);
  
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
          console.log('Currencies list:', result.currenciesList.length);
          setCurrenciesList(result.currenciesList);
        }else {
          console.log('No current trip found');
          const result = await getCurrenciesList();
          setNewTrip(true);
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
        router.push('/'); 
    } catch (error) {   
        console.error('Error saving trip:', error);
        alert('Error saving trip. Please try again.');
    }        
    // try {
    //   const result = await getTrips();
    //   if (result) {
    //     setListOfTrips(result);
    //     console.log('List of trips length:', result.length);
    //   }
    // } catch (error) {
    //   console.error('Error fetching list of trips:', error);
    // }    
  }

  function handleNewTrip() {
    const newTrip = getNewTrip();
    setNewTrip(true);
    setTripName(newTrip.name);
    setLocalCurrency(newTrip.currenciesList[0]);
    setBaseCurrency(newTrip.currenciesList[0]);
    setCurrenciesList(newTrip.currenciesList);    
    setCurrTrip(newTrip);
  }

  const [selectedTrips, setSelectedTrips] = useState<string[]>([]);
  function handleTripSelect(tripId: string) {
    console.log('Selected trip:', tripId);
    setSelectedTrips(prevSelected => {
        if (prevSelected.includes(tripId)) {            
            return prevSelected.filter(code => code !== tripId);
        } else {           
            return [...prevSelected, tripId];
        }
    });    
  }

  async function handleRemoveFromTrips() {
      if (selectedTrips.length === 0) {
        console.warn('No trips selected for removal.');
        return;
      }
      
      try {
        await removeFromTrips(selectedTrips);
        if (currTrip && selectedTrips.includes(currTrip.id)) {
          handleNewTrip()
        }
      } catch (error) {
        console.error('Error removing expenses:', error); 
        return;
      }
      try{
        const result = await getTrips();
        setListOfTrips(result); 
        if (result.length == 0) {        
          console.log('No trips left found');
          const result = await getCurrenciesList();
          setCurrenciesList(result);        
          setLocalCurrency(result[0]);
          setBaseCurrency(result[0]);
          setCurrTrip(undefined);
          setTripName('');
          setNewTrip(true);
        }
        
        setSelectedTrips([]); // Clear selection after removal
      }catch (error) {
          console.error('Error fetching trips list:', error);
      }
      // await debugAsyncStorage();
  }

  async function switchTrip() {
    if (selectedTrips.length !== 1) {
      console.warn('Please select exactly one trip to switch to.');
      return;
    }
    
    const selectedTripId = selectedTrips[0];
    const selectedTrip = listOfTrips.find(trip => trip.id === selectedTripId);
    
    if (selectedTrip) {
      await saveCurrentTrip(selectedTrip);
      setCurrTrip(selectedTrip);
      setTripName(selectedTrip.name);
      setLocalCurrency(selectedTrip.localCurrency);
      setBaseCurrency(selectedTrip.baseCurrency);
      setCurrenciesList(selectedTrip.currenciesList);

      setSelectedTrips([]);
      router.push('/'); 
    } else {
      console.error('Selected trip not found');
    }
  }

  async function handleImportFromBackUp() {
    try {
      await importAllTripsFromBackup();

    } catch (error) {
      console.error('Error importing trips from backup:', error);
      alert('Error importing trips from backup. Please try again.');
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
                  currenciesList={currenciesList} 
                  extraStyles={{width: typography.md*7}}
                  onValueChange={setBaseCurrency} 
              />            
            </View>
            <SettingsButton onPress={() => {router.push('/currencies_config')}}/>
            <View style={styles.currencyContainter}>
              <Text style={styles.text_md}>Travel Currency:</Text>
              <CurrencyPicker 
                  currency={localCurrency} 
                  currenciesList={currenciesList} 
                  extraStyles={{width: typography.md*7}}
                  onValueChange={setLocalCurrency} 
              />           
            </View>            
          </View>
                
          <View style={styles.buttonContainer}>
            <MainButton label={!newTrip ? "Update Trip" : "Create Trip"} onPress={handleTripSubmit} extraStyles={{minWidth: '60%'}}/>          
          </View>
      </View>      

      <View style={styles.recentTripsContainter}>
        <View style={styles.expensesHeader}>
          <Text style={[styles.h3, styles.padding_bottom_10]}>All Trips</Text>
          <View style={styles.expensesHeader}>  
            <TouchableOpacity onPress={backupAllTripsToFile}>
              <Icon name="backup" size={30} color={colors.primaryBlue}/>                    
            </TouchableOpacity>
            <TouchableOpacity onPress={handleImportFromBackUp}>
              <Icon name="download" size={30} color={colors.primaryBlue}/>                    
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView>
            {(listOfTrips.length > 0) && listOfTrips.map((trip) => (
              <TouchableOpacity key={trip.id} style={styles.expenseListItem}
                onPress={() => handleTripSelect(trip.id)}> 
                <View  style={styles.listItem}>
                  <Text style={[styles.text_md, selectedTrips.includes(trip.id) && styles.selectedItem]}>{trip.name}</Text>
                  <Text style={[styles.text_md, selectedTrips.includes(trip.id) && styles.selectedItem]}>{new Date(trip.created_at).toLocaleDateString()}</Text>                           
                </View>
              </TouchableOpacity>
              
            ))}   
            {(listOfTrips.length === 0) && <Text style={styles.h3}>No trips available. Create a new trip.</Text>}             
        </ScrollView>
        <View style={styles.buttonContainer}>
          <MainButton
            label="New Trip" 
            onPress={handleNewTrip}
            disabled={listOfTrips.length === 0} // Disable if any trips are selected            
          />
          <MainButton
            label="Select" 
            onPress={switchTrip} 
            disabled={selectedTrips.length != 1}           
          />
          <MainButton
            label="Delete" 
            onPress={handleRemoveFromTrips}      
            disabled={selectedTrips.length === 0}      
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