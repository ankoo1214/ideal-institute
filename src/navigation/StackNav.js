// App.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Dashboard';
import Splash from '../screens/Splash';
import TabNav from './TabNav';
// import DetailsScreen from './screens/DetailsScreen';

const Stack = createNativeStackNavigator();

export default function StackNav() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          options={{ headerShown: false }}
          name="Splash"
          component={Splash}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="MainTabs"
          component={TabNav}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
