/**
 * What's the Plan
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { AppStateProvider } from './src/state/AppStateContext';
import { RootNavigator } from './src/navigator/RootNavigator';
import { colors } from './src/theme/theme';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <AuthProvider>
        <AppStateProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AppStateProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
