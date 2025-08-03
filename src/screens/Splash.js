import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../theme/ThemeContext';
import { sWidth, sHeight } from '../assets/utils';
import { dropTable } from '../db/deleteTable';

const Splash = ({ navigation }) => {
  const { colors } = useTheme();
  const logoRef = useRef(null);

  useEffect(() => {
    if (logoRef.current) {
      logoRef.current
        .fadeInDown(800)
        .then(() => logoRef.current.bounceIn(1500));
    }

    const timer = setTimeout(() => {
      navigation.replace('MainTabs');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  // useEffect(() => {
  //   const resetDB = async () => {
  //     try {
  //       const result = await dropTable('STUDENTS');
  //       console.log('✔️ Table dropped in SplashScreen:', result);
  //     } catch (error) {
  //       console.log('❌ Failed to drop table in SplashScreen:', error);
  //     }
  //   };

  //   resetDB();
  // }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animatable.Image
        ref={logoRef}
        source={require('../assets/images/images.jpeg')}
        style={[styles.logo, { borderColor: colors.accent }]}
        resizeMode="cover"
        useNativeDriver
      />
      <Animatable.Text
        animation="fadeInUp"
        delay={1000}
        duration={1200}
        style={[
          styles.text,
          {
            color: colors.text,
            textShadowColor: colors.border,
          },
        ]}
        useNativeDriver
      >
        Welcome to{' '}
        <Text style={{ color: colors.accent, fontWeight: 'bold' }}>
          Ideal Institute
        </Text>
      </Animatable.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: sWidth,
    height: sHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: sWidth * 0.36,
    height: sWidth * 0.36,
    borderRadius: sWidth * 0.18,
    borderWidth: 3,
    marginBottom: sHeight * 0.04,
    // borderColor set via accent color in line above
    shadowColor: '#333a',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 9,
  },
  text: {
    fontSize: sWidth * 0.065,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginTop: sHeight * 0.02,
  },
});

export default Splash;
