import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper'; // Import PaperProvider
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Define custom theme for React Native Paper (optional)
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3B82F6', // Blue color from your UI
    accent: '#10B981',  // Green color from your UI
  },
};

export default function App() {
  console.log('App: Main application rendering');
  
  useEffect(() => {
    console.log('App: Initial useEffect running');
    // Log device info
    console.log('App: Environment info', {
      platform: Platform.OS,
      version: Platform.Version,
      isExpo: Constants.expoVersion !== null
    });
    
    return () => {
      console.log('App: Cleaning up main component');
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          {/* Add PaperProvider here, wrapping the NavigationContainer */}
          <PaperProvider theme={theme}>
            <NavigationContainer
              onStateChange={(state) => {
                console.log('App: Navigation state changed', {
                  currentRoute: state?.routes[state.index]?.name
                });
              }}
            >
              <StatusBar style="auto" />
              <AppNavigator />
            </NavigationContainer>
          </PaperProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
