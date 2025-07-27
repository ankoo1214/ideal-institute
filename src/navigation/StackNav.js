import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Dashboard';
import Splash from '../screens/Splash';
import TabNav from './TabNav';
import StudentList from '../screens/StudentList';
import EditStudent from '../screens/EditStudent';
import { useTheme } from '../theme/ThemeContext'; // Adjust import path accordingly
import { NavigationContainer } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

export default function StackNav() {
  const { colors } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.card, // Header background adapts to theme
          },
          headerTintColor: colors.text, // Header back button and title color
          headerTitleStyle: {
            color: colors.text, // Header title color
            fontWeight: 'bold',
          },
        }}
      >
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
        <Stack.Screen
          name="EditStudent"
          component={EditStudent}
          options={{ title: 'Edit Student' }}
        />
        <Stack.Screen
          name="StudentList"
          component={StudentList}
          options={{ title: 'Students' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
