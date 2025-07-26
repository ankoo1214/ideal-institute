import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StackNav from './src/navigation/StackNav';
import Splash from './src/screens/Splash';
import { Text, View, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <View style={styles.container}>
      <StackNav />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
