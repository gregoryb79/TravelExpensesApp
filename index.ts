import { registerRootComponent } from 'expo';
import {setupData } from './utils/currencyUtils';

import App from './App';

async function initializeApp() {
  await setupData();
}
initializeApp().catch(error => {
  console.error('Error during app initialization:', error);
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately

registerRootComponent(App);
