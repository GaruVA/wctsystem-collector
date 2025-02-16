import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';

const NotificationIcon = () => {
  return (
    <TouchableOpacity style={{ position: 'absolute', right: 20, top: 40, zIndex: 1000 }}>
      <Image source={require('../assets/notification-icon.png')} style={{ width: 30, height: 30 }} />
    </TouchableOpacity>
  );
};

export default NotificationIcon;