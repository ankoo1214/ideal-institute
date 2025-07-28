import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { sWidth, sHeight } from '../assets/utils';

const feeStructure = [
  { class: '5', total: 15000 },
  { class: '6', total: 15500 },
  { class: '7', total: 16000 },
  { class: '8', total: 16500 },
  { class: '9', total: 17000 },
  { class: '10', total: 18000 },
  { class: '11', Science: 22000, Commerce: 20000, Arts: 18000 },
  { class: '12', Science: 24000, Commerce: 21000, Arts: 19000 },
];

export default function FeesStructure() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: sHeight * 0.05 }}
    >
      <Text style={[styles.header, { color: colors.accent }]}>
        Fee Structure
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.table, { backgroundColor: colors.card }]}>
          <View
            style={[
              styles.row,
              styles.headerRow,
              { backgroundColor: colors.accent },
            ]}
          >
            <Text
              style={[styles.th, styles.colClass, { color: colors.buttonText }]}
            >
              Class
            </Text>
            <Text
              style={[styles.th, styles.colTotal, { color: colors.buttonText }]}
            >
              Total Fees
            </Text>
            <Text
              style={[
                styles.th,
                styles.colStream,
                { color: colors.buttonText },
              ]}
            >
              Science
            </Text>
            <Text
              style={[
                styles.th,
                styles.colStream,
                { color: colors.buttonText },
              ]}
            >
              Commerce
            </Text>
            <Text
              style={[
                styles.th,
                styles.colStream,
                { color: colors.buttonText },
              ]}
            >
              Arts
            </Text>
          </View>

          {feeStructure.map((item, index) => {
            const isEven = index % 2 === 0;
            return (
              <View
                key={item.class}
                style={[
                  styles.row,
                  {
                    backgroundColor: isEven
                      ? colors.background
                      : colors.selected,
                  },
                ]}
              >
                <Text
                  style={[styles.td, styles.colClass, { color: colors.text }]}
                >
                  {item.class}
                </Text>
                <Text
                  style={[styles.td, styles.colTotal, { color: colors.text }]}
                >
                  {item.total ? `₹${item.total.toLocaleString()}` : '-'}
                </Text>
                <Text
                  style={[styles.td, styles.colStream, { color: colors.text }]}
                >
                  {item.Science ? `₹${item.Science.toLocaleString()}` : '-'}
                </Text>
                <Text
                  style={[styles.td, styles.colStream, { color: colors.text }]}
                >
                  {item.Commerce ? `₹${item.Commerce.toLocaleString()}` : '-'}
                </Text>
                <Text
                  style={[styles.td, styles.colStream, { color: colors.text }]}
                >
                  {item.Arts ? `₹${item.Arts.toLocaleString()}` : '-'}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: sHeight * 0.035,
  },
  header: {
    fontSize: sWidth * 0.08,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: sHeight * 0.03,
    letterSpacing: 1,
  },
  table: {
    borderRadius: sWidth * 0.04,
    minWidth: 600, // ensure horizontal scrolling kicks in on smaller devices
    marginHorizontal: sWidth * 0.04,
    paddingVertical: sHeight * 0.015,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sHeight * 0.012,
    paddingHorizontal: sWidth * 0.03,
  },
  headerRow: {
    borderTopLeftRadius: sWidth * 0.04,
    borderTopRightRadius: sWidth * 0.04,
  },
  th: {
    fontWeight: '700',
    fontSize: sWidth * 0.046,
    textAlign: 'center',
  },
  td: {
    fontSize: sWidth * 0.043,
    textAlign: 'center',
  },
  colClass: {
    flex: 1,
    minWidth: 80,
  },
  colTotal: {
    flex: 1.5,
    minWidth: 130,
  },
  colStream: {
    flex: 1.2,
    minWidth: 120,
  },
});
