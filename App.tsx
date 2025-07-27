import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StackNav from './src/navigation/StackNav';
import Splash from './src/screens/Splash';
import { Text, View, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import store from './src/redux/store/store';
import { ThemeProvider } from './src/theme/ThemeContext';
const Stack = createNativeStackNavigator();

export default function App() {
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
