import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';

const NotificationIcon = () => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <IconButton icon="bell" onPress={() => {}} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 20,
    top: 40,
    zIndex: 1000,
    alignItems: 'center'
  },
  container: {
    backgroundColor: 'white', // white background for the circle
    borderRadius: 25,         // make it circular assuming width/height ~50
  }
});

export default NotificationIcon;