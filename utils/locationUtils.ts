import * as Location from 'expo-location';
import { GeoLocation } from '../types/location';

export type latestLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  ageMinutes: number; 
  city: string;
  country: string;
};

export async function getLastKnownLocation() {
  try {
    console.log('Requesting current location...');
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return null;
    }
   
    const lastKnown = await Location.getLastKnownPositionAsync();
    if (lastKnown){
      const ageMs = Date.now() - (lastKnown?.timestamp || 0);
      console.log(`Last known location is ${lastKnown?.coords.latitude}, ${lastKnown?.coords.longitude} age: ${ageMs / (60*1000)} minutes old`);    
      return {
        latitude: lastKnown.coords.latitude,
        longitude: lastKnown.coords.longitude,
        accuracy: lastKnown.coords.accuracy,
        ageMinutes: ageMs / (60 * 1000),
        timestamp: lastKnown.timestamp,        
      };     
    }else {
      console.log('No last known location available');
      return null;
    }
  } catch (error) {
    console.error('Error getting last known location:', error);
    return null;
  }

}

export async function getCurrentLocationWithAddress(): Promise<latestLocation | null> {
  try {
    console.log('Requesting current location with address...');
    const location = await getLastKnownLocation();
    
    if (!location) return null;

    // Reverse geocoding to get address
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: location.latitude,
      longitude: location.longitude,
    });

    if (reverseGeocode.length > 0) {
      const address = reverseGeocode[0];
      console.log('Reverse geocoding result:', address.country, address.city, location.ageMinutes);
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy || 10000,
        timestamp: location.timestamp,
        ageMinutes: location.ageMinutes,
        city: address.city || "",
        country: address.country || "",
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting location with address:', error);
    return null;
  }
}