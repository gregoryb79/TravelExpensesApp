import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { getBasicCurrencies, updateExchangeRates } from './utils/currencyUtils';
import { Currency } from './types/currency';
import { useEffect, useState } from 'react';



export default function App() {

  return (
    <View style={styles.container}>
      <Text>Travel Expences</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
