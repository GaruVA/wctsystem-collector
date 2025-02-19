import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const NotificationScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text>Your notifications will appear here</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default NotificationScreen;
