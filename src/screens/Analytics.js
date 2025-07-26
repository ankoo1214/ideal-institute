import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { sWidth, sHeight } from '../assets/utils'; // Your dimension helpers

export default function Analytics() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics Screen</Text>
      <Text style={styles.subtitle}>
        Here you'll see graphs, attendance trends, fee charts, etc.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: sWidth,
    height: sHeight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: sWidth * 0.05,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: sWidth * 0.06, // responsive title font size
    fontWeight: 'bold',
    marginBottom: sHeight * 0.01,
  },
  subtitle: {
    fontSize: sWidth * 0.045, // slightly smaller than title
    textAlign: 'center',
    color: '#555',
  },
});
