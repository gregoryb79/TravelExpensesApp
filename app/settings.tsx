import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../styles/tokens';
import { styles } from '../styles/styles';
import { useEffect, useState } from 'react';
import { Trip } from '../types/trip';
import { getCurrentTrip, getTrips, saveTrip } from '../utils/tripUtils';
import { Link } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Currency } from '../types/currency';
import { set } from 'date-fns';
import { getCurrenciesList } from '../utils/currencyUtils';
import { se } from 'date-fns/locale';

export default function SettingsScreen() {

  const [currTrip, setCurrTrip] = useState<Trip>();
  const [listOfTrips, setListOfTrips] = useState<Trip[]>([]);

  const [tripName, setTripName] = useState<string>('');
  const [currency, setCurrency] = useState<Currency>();
  const [currenciesList, setCurrenciesList] = useState<Currency[]>([]);

  useEffect(() => {

    async function fetchSettings() {
      try {
        const result = await getCurrentTrip();
        if (result) {
          setCurrTrip(result);
          console.log('Current trip:', result);
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
       try{
          const result = await getCurrenciesList();
          setCurrenciesList(result);
          setCurrency(result[0]);
        }catch (error) {
            console.error('Error fetching currencies list:', error);
        }
    }


    fetchSettings();

  }, []);

  async function handleTripSubmit() {
    if (!tripName || !currency) {
        console.error('Please fill in all fields');
        alert('Please fill in all fields');
        return;
    }
  
    try {
        await saveTrip( tripName, currency);
        setTripName(''); 
        setCurrency(undefined);             
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
    
    setTripName(''); 
    setCurrency(currenciesList[0]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>  
      <View>
        <Text style={styles.h3}>{`Current trip: ${currTrip ? currTrip?.name : "No trip selected, create new or select saved."}`}</Text>
        {/* {!currTrip && <Text style={styles.h3}>No trip selected, create new or select saved.</Text>}             */}
      </View>
      <View style={styles.newTripForm}>
        <Text>Trip Name</Text>
          <TextInput            
              style={styles.descriptionInput}
              value={tripName}
              onChangeText={setTripName}
              placeholder="Enter Trip Name"
              placeholderTextColor={colors.textSecondary}
          />
          <Text>Base Currency</Text>
          <Picker
              style={styles.currencyPicker}                    
              selectedValue={currency}
              mode="dropdown"
              onValueChange={setCurrency}>
                  {currenciesList.map((cat) => (
                      <Picker.Item key={cat.code} label={cat.symbol} value={cat} style={styles.text_md}/>
                  ))}
          </Picker>
          <TouchableOpacity style={styles.primaryButton} onPress={handleTripSubmit}>
              <Text style={styles.primaryButtonText}>Create Trip</Text>
          </TouchableOpacity>
      </View>

      <View style={styles.recentExpencesContainter}>
        <Text style={[styles.h3, styles.padding_bottom_10]}>Available Trips</Text>
        <ScrollView>
            {(listOfTrips.length > 0) && listOfTrips.map((trip) => (
              <View key={trip.id} style={styles.listItem}>
                  <Text style={styles.text_md}>{trip.name}</Text>
                  <Text style={styles.text_md}>{new Date(trip.created_at).toLocaleDateString()}</Text>                           
              </View>
            ))}   
            {(listOfTrips.length === 0) && <Text style={styles.h3}>No trips available. Create a new trip.</Text>}             
        </ScrollView>
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