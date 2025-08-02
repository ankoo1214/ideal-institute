import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';
import { sWidth, sHeight } from '../assets/utils';

// Responsive logo size
const LOGO_SIZE = sHeight * 0.047;
const CARD_WIDTH = sWidth / 2 - sWidth * 0.08;

// Example local image for your real logo:
// const logo = require('../assets/logo.png'); // Uncomment if you have one

const features = [
  {
    id: '1',
    title: 'Students',
    icon: 'account-group-outline',
    screen: 'StudentList',
  },
  { id: '2', title: 'Teachers', icon: 'teach', screen: 'Teachers' },
  { id: '3', title: 'Batches', icon: 'timetable', screen: 'Batches' },
  { id: '4', title: 'Results', icon: 'file-chart-outline', screen: 'Results' },
  {
    id: '5',
    title: 'Attendance',
    icon: 'calendar-check-outline',
    screen: 'Attendance',
  },
  { id: '6', title: 'Fees', icon: 'currency-inr', screen: 'FeeStructure' },
];

// ---- HEADER COMPONENT ----
const DashboardHeader = ({ name = 'My Institute', onLogoPress }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[headerStyles.wrapper, { backgroundColor: colors.background }]}
    >
      {/* Left: Institute/App Name */}
      <View style={headerStyles.left}>
        <Text
          style={[
            headerStyles.title,
            { color: colors.text, maxWidth: sWidth * 0.5, fontStyle: 'italic' },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {name}
        </Text>
      </View>
      {/* Right: Logo area (icon or image) */}
      <TouchableOpacity style={headerStyles.right} onPress={onLogoPress}>
        {/* For real image logo, swap the Icon line below with: */}
        <Image
          source={require('../assets/images/images.jpeg')}
          style={headerStyles.logoImg}
          resizeMode="contain"
        />
        {/* <Icon name="school" size={LOGO_SIZE} color={colors.accent} /> */}
      </TouchableOpacity>
    </View>
  );
};

// ---- MAIN DASHBOARD ----
const Dashboard = ({ navigation }) => {
  const { colors } = useTheme();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          shadowColor: colors.border,
          elevation: 5,
        },
      ]}
      onPress={() => navigation.navigate(item.screen)}
      activeOpacity={0.78}
    >
      <Icon name={item.icon} size={sWidth * 0.1} color={colors.accent} />
      <Text style={[styles.cardText, { color: colors.text }]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <DashboardHeader
        name="Ideal Institute"
        onLogoPress={() => {
          // e.g., open drawer, or show profile/settings
        }}
      />
      <FlatList
        data={features}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: sHeight * 0.035 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Dashboard;

// ---- HEADER STYLES ----
const headerStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sHeight * 0.018,
    paddingBottom: sHeight * 0.008,
    paddingHorizontal: sWidth * 0.02,
  },
  left: {
    flex: 1,
    justifyContent: 'center',
    minWidth: sWidth * 0.3,
  },
  right: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: sWidth * 0.02,
    borderRadius: LOGO_SIZE * 0.46,
    backgroundColor: '#fff2',
    width: LOGO_SIZE * 1.18,
    height: LOGO_SIZE * 1.18,
    elevation: 4,
    shadowColor: '#1118',
    shadowOpacity: 0.11,
    shadowRadius: 6,
    shadowOffset: { width: 2, height: 2 },
  },
  title: {
    fontWeight: '600',
    fontSize: sWidth * 0.06,
    letterSpacing: 1.2,
    textAlign: 'left',
    includeFontPadding: false,
  },
  logoImg: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE * 0.22,
    resizeMode: 'contain',
  },
});

// ---- MAIN GRID STYLES ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sWidth * 0.05,
    paddingTop: sHeight * 0.04,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: sHeight * 0.03,
  },
  card: {
    width: CARD_WIDTH,
    height: sHeight * 0.18,
    borderRadius: sWidth * 0.04,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: sHeight * 0.005,
  },
  cardText: {
    marginTop: sHeight * 0.015,
    fontSize: sWidth * 0.045,
    fontWeight: '600',
  },
});
