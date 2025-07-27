import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Animatable from 'react-native-animatable';
import { useDispatch } from 'react-redux';
import { updateStudent } from '../redux/slice/studentSlice';
import { updateStudentInDb } from '../db/updateQuery';
import { sHeight, sWidth } from '../assets/utils';
import { useTheme } from '../theme/ThemeContext';

const classOptions = Array.from({ length: 8 }, (_, i) => `${i + 5}`);
const streamOptions = ['Science', 'Commerce', 'Arts'];
const scienceGroups = ['PCM', 'PCB'];
const genderOptions = ['Male', 'Female', 'Other'];

export default function EditStudent({ route, navigation }) {
  const { student } = route.params;
  const { colors } = useTheme();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: student.name || '',
    dob: student.dob ? new Date(student.dob) : new Date(),
    phone: student.phone || '',
    gender: student.gender || '',
    address: student.address || '',
    school: student.school || '',
    class: student.class || '',
    stream: student.stream || '',
    scienceGroup: student.scienceGroup || '',
    admissionDate: student.admissionDate
      ? new Date(student.admissionDate)
      : new Date(),
    totalFees: student.totalFees || '',
    submittedFees: Array.isArray(student.submittedFees)
      ? student.submittedFees
      : [],
  });

  const [dobPicker, setDobPicker] = useState(false);
  const [admissionPicker, setAdmissionPicker] = useState(false);
  const [feeModal, setFeeModal] = useState(false);
  const [feeAmount, setFeeAmount] = useState('');
  const [feeDate, setFeeDate] = useState(new Date());
  const [feeDatePicker, setFeeDatePicker] = useState(false);
  const [classModal, setClassModal] = useState(false);
  const [streamModal, setStreamModal] = useState(false);

  const classModalRef = useRef(null);
  const streamModalRef = useRef(null);

  const handleChange = (field, value) => {
    if (field === 'stream') {
      setForm(prev => ({ ...prev, stream: value, scienceGroup: '' }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const submitFee = () => {
    if (feeAmount) {
      const newFee = {
        amount: parseFloat(feeAmount),
        date: feeDate.toDateString(),
      };
      handleChange('submittedFees', [...form.submittedFees, newFee]);
      setFeeModal(false);
      setFeeAmount('');
    }
  };

  const remainingFees =
    parseFloat(form.totalFees || 0) -
    form.submittedFees.reduce((sum, f) => sum + (f.amount || 0), 0);

  const closeClassModal = async () => {
    if (classModalRef.current) {
      await classModalRef.current.fadeOutDown(300);
    }
    setClassModal(false);
  };

  const closeStreamModal = async () => {
    if (streamModalRef.current) {
      await streamModalRef.current.fadeOutDown(300);
    }
    setStreamModal(false);
  };

  const handleSaveChanges = async () => {
    try {
      const studentToUpdate = {
        ...form,
        dob: form.dob instanceof Date ? form.dob : new Date(form.dob),
        admissionDate:
          form.admissionDate instanceof Date
            ? form.admissionDate
            : new Date(form.admissionDate),
        submittedFees: Array.isArray(form.submittedFees)
          ? form.submittedFees
          : [],
      };

      dispatch(updateStudent({ id: student.id, changes: studentToUpdate }));
      await updateStudentInDb(student.id, studentToUpdate);

      alert('Student updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update student.');
    }
  };

  const styles = getStyles(colors);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Edit Student</Text>

        {/* Name */}
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={colors.placeholder}
          value={form.name}
          onChangeText={val => handleChange('name', val)}
        />

        {/* Gender Selection */}
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderContainer}>
          {genderOptions.map(gender => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.genderOption,
                form.gender === gender && styles.genderOptionSelected,
              ]}
              onPress={() => handleChange('gender', gender)}
            >
              <Text
                style={[
                  styles.genderText,
                  form.gender === gender && styles.genderTextSelected,
                ]}
              >
                {gender}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DOB Picker */}
        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity
          style={styles.datePicker}
          onPress={() => setDobPicker(true)}
        >
          <Text style={styles.dateText}>{form.dob.toDateString()}</Text>
        </TouchableOpacity>
        {dobPicker && (
          <DateTimePicker
            value={form.dob}
            mode="date"
            display="default"
            onChange={(_, date) => {
              setDobPicker(Platform.OS === 'ios');
              if (date) handleChange('dob', date);
            }}
            maximumDate={new Date()}
          />
        )}

        {/* Phone */}
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor={colors.placeholder}
          keyboardType="numeric"
          value={form.phone}
          onChangeText={val => handleChange('phone', val)}
        />

        {/* Address */}
        <TextInput
          style={[styles.input, { minHeight: 60 }]}
          placeholder="Address"
          placeholderTextColor={colors.placeholder}
          value={form.address}
          onChangeText={val => handleChange('address', val)}
          multiline
        />

        {/* School */}
        <TextInput
          style={styles.input}
          placeholder="School Name"
          placeholderTextColor={colors.placeholder}
          value={form.school}
          onChangeText={val => handleChange('school', val)}
        />

        {/* Class Dropdown */}
        <Text style={styles.label}>Select Class:</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setClassModal(true)}
        >
          <Text
            style={
              form.class
                ? styles.dropdownTextActive
                : styles.dropdownTextPlaceholder
            }
          >
            {form.class || 'Choose Class'}
          </Text>
        </TouchableOpacity>
        <Modal
          visible={classModal}
          transparent
          animationType="none"
          onRequestClose={closeClassModal}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={closeClassModal}
          >
            <Animatable.View
              ref={classModalRef}
              animation="fadeInUp"
              duration={400}
              style={styles.modalBox}
            >
              {classOptions.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.option,
                    form.class === item && styles.selectedOption,
                  ]}
                  onPress={() => {
                    handleChange('class', item);
                    closeClassModal();
                  }}
                >
                  <Text
                    style={
                      form.class === item
                        ? styles.selectedOptionText
                        : styles.optionText
                    }
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animatable.View>
          </TouchableOpacity>
        </Modal>

        {/* Stream Dropdown */}
        {(form.class === '11' || form.class === '12') && (
          <>
            <Text style={styles.label}>Select Stream:</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setStreamModal(true)}
            >
              <Text
                style={
                  form.stream
                    ? styles.dropdownTextActive
                    : styles.dropdownTextPlaceholder
                }
              >
                {form.stream || 'Choose Stream'}
              </Text>
            </TouchableOpacity>
            <Modal
              visible={streamModal}
              transparent
              animationType="none"
              onRequestClose={closeStreamModal}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPressOut={closeStreamModal}
              >
                <Animatable.View
                  ref={streamModalRef}
                  animation="fadeInUp"
                  duration={400}
                  style={styles.modalBox}
                >
                  {streamOptions.map(item => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.option,
                        form.stream === item && styles.selectedOption,
                      ]}
                      onPress={() => {
                        handleChange('stream', item);
                        closeStreamModal();
                      }}
                    >
                      <Text
                        style={
                          form.stream === item
                            ? styles.selectedOptionText
                            : styles.optionText
                        }
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </Animatable.View>
              </TouchableOpacity>
            </Modal>

            {/* Science Group Dropdown */}
            {form.stream === 'Science' && (
              <>
                <Text style={styles.label}>Science Group</Text>
                <View style={styles.genderContainer}>
                  {scienceGroups.map(option => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.genderOption,
                        form.scienceGroup === option &&
                          styles.genderOptionSelected,
                      ]}
                      onPress={() => handleChange('scienceGroup', option)}
                    >
                      <Text
                        style={[
                          styles.genderText,
                          form.scienceGroup === option &&
                            styles.genderTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </>
        )}

        {/* Admission Date */}
        <Text style={styles.label}>Admission Date</Text>
        <TouchableOpacity
          style={styles.datePicker}
          onPress={() => setAdmissionPicker(true)}
        >
          <Text style={styles.dateText}>
            {form.admissionDate.toDateString()}
          </Text>
        </TouchableOpacity>
        {admissionPicker && (
          <DateTimePicker
            value={form.admissionDate}
            mode="date"
            display="default"
            onChange={(_, date) => {
              setAdmissionPicker(Platform.OS === 'ios');
              if (date) handleChange('admissionDate', date);
            }}
            maximumDate={new Date()}
          />
        )}

        {/* Total Fees */}
        <TextInput
          style={styles.input}
          placeholder="Total Fees"
          placeholderTextColor={colors.placeholder}
          keyboardType="numeric"
          value={form.totalFees}
          onChangeText={val => handleChange('totalFees', val)}
        />

        {/* Fee Modal Trigger */}
        <Animatable.View animation="bounceIn" duration={600}>
          <TouchableOpacity
            style={styles.feeButton}
            onPress={() => setFeeModal(true)}
          >
            <Text style={styles.feeText}>Add Submitted Fee</Text>
          </TouchableOpacity>
        </Animatable.View>

        <Text style={styles.label}>
          Remaining Fees: ₹{isNaN(remainingFees) ? 0 : remainingFees.toFixed(2)}
        </Text>

        {/* Submitted Fees List */}
        <FlatList
          data={form.submittedFees}
          keyExtractor={(_, index) => index.toString()}
          ListEmptyComponent={
            <Text
              style={{
                color: colors.placeholder,
                textAlign: 'center',
                marginVertical: 5,
              }}
            >
              No fees submitted yet.
            </Text>
          }
          renderItem={({ item }) => (
            <Animatable.View
              animation="fadeIn"
              duration={400}
              style={styles.feeItem}
            >
              <Text style={styles.feeItemText}>
                ₹{item.amount} on {item.date}
              </Text>
            </Animatable.View>
          )}
        />

        {/* Fee Modal */}
        <Modal visible={feeModal} transparent animationType="none">
          <View style={styles.modalOverlay}>
            <Animatable.View
              animation="fadeInUp"
              duration={400}
              style={styles.modalBox}
            >
              <TextInput
                placeholder="Fee Amount"
                placeholderTextColor={colors.placeholder}
                style={styles.input}
                keyboardType="numeric"
                value={feeAmount}
                onChangeText={setFeeAmount}
              />
              <TouchableOpacity
                style={styles.datePicker}
                onPress={() => setFeeDatePicker(true)}
              >
                <Text style={styles.dateText}>{feeDate.toDateString()}</Text>
              </TouchableOpacity>
              {feeDatePicker && (
                <DateTimePicker
                  value={feeDate}
                  mode="date"
                  display="default"
                  onChange={(_, date) => {
                    setFeeDatePicker(false);
                    if (date) setFeeDate(date);
                  }}
                />
              )}
              <TouchableOpacity style={styles.feeButton} onPress={submitFee}>
                <Text style={styles.feeText}>Submit Fee</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFeeModal(false)}
                style={[
                  styles.feeButton,
                  { backgroundColor: colors.border, marginTop: 10 },
                ]}
              >
                <Text style={styles.feeText}>Cancel</Text>
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </Modal>

        {/* Save Changes Button */}
        <Animatable.View animation="bounceIn" duration={600}>
          <TouchableOpacity
            onPress={handleSaveChanges}
            style={[
              styles.feeButton,
              { backgroundColor: colors.buttonBackground, marginTop: 30 },
            ]}
          >
            <Text style={[styles.feeText, { color: colors.buttonText }]}>
              Save Changes
            </Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles as a function for theme dynamic styles
function getStyles(colors) {
  const { width } = Dimensions.get('window');
  return StyleSheet.create({
    container: {
      padding: sWidth * 0.06,
      paddingBottom: sHeight * 0.04,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: sWidth * 0.085,
      fontWeight: '700',
      marginBottom: sHeight * 0.035,
      color: colors.text,
      alignSelf: 'center',
      letterSpacing: 1,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      padding: sWidth * 0.035,
      marginBottom: sHeight * 0.02,
      borderRadius: sWidth * 0.03,
      fontSize: sWidth * 0.042,
      backgroundColor: colors.card,
      color: colors.text,
    },
    label: {
      fontSize: sWidth * 0.045,
      fontWeight: '700',
      color: colors.text,
      marginBottom: sHeight * 0.007,
    },
    genderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: sHeight * 0.025,
    },
    genderOption: {
      flex: 1,
      paddingVertical: sHeight * 0.015,
      marginHorizontal: sWidth * 0.008,
      borderWidth: 1,
      borderRadius: sWidth * 0.03,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: 'center',
    },
    genderOptionSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.selected,
    },
    genderText: {
      fontSize: sWidth * 0.043,
      color: colors.text,
      fontWeight: '600',
    },
    genderTextSelected: {
      color: colors.buttonBackground,
      fontWeight: '700',
    },
    datePicker: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: sHeight * 0.016,
      paddingHorizontal: sWidth * 0.035,
      borderRadius: sWidth * 0.03,
      marginBottom: sHeight * 0.02,
      backgroundColor: colors.card,
      justifyContent: 'center',
    },
    dateText: {
      fontSize: sWidth * 0.044,
      color: colors.text,
    },
    dropdown: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: sWidth * 0.03,
      padding: sHeight * 0.016,
      marginBottom: sHeight * 0.02,
      backgroundColor: colors.card,
      justifyContent: 'center',
    },
    dropdownTextPlaceholder: {
      color: colors.placeholder,
      fontSize: sWidth * 0.043,
    },
    dropdownTextActive: {
      color: colors.text,
      fontSize: sWidth * 0.046,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: '#00000099',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalBox: {
      width: width * 0.85,
      backgroundColor: colors.card,
      borderRadius: sWidth * 0.04,
      paddingVertical: sHeight * 0.015,
      paddingHorizontal: sWidth * 0.06,
      maxHeight: sHeight * 0.5,
    },
    option: {
      paddingVertical: sHeight * 0.016,
      paddingHorizontal: sWidth * 0.025,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionText: {
      fontSize: sWidth * 0.043,
      color: colors.text,
    },
    selectedOption: {
      backgroundColor: colors.selected,
    },
    selectedOptionText: {
      color: colors.buttonBackground,
      fontWeight: '700',
    },
    feeButton: {
      backgroundColor: colors.buttonBackground,
      paddingVertical: sHeight * 0.02,
      borderRadius: sWidth * 0.03,
      marginVertical: sHeight * 0.015,
      alignItems: 'center',
    },
    feeText: {
      color: colors.buttonText,
      fontWeight: '700',
      fontSize: sWidth * 0.048,
    },
    feeItem: {
      backgroundColor: colors.card,
      padding: sWidth * 0.04,
      borderRadius: sWidth * 0.03,
      marginVertical: sHeight * 0.007,
    },
    feeItemText: {
      color: colors.accent,
      fontWeight: '600',
      fontSize: sWidth * 0.043,
    },
    successPopup: {
      position: 'absolute',
      bottom: sHeight * 0.3,
      alignSelf: 'center',
      paddingVertical: sHeight * 0.019,
      paddingHorizontal: sWidth * 0.13,
      borderRadius: sWidth * 0.04,
      backgroundColor: colors.success,
      zIndex: 9999,
      shadowColor: colors.success,
      shadowOpacity: 0.6,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 10,
    },
  });
}
