import * as Location from 'expo-location';
import { GeoLocation } from '../types/location';

export async function getCurrentLocation() {
  try {
    console.log('Requesting current location...');
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return null;
    }

    // 1. Try cached location first (faster)
    const lastKnown = await Location.getLastKnownPositionAsync({
      maxAge: 600000, // 10 minutes old is acceptable
    });

    if (lastKnown) {
      console.log('Using cached location');
      return {
        latitude: lastKnown.coords.latitude,
        longitude: lastKnown.coords.longitude,
        city: null,
        country: null
      };
    }

    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,    
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      city: null,
      country: null
    };

  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
}

export async function getCurrentLocationWithAddress(): Promise<GeoLocation | null> {
  try {
    console.log('Requesting current location with address...');
    const location = await getCurrentLocation();
    
    if (!location) return null;

    // Reverse geocoding to get address
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: location.latitude,
      longitude: location.longitude,
    });

    if (reverseGeocode.length > 0) {
      const address = reverseGeocode[0];
      return {
        ...location,
        city: address.city,
        country: address.country,        
      };
    }

    return location;
  } catch (error) {
    console.error('Error getting location with address:', error);
    return null;
  }
}