import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Dashboard from '../screens/Dashboard';
import Students from '../screens/AddStudents';
import Analytics from '../screens/Analytics';
import Settings from '../screens/Settings';
import { useTheme } from '../theme/ThemeContext'; // your custom hook, adjust path

const Tab = createBottomTabNavigator();

export default function TabNav() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Add Student':
              iconName = focused ? 'person-add' : 'person-add-outline';
              break;
            case 'Analytics':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.accent, // use accent color for active icons/labels
        tabBarInactiveTintColor: colors.placeholder, // use placeholder color for inactive icons/labels
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
          backgroundColor: colors.card, // background color of tab bar adapts to theme
          borderTopColor: colors.border, // border color adapting to theme
          borderTopWidth: 1,
          elevation: 8, // shadow for Android
          shadowColor: '#000', // shadow for iOS
          shadowOpacity: 0.1,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Add Student" component={Students} />
      <Tab.Screen name="Analytics" component={Analytics} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}
