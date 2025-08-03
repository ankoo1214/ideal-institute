import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { sWidth, sHeight } from '../assets/utils';

const initialFeeStructure = [
  { class: '5', total: 15000 },
  { class: '6', total: 15500 },
  { class: '7', total: 16000 },
  { class: '8', total: 16500 },
  { class: '9', total: 17000 },
  { class: '10', total: 18000 },
  { class: '11', Science: 22000, Commerce: 20000, Arts: 18000 },
  { class: '12', Science: 24000, Commerce: 21000, Arts: 19000 },
];

const STREAMS = ['Science', 'Commerce', 'Arts'];

export default function FeesStructure() {
  const { colors } = useTheme();

  const [feeStructure, setFeeStructure] = useState(initialFeeStructure);

  // Modal control
  const [modalVisible, setModalVisible] = useState(false);

  // Selected class for editing
  const [selectedClass, setSelectedClass] = useState(null);

  // Inputs
  const [inputTotalFee, setInputTotalFee] = useState('');
  const [inputStreamFees, setInputStreamFees] = useState({
    Science: '',
    Commerce: '',
    Arts: '',
  });

  // Open modal and preload inputs
  function openEditModal(item) {
    setSelectedClass(item.class);
    if (item.class === '11' || item.class === '12') {
      setInputTotalFee('');
      setInputStreamFees({
        Science: item.Science ? item.Science.toString() : '',
        Commerce: item.Commerce ? item.Commerce.toString() : '',
        Arts: item.Arts ? item.Arts.toString() : '',
      });
    } else {
      setInputTotalFee(item.total ? item.total.toString() : '');
      setInputStreamFees({ Science: '', Commerce: '', Arts: '' });
    }
    setModalVisible(true);
  }

  // Save fees with partial stream allowance + dark mode styling already built in
  function saveFees() {
    if (!selectedClass) {
      Alert.alert('Select Class', 'Please select a class.');
      return;
    }

    if (selectedClass === '11' || selectedClass === '12') {
      const filledStreams = STREAMS.filter(
        stream => inputStreamFees[stream].trim() !== '',
      );
      if (filledStreams.length === 0) {
        Alert.alert(
          'Input Required',
          'Please enter fee for at least one stream or cancel.',
        );
        return;
      }
      for (let stream of filledStreams) {
        if (
          isNaN(inputStreamFees[stream]) ||
          Number(inputStreamFees[stream]) < 0
        ) {
          Alert.alert(
            'Invalid Fee',
            `Please enter a valid fee for the ${stream} stream.`,
          );
          return;
        }
      }
    } else {
      if (inputTotalFee.trim() === '') {
        Alert.alert('Missing Fee', 'Please enter total fee.');
        return;
      }
      if (isNaN(inputTotalFee) || Number(inputTotalFee) < 0) {
        Alert.alert('Invalid Fee', 'Please enter a valid total fee.');
        return;
      }
    }

    let updatedEntry;
    if (selectedClass === '11' || selectedClass === '12') {
      updatedEntry = {
        class: selectedClass,
        ...STREAMS.reduce((acc, stream) => {
          const val = inputStreamFees[stream].trim();
          if (val !== '') acc[stream] = Number(val);
          return acc;
        }, {}),
      };
    } else {
      updatedEntry = {
        class: selectedClass,
        total: Number(inputTotalFee),
      };
    }

    setFeeStructure(prev => {
      const idx = prev.findIndex(f => f.class === selectedClass);
      if (idx !== -1) {
        const newArr = [...prev];
        newArr[idx] = updatedEntry;
        return newArr;
      }
      return [...prev, updatedEntry];
    });

    setModalVisible(false);
  }

  return (
    <>
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
                style={[
                  styles.th,
                  styles.colClass,
                  { color: colors.buttonText },
                ]}
              >
                Class
              </Text>
              <Text
                style={[
                  styles.th,
                  styles.colTotal,
                  { color: colors.buttonText },
                ]}
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
              <Text
                style={[
                  styles.th,
                  styles.colEdit,
                  { color: colors.buttonText },
                ]}
              >
                Edit
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
                    style={[
                      styles.td,
                      styles.colStream,
                      { color: colors.text },
                    ]}
                  >
                    {item.Science ? `₹${item.Science.toLocaleString()}` : '-'}
                  </Text>
                  <Text
                    style={[
                      styles.td,
                      styles.colStream,
                      { color: colors.text },
                    ]}
                  >
                    {item.Commerce ? `₹${item.Commerce.toLocaleString()}` : '-'}
                  </Text>
                  <Text
                    style={[
                      styles.td,
                      styles.colStream,
                      { color: colors.text },
                    ]}
                  >
                    {item.Arts ? `₹${item.Arts.toLocaleString()}` : '-'}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.editButton,
                      { backgroundColor: colors.accent },
                    ]}
                    onPress={() => openEditModal(item)}
                  >
                    <Text style={{ color: colors.buttonText }}>Edit</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Modal for Editing */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={[styles.modalContainer, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.modalHeader, { color: colors.accent }]}>
                Edit Fee Structure
              </Text>

              {/* Class Selection Scroll */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginVertical: sHeight * 0.015 }}
              >
                {[...Array(12)].map((_, i) => {
                  const cls = (i + 1).toString();
                  const isSelected = cls === selectedClass;
                  return (
                    <TouchableOpacity
                      key={cls}
                      onPress={() => setSelectedClass(cls)}
                      style={[
                        styles.classBadge,
                        {
                          backgroundColor: isSelected
                            ? colors.accent
                            : 'transparent',
                          borderColor: isSelected
                            ? colors.accent
                            : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: isSelected ? colors.buttonText : colors.text,
                          fontSize: sWidth * 0.04,
                        }}
                      >
                        {cls}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Fee Inputs */}
              {selectedClass === '11' || selectedClass === '12' ? (
                <>
                  {STREAMS.map(stream => (
                    <View key={stream} style={styles.rowInput}>
                      <Text
                        style={[styles.streamLabel, { color: colors.text }]}
                      >
                        {stream} Fee
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          { borderColor: colors.border, color: colors.text },
                        ]}
                        keyboardType="numeric"
                        value={inputStreamFees[stream]}
                        onChangeText={text =>
                          setInputStreamFees(prev => ({
                            ...prev,
                            [stream]: text,
                          }))
                        }
                        placeholder={`Enter ${stream} Fee`}
                        placeholderTextColor={colors.placeholder}
                      />
                    </View>
                  ))}
                </>
              ) : (
                <View style={styles.rowInput}>
                  <Text style={[styles.streamLabel, { color: colors.text }]}>
                    Total Fee
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { borderColor: colors.border, color: colors.text },
                    ]}
                    keyboardType="numeric"
                    value={inputTotalFee}
                    onChangeText={setInputTotalFee}
                    placeholder="Enter Total Fee"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
              )}

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.accent }]}
                  onPress={saveFees}
                >
                  <Text
                    style={[styles.buttonText, { color: colors.buttonText }]}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.error }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text
                    style={[styles.buttonText, { color: colors.buttonText }]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
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
    minWidth: 600, // ensure horizontal scroll
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
  colEdit: {
    flex: 0.7,
    minWidth: 70,
    textAlign: 'center',
  },
  editButton: {
    paddingVertical: sHeight * 0.006,
    paddingHorizontal: sWidth * 0.04,
    borderRadius: sWidth * 0.03,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)', // Dark dimmed background
    justifyContent: 'center',
    paddingHorizontal: sWidth * 0.05,
  },
  modalContainer: {
    backgroundColor: '#121212', // Dark mode background, adjust as per your theme
    borderRadius: sWidth * 0.04,
    padding: sWidth * 0.05,
    maxHeight: sHeight * 0.85,
  },
  modalHeader: {
    fontSize: sWidth * 0.06,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: sHeight * 0.015,
    color: '#fff', // Contrast text color for dark mode
  },
  classBadge: {
    paddingHorizontal: sWidth * 0.04,
    paddingVertical: sHeight * 0.008,
    borderRadius: sWidth * 0.02,
    borderWidth: 1,
    borderColor: '#888',
    marginHorizontal: sWidth * 0.015,
  },
  rowInput: {
    marginBottom: sHeight * 0.015,
  },
  streamLabel: {
    fontSize: sWidth * 0.045,
    marginBottom: sHeight * 0.006,
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: sWidth * 0.03,
    paddingHorizontal: sWidth * 0.03,
    paddingVertical: sHeight * 0.015,
    fontSize: sWidth * 0.045,
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: sHeight * 0.03,
  },
  button: {
    flex: 1,
    paddingVertical: sHeight * 0.015,
    borderRadius: sWidth * 0.04,
    marginHorizontal: sWidth * 0.01,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '700',
    fontSize: sWidth * 0.05,
  },
});
