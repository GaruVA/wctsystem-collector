import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import NotificationScreen from '../screens/NotificationScreen';
import { useAuth } from '../context/AuthContext';
import MainScreen from '../screens/MainScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  // Use token directly from auth context
  const { token } = useAuth();

  // Choose which navigation structure to show based on token
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        // Auth screen when no token
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        // App screens when token exists
        <>
          <Stack.Screen
            name="Main"
            component={MainScreen}
            options={{ headerShown: false }}
          />
          
          <Stack.Screen
            name="Notifications"
            component={NotificationScreen}
            options={{ headerShown: true, title: 'Notifications' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;