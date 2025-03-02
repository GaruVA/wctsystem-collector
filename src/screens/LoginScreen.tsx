import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Button } from 'react-native-paper';

const LoginScreen = () => {
  console.log('LoginScreen: Component rendering');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, token, loading, error } = useAuth(); // Use signIn instead of login
  const navigation = useNavigation<any>();

  useEffect(() => {
    console.log('LoginScreen: Token changed', !!token);
    if (token) {
      navigation.replace('Main'); // Navigate to Main screen, not Home
    }
  }, [token, navigation]);

  useEffect(() => {
    console.log('LoginScreen: Error state changed', error);
    if (error) {
      Alert.alert('Login Failed', error);
    }
  }, [error]);

  const handleLogin = async () => {
    console.log('LoginScreen: Login button pressed');
    if (!username || !password) {
      console.log('LoginScreen: Missing username or password');
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    try {
      console.log('LoginScreen: Attempting login');
      setIsSubmitting(true);
      await signIn(username, password); // Use signIn directly with username and password
      console.log('LoginScreen: Login successful');
      // No need to navigate here, the useEffect will handle it when token changes
    } catch (e) {
      console.error('LoginScreen: Login failed', e);
      // Error is handled by useAuth effect
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Login</Text>
      
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
      />
      
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        style={styles.button}
      >
        Login
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
    paddingVertical: 5,
  },
});

export default LoginScreen;