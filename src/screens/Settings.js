import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { useTheme, useThemeMode } from '../theme/ThemeContext';
import { sWidth, sHeight } from '../assets/utils';

const themeOptions = [
  { label: 'System Default', value: 'system' },
  { label: 'Light Mode', value: 'light' },
  { label: 'Dark Mode', value: 'dark' },
];

export default function Settings() {
  const { colors } = useTheme();
  const { themeMode, setTheme } = useThemeMode();

  // Example toggles - expand as needed
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(false);

  const handleSelectTheme = value => {
    setTheme(value);
  };

  const styles = getStyles(colors);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Settings</Text>

      {/* Theme Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        {themeOptions.map(({ label, value }) => {
          const selected = themeMode === value;
          return (
            <TouchableOpacity
              key={value}
              style={[
                styles.optionContainer,
                selected && styles.optionSelected,
              ]}
              activeOpacity={0.75}
              onPress={() => handleSelectTheme(value)}
            >
              <View
                style={[
                  styles.radioOuter,
                  selected && styles.radioSelectedOuter,
                ]}
              >
                {selected && <View style={styles.radioInner} />}
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  selected && styles.optionLabelSelected,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Enable Push Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            thumbColor={
              Platform.OS === 'android'
                ? notificationsEnabled
                  ? colors.accent
                  : colors.border
                : ''
            }
            trackColor={{ true: colors.accent, false: colors.border }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Auto Update</Text>
          <Switch
            value={autoUpdate}
            onValueChange={setAutoUpdate}
            thumbColor={
              Platform.OS === 'android'
                ? autoUpdate
                  ? colors.accent
                  : colors.border
                : ''
            }
            trackColor={{ true: colors.accent, false: colors.border }}
          />
        </View>
      </View>

      {/* Language Setting */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        <TouchableOpacity style={styles.listItem} activeOpacity={0.75}>
          <Text style={styles.listItemText}>English (Default)</Text>
        </TouchableOpacity>
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.listItem} activeOpacity={0.75}>
          <Text style={styles.listItemText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItem} activeOpacity={0.75}>
          <Text style={[styles.listItemText, { color: colors.error }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer Spacer */}
      <View style={{ height: sHeight * 0.05 }} />
    </ScrollView>
  );
}

const getStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: sWidth * 0.05,
      paddingBottom: sHeight * 0.06,
      paddingTop: sHeight * 0.04,
    },
    pageTitle: {
      fontSize: sWidth * 0.075,
      fontWeight: '800',
      color: colors.text,
      marginBottom: sHeight * 0.035,
      alignSelf: 'center',
      letterSpacing: 1,
    },
    section: {
      backgroundColor: colors.card,
      padding: sWidth * 0.05,
      borderRadius: sWidth * 0.04,
      marginBottom: sHeight * 0.03,
      shadowColor: colors.border,
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    sectionTitle: {
      fontSize: sWidth * 0.05,
      fontWeight: '700',
      color: colors.text,
      marginBottom: sHeight * 0.015,
    },
    optionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: sHeight * 0.015,
    },
    optionSelected: {
      backgroundColor: colors.selected,
      borderRadius: sWidth * 0.025,
    },
    radioOuter: {
      width: sWidth * 0.055,
      height: sWidth * 0.055,
      borderRadius: sWidth * 0.028,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioSelectedOuter: {
      borderColor: colors.accent,
    },
    radioInner: {
      width: sWidth * 0.03,
      height: sWidth * 0.03,
      borderRadius: sWidth * 0.015,
      backgroundColor: colors.accent,
    },
    optionLabel: {
      fontSize: sWidth * 0.045,
      color: colors.text,
      marginLeft: sWidth * 0.04,
    },
    optionLabelSelected: {
      fontWeight: '700',
      color: colors.accent,
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: sHeight * 0.018,
    },
    switchLabel: {
      fontSize: sWidth * 0.045,
      color: colors.text,
    },
    listItem: {
      paddingVertical: sHeight * 0.018,
    },
    listItemText: {
      fontSize: sWidth * 0.045,
      color: colors.text,
      fontWeight: '600',
    },
  });
