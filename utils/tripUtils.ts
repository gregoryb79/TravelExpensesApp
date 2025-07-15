import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '../types/trip';
import { Currency } from '../types/currency';
import uuid from 'react-native-uuid';
import { getCurrencies, slimCurrency } from './currencyUtils';
import { Expense } from '../types/expense';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

export async function getCurrentTrip() : Promise<Trip | null> {
  try {
    console.log('Fetching current trip...');    
    
    const currentTrip  = await AsyncStorage.getItem('currentTrip');
    if (!currentTrip) {
        console.log('No current trip found in AsyncStorage');
        return null;
    } 
    
    return JSON.parse(currentTrip) as Trip;
  } catch (error) {
    console.error('Error fetching current trip:', error);
    return null;
  } 
}

export function getNewTrip(): Trip {
  const currenciesList = getCurrencies();
  return {
    id: uuid.v4() as string,
    name: '',
    baseCurrency: currenciesList[0],
    localCurrency: currenciesList[0],
    currenciesList: currenciesList,
    expenses: [] as Expense[],
    created_at: new Date().toISOString()
  };
}

export async function removeFromTrips(tripsList: string[]): Promise<void> {
    
    try {
        const allTrips = await getTrips();
        const updatedTrips = allTrips.filter(trip => !tripsList.includes(trip.id));
        await AsyncStorage.setItem('allTrips', JSON.stringify(updatedTrips));
        console.log('Trips updated successfully');
        if (updatedTrips.length == 0) {         
            await AsyncStorage.removeItem('currentTrip');
            console.log('No trips left, current trip removed');
        }        
    } catch (error) {
        console.error('Error updating expenses:', error);
    }
}

export async function saveCurrentTrip(currentTrip : Trip): Promise<void> {
    
    const allTrips = await getTrips();   
    if (!currentTrip) {
        console.log('No current trip to save');
        return;
    }
    const index = allTrips.findIndex(trip => trip.id === currentTrip.id);
    if (index !== -1) {
        allTrips[index] = currentTrip;
    } else {
        allTrips.push(currentTrip);
    }
    try {
        await AsyncStorage.setItem('allTrips', JSON.stringify(allTrips));
        await AsyncStorage.setItem('currentTrip', JSON.stringify(currentTrip));
        console.log('Current trip saved successfully');
    } catch (error) {
        console.error('Error saving current trip:', error);
    }
}


export async function getCurrentTripName() : Promise<string> {
  try {
    console.log('Fetching current trip...');    
    
    const currentTrip  = await AsyncStorage.getItem('currentTrip');
    if (!currentTrip) {
        console.log('No current trip found in AsyncStorage');
        return '';
    } 
    
    return (JSON.parse(currentTrip) as Trip).name;
  } catch (error) {
    console.error('Error fetching current trip:', error);
    return '';
  } 
}

export async function getTrips() : Promise<Trip[]> {
  try {
    console.log('Fetching all saved trips...');    
    
    const allTrips  = await AsyncStorage.getItem('allTrips');
    if (!allTrips) {
        console.log('No current trip found in AsyncStorage');
        return [];
    } 
    
    return JSON.parse(allTrips) as Trip[];
  } catch (error) {
    console.error('Error fetching current trip:', error);
    return [];
  } 
}

export async function saveTrip(tripId: string, tripName: string, baseCurrency: slimCurrency, localCurrency: slimCurrency, currenciesList: slimCurrency[]): Promise<void> {
    try {     

        const allTrips = await getTrips();
        const currentTrip = await getCurrentTrip();

        if (tripId) {            
            const index = allTrips.findIndex(trip => trip.id === tripId);
            if (index !== -1) {
                allTrips[index].name = tripName;
                allTrips[index].baseCurrency = baseCurrency;
                allTrips[index].localCurrency = localCurrency;
                allTrips[index].currenciesList = currenciesList;
                allTrips[index].expenses = currentTrip?.expenses || [];
                await AsyncStorage.setItem('allTrips', JSON.stringify(allTrips));                
                await saveCurrentTrip(allTrips[index]);
                console.log(`Trip updated: ${tripName}, ID: ${tripId}`);
                return;
            }
         } 
           
        const newTrip: Trip = {
            id: uuid.v4() as string,
            name: tripName,
            baseCurrency,
            localCurrency,
            currenciesList,
            expenses: [],
            created_at: new Date().toISOString()
        };
        allTrips.push(newTrip);                       
        await AsyncStorage.setItem('allTrips', JSON.stringify(allTrips));

        // Set the current trip
        await saveCurrentTrip(newTrip);
        console.log('New trip saved:', newTrip);

    } catch (error) {
        console.error('Error saving trip:', error);
    }
}

export async function backupAllTripsToFile() {
  try {
    const allTripsString = await AsyncStorage.getItem('allTrips');
    if (!allTripsString) {
      alert('No trips to backup.');
      return;
    }
    const fileUri = FileSystem.documentDirectory + 'allTripsBackup.json';
    await FileSystem.writeAsStringAsync(fileUri, allTripsString, { encoding: FileSystem.EncodingType.UTF8 });

    // Open the share dialog (user can pick Google Drive, email, etc.)
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'Backup allTrips to...',
      UTI: 'public.json'
    });
  } catch (error) {
    console.error('Backup failed:', error);
    alert('Backup failed: ' + error);
  }
}

export async function importAllTripsFromBackup() {
  try {
    // Let user pick the backup file
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || !result.assets[0]?.uri) {
      alert('No file selected');
      return;
    }

    // Read file contents
    const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: FileSystem.EncodingType.UTF8 });

    // Parse and validate JSON
    let trips;
    try {
      trips = JSON.parse(fileContent);
      if (!Array.isArray(trips)) throw new Error('Invalid backup format');
    } catch (e) {
      alert('Invalid backup file');
      return;
    }

    const localTrips = await getTrips();
    const newTrips = trips.filter((importedTrip) => !localTrips.some(localTrip => localTrip.id === importedTrip.id));
    
    const mergedTrips = [...localTrips, ...newTrips];
    await AsyncStorage.setItem('allTrips', JSON.stringify(mergedTrips));
    alert('Trips imported successfully!');
  } catch (error) {
    console.error('Import failed:', error);
    alert('Import failed: ' + error);
  }
}



