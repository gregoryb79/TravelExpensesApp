import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '../types/trip';
import { Currency } from '../types/currency';
import uuid from 'react-native-uuid';
import { slimCurrency } from './currencyUtils';

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

export async function saveTrip(tripName: string, currency: slimCurrency, localCurrencies: slimCurrency[]): Promise<void> {
    try {
        const newTrip: Trip = {
            id: uuid.v4() as string,
            name: tripName,
            baseCurrency: currency,
            localCurrencies: localCurrencies,
            expenses: [],
            created_at: new Date().toISOString()
        };

        // Save the new trip to AsyncStorage
        const allTrips = await getTrips();
        allTrips.push(newTrip);
        await AsyncStorage.setItem('allTrips', JSON.stringify(allTrips));

        // Set the current trip
        await AsyncStorage.setItem('currentTrip', JSON.stringify(newTrip));

        console.log('New trip saved:', newTrip);
    } catch (error) {
        console.error('Error saving trip:', error);
    }
}