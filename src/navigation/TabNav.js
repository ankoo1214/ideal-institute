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
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,

          // Stronger shadow for iOS:
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.3,
          shadowRadius: 10,

          // Stronger elevation for Android
          elevation: 12,
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
