import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const NotificationIcon = ({ style }: { style?: any }) => {
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={() => navigation.navigate('Notifications')} // navigate to Notifications screen
      activeOpacity={0.9} // NEW: Adjusted active opacity 
    >
      <IconButton
        icon="bell"
        size={24} // icon size remains unchanged
        onPress={undefined} // disable inner onPress
        pointerEvents="none"  // ensure the icon doesn't intercept touch events
        style={styles.icon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 40, // larger circular background
    width: 45,        // container size defines the button area
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',           // NEW: Shadow properties added
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    // ...existing styles such as shadow if needed...
  },
  icon: {
    // ...existing code...
  },
});

export default NotificationIcon;