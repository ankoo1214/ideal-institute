import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { sWidth, sHeight } from '../assets/utils';

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);

  const handleToggleDarkMode = () => setDarkMode(!darkMode);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => console.log('User logged out') },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity style={styles.option}>
        <Text style={styles.optionText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option}>
        <Text style={styles.optionText}>Notifications</Text>
      </TouchableOpacity>

      <View style={styles.optionRow}>
        <Text style={styles.optionText}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={handleToggleDarkMode} />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: sWidth * 0.05,
    backgroundColor: '#fdfdfd',
  },
  title: {
    fontSize: sHeight * 0.035,
    fontWeight: 'bold',
    marginBottom: sHeight * 0.04,
    color: '#222',
  },
  option: {
    paddingVertical: sHeight * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionText: {
    fontSize: sHeight * 0.025,
    color: '#333',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: sHeight * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  logoutButton: {
    marginTop: sHeight * 0.05,
    backgroundColor: '#ff4d4d',
    paddingVertical: sHeight * 0.02,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: sHeight * 0.025,
    fontWeight: 'bold',
  },
});
