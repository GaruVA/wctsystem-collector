import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const NotificationIcon = ({ style }: { style?: any }) => {
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={() => navigation.navigate('Notification')}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name="notifications" size={24} color="#3B82F6" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default NotificationIcon;