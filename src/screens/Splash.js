import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { sWidth, sHeight } from '../assets/utils'; // Responsive dimensions

import { dropStudentTable } from '../db/deleteTable';
const Splash = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('MainTabs');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  // useEffect(() => {
  //   const resetDB = async () => {
  //     try {
  //       const result = await dropStudentTable('students');
  //       console.log('✔️ Table dropped in SplashScreen:', result);
  //     } catch (error) {
  //       console.log('❌ Failed to drop table in SplashScreen:', error);
  //     }
  //   };

  //   resetDB();
  // }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/images.jpeg')}
        style={styles.logo}
      />
      <Text style={styles.text}>Welcome to MyApp</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: sWidth,
    height: sHeight,
    backgroundColor: '#0080ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: sWidth * 0.35,
    height: sWidth * 0.35,
    marginBottom: sHeight * 0.02,
    borderRadius: sWidth * 0.18,
  },
  text: {
    fontSize: sWidth * 0.06, // Responsive font size
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Splash;
