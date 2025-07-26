import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { sWidth, sHeight } from '../assets/utils'; // <-- responsive utilities

const CARD_WIDTH = sWidth / 2 - sWidth * 0.08;

const features = [
  {
    id: '1',
    title: 'Students',
    icon: 'account-group-outline',
    screen: 'Students',
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
  { id: '6', title: 'Fees', icon: 'currency-inr', screen: 'Fees' },
];

const Dashboard = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate(item.screen)}
    >
      <Icon name={item.icon} size={sWidth * 0.1} color="#3366cc" />
      <Text style={styles.cardText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to Institute App</Text>
      <FlatList
        data={features}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: sHeight * 0.02 }}
      />
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f6ff',
    paddingHorizontal: sWidth * 0.05,
    paddingTop: sHeight * 0.04,
  },
  header: {
    fontSize: sWidth * 0.06,
    fontWeight: '700',
    color: '#333',
    marginBottom: sHeight * 0.025,
    alignSelf: 'center',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: sHeight * 0.03,
  },
  card: {
    backgroundColor: '#ffffff',
    width: CARD_WIDTH,
    height: sHeight * 0.18,
    borderRadius: sWidth * 0.04,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardText: {
    marginTop: sHeight * 0.015,
    fontSize: sWidth * 0.045,
    fontWeight: '600',
    color: '#444',
  },
});
