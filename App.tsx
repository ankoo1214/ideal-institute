import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StackNav from './src/navigation/StackNav';
import Splash from './src/screens/Splash';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { Provider } from 'react-redux';
import store from './src/redux/store/store';
import { ThemeProvider } from './src/theme/ThemeContext';
import NotificationService from './src/services/NotificationService';
import {
  checkPermission,
  getPermission,
} from 'react-native-schedule-exact-alarm-permission';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    const handlePermission = async () => {
      if (Platform.OS === 'android' && Platform.Version >= 31) {
        try {
          const hasPermission = await checkPermission();
          console.log('Exact alarm permission status:', hasPermission);
          if (hasPermission) {
            NotificationService.scheduleDailyGreetings();
          } else {
            // Open system settings for user to grant permission
            getPermission();
            console.log('Directed user to grant exact alarm permission');
            // Optionally, listen for app resume to re-check, but for now, proceed or handle as needed
          }
        } catch (err) {
          console.warn('Permission check failed:', err);
          // Fallback: Proceed without exact alarms if possible
          NotificationService.scheduleDailyGreetings();
        }
      } else {
        // For older Android or iOS, proceed
        NotificationService.scheduleDailyGreetings();
      }
    };

    handlePermission();
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <View style={styles.container}>
          <StackNav />
        </View>
      </ThemeProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
