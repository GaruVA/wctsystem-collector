import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import NotificationScreen from '../screens/NotificationScreen';
import { useAuth } from '../context/AuthContext';
import MainScreen from '../screens/MainScreen';
import RouteCompletionScreen from '../screens/RouteCompletionScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { token } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainScreen}
            options={{ headerShown: false }}
          />
          
          <Stack.Screen
            name="Notification"
            component={NotificationScreen}
            options={{ headerShown: true, title: 'Notifications' }}
          />
          
          <Stack.Screen
            name="RouteCompletion"
            component={RouteCompletionScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;