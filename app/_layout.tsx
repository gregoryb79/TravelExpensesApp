import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { setupData } from '../utils/currencyUtils';
import { ActivityIndicator, View, Text } from 'react-native';
import SettingsButton from '../components/SettingsButton';

export default function RootLayout() {
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function initializeApp (){
            setLoading(true);
            try {
                await setupData();
            } catch (error) {
                console.error('Error during app initialization:', error);
            } finally {
                setLoading(false);
            }
        };
        
        initializeApp();
    }, []);

    if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Initializing app...</Text>        
      </View>
    );
  }

    return (
        <Stack>
        <Stack.Screen name="index" options={{ title: 'Travel Expenses', headerRight: () => <SettingsButton />}} />
        <Stack.Screen name="expenses" options={{ title: 'Expenses', headerRight: () => <SettingsButton /> }} />
        <Stack.Screen name="add-expense" options={{ title: 'Add Expense', headerRight: () => <SettingsButton /> }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        </Stack>
    );
}
