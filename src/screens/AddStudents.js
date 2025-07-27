import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Animatable from 'react-native-animatable';
import { useDispatch, useSelector } from 'react-redux';
import { insertStudent, initStudentTable } from '../db/studentTable';
import { addStudent } from '../redux/slice/studentSlice';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');
const sWidth = width;
const sHeight = Dimensions.get('window').height;

const classOptions = Array.from({ length: 8 }, (_, i) => `${i + 5}`);
const streamOptions = ['Science', 'Commerce', 'Arts'];
const scienceGroups = ['PCM', 'PCB'];
const genderOptions = ['Male', 'Female', 'Other'];

export default function AddStudent() {
  const dispatch = useDispatch();
  const students = useSelector(state => state.students); // Redux state for existing students
  const { colors } = useTheme();

  const [form, setForm] = useState({
    name: '',
    dob: new Date(),
    phone: '',
    gender: '',
    address: '',
    school: '',
    class: '',
    stream: '',
    scienceGroup: '',
    admissionDate: new Date(),
    totalFees: '',
    submittedFees: [],
  });

  const [dobPicker, setDobPicker] = useState(false);
  const [admissionPicker, setAdmissionPicker] = useState(false);
  const [feeModal, setFeeModal] = useState(false);
  const [feeAmount, setFeeAmount] = useState('');
  const [feeDate, setFeeDate] = useState(new Date());
  const [feeDatePicker, setFeeDatePicker] = useState(false);
  const [classModal, setClassModal] = useState(false);
  const [streamModal, setStreamModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const classModalRef = useRef(null);
  const streamModalRef = useRef(null);
  const successPopRef = useRef(null);

  useEffect(() => {
    initStudentTable();
  }, []);

  // Generates unique student ID like s1, s2... by scanning existing IDs to avoid duplication
  function generateStudentId() {
    if (!students || students.length === 0) return 's1';

    const ids = students
      .map(s => s.id)
      .filter(id => typeof id === 'string' && /^s\d+$/.test(id))
      .map(id => parseInt(id.substring(1), 10))
      .filter(num => !isNaN(num));

    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    return `s${maxId + 1}`;
  }

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
      setFeeAmount('');
      setFeeModal(false);
    }
  };

  const remainingFees = form.totalFees
    ? parseFloat(form.totalFees) -
      form.submittedFees.reduce((sum, f) => sum + (f.amount || 0), 0)
    : 0;

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

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert('Please enter student name');
      return;
    }

    const newId = generateStudentId();

    const studentToSave = {
      id: newId,
      name: form.name.trim(),
      dob: form.dob instanceof Date ? form.dob : new Date(form.dob),
      phone: form.phone.trim(),
      gender: form.gender,
      address: form.address.trim(),
      school: form.school.trim(),
      class: form.class,
      stream: form.stream,
      scienceGroup: form.scienceGroup,
      admissionDate:
        form.admissionDate instanceof Date
          ? form.admissionDate
          : new Date(form.admissionDate),
      totalFees: form.totalFees.trim(),
      submittedFees: Array.isArray(form.submittedFees)
        ? form.submittedFees
        : [],
    };

    try {
      dispatch(addStudent(studentToSave));
      await insertStudent(studentToSave);

      setShowSuccess(true);
      if (successPopRef.current) {
        await successPopRef.current.fadeInUp(500);
      }

      setTimeout(async () => {
        if (successPopRef.current) {
          await successPopRef.current.fadeOutDown(400);
        }
        setShowSuccess(false);
      }, 2000);

      // Reset form
      setForm({
        name: '',
        dob: new Date(),
        phone: '',
        gender: '',
        address: '',
        school: '',
        class: '',
        stream: '',
        scienceGroup: '',
        admissionDate: new Date(),
        totalFees: '',
        submittedFees: [],
      });
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Failed to save student.');
    }
  };

  const styles = getStyles(colors);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Add Student</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={colors.placeholder}
            value={form.name}
            onChangeText={val => handleChange('name', val)}
          />

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
              onChange={(event, date) => {
                setDobPicker(Platform.OS === 'ios');
                if (date) handleChange('dob', date);
              }}
              maximumDate={new Date()}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Phone"
            placeholderTextColor={colors.placeholder}
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={val => handleChange('phone', val)}
          />

          <TextInput
            style={[styles.input, { minHeight: 60 }]}
            placeholder="Address"
            placeholderTextColor={colors.placeholder}
            multiline
            value={form.address}
            onChangeText={val => handleChange('address', val)}
          />

          <TextInput
            style={styles.input}
            placeholder="School"
            placeholderTextColor={colors.placeholder}
            value={form.school}
            onChangeText={val => handleChange('school', val)}
          />

          {/* Class */}
          <Text style={styles.label}>Class</Text>
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

          {/* Stream */}
          {(form.class === '11' || form.class === '12') && (
            <>
              <Text style={styles.label}>Stream</Text>
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

              {/* Science Groups */}
              {form.stream === 'Science' && (
                <>
                  <Text style={styles.label}>Science Group</Text>
                  <View style={styles.genderContainer}>
                    {scienceGroups.map(group => (
                      <TouchableOpacity
                        key={group}
                        style={[
                          styles.genderOption,
                          form.scienceGroup === group &&
                            styles.genderOptionSelected,
                        ]}
                        onPress={() => handleChange('scienceGroup', group)}
                      >
                        <Text
                          style={[
                            styles.genderText,
                            form.scienceGroup === group &&
                              styles.genderTextSelected,
                          ]}
                        >
                          {group}
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
              onChange={(event, date) => {
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

          {/* Add Fee Button + Listed Fees */}
          <Animatable.View animation="bounceIn" duration={600}>
            <TouchableOpacity
              style={styles.feeButton}
              onPress={() => setFeeModal(true)}
            >
              <Text style={styles.feeButtonText}>Add Submitted Fee</Text>
            </TouchableOpacity>
          </Animatable.View>

          <Text style={styles.label}>
            Remaining Fees: ₹{remainingFees.toFixed(2)}
          </Text>

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
          <Modal
            visible={feeModal}
            transparent
            animationType="none"
            onRequestClose={() => setFeeModal(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPressOut={() => setFeeModal(false)}
            >
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
                    onChange={(e, date) => {
                      setFeeDatePicker(false);
                      if (date) setFeeDate(date);
                    }}
                  />
                )}
                <TouchableOpacity style={styles.feeButton} onPress={submitFee}>
                  <Text style={styles.feeButtonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.feeButton,
                    { backgroundColor: colors.border, marginTop: 10 },
                  ]}
                  onPress={() => setFeeModal(false)}
                >
                  <Text style={styles.feeButtonText}>Cancel</Text>
                </TouchableOpacity>
              </Animatable.View>
            </TouchableOpacity>
          </Modal>

          {/* Save Button */}
          <Animatable.View animation="bounceIn" duration={600}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: colors.buttonBackground },
              ]}
              onPress={handleSave}
            >
              <Text
                style={[styles.saveButtonText, { color: colors.buttonText }]}
              >
                Save Student
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Pop-up */}
      {showSuccess && (
        <Animatable.View
          ref={successPopRef}
          style={[styles.successPopup, { backgroundColor: colors.success }]}
          useNativeDriver
          pointerEvents="none"
        >
          <Text
            style={{
              color: colors.text,
              fontWeight: 'bold',
              fontSize: sWidth * 0.05,
              textAlign: 'center',
            }}
          >
            Student added successfully!
          </Text>
        </Animatable.View>
      )}
    </>
  );
}

const getStyles = colors =>
  StyleSheet.create({
    container: {
      padding: 24,
      paddingBottom: 60,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 24,
      alignSelf: 'center',
      letterSpacing: 2,
    },
    input: {
      backgroundColor: colors.card,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      marginBottom: 16,
    },
    label: {
      fontWeight: '700',
      fontSize: 16,
      color: colors.text,
      marginBottom: 8,
    },
    genderContainer: {
      flexDirection: 'row',
      marginBottom: 24,
      justifyContent: 'space-between',
    },
    genderOption: {
      flex: 1,
      marginHorizontal: 4,
      borderWidth: 1,
      borderRadius: 12,
      borderColor: colors.border,
      paddingVertical: 12,
      alignItems: 'center',
      backgroundColor: colors.card,
    },
    genderOptionSelected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    genderText: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 14,
    },
    genderTextSelected: {
      color: colors.buttonText,
    },
    datePicker: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      marginBottom: 24,
    },
    dateText: {
      color: colors.text,
      fontSize: 16,
    },
    dropdown: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      marginBottom: 16,
    },
    dropdownTextPlaceholder: {
      color: colors.placeholder,
      fontSize: 16,
    },
    dropdownTextActive: {
      color: colors.text,
      fontSize: 16,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: '#00000099',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalBox: {
      width: '85%',
      backgroundColor: colors.card,
      borderRadius: 18,
      paddingVertical: 18,
      paddingHorizontal: 22,
      maxHeight: '50%',
    },
    option: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    optionText: {
      fontSize: 16,
      color: colors.text,
    },
    selectedOption: {
      backgroundColor: colors.selected,
    },
    selectedOptionText: {
      color: colors.accent,
      fontWeight: '700',
    },
    feeButton: {
      backgroundColor: colors.accent,
      borderRadius: 16,
      paddingVertical: 14,
      marginTop: 10,
      marginBottom: 16,
      alignItems: 'center',
    },
    feeButtonText: {
      fontWeight: '700',
      color: colors.buttonText,
      fontSize: 16,
    },
    feeItem: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    feeItemText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.accent,
    },
    saveButton: {
      borderRadius: 20,
      paddingVertical: 18,
      alignItems: 'center',
    },
    saveButtonText: {
      fontWeight: '700',
      fontSize: 18,
    },
    successPopup: {
      position: 'absolute',
      bottom: sHeight * 0.3,
      alignSelf: 'center',
      paddingVertical: 18,
      paddingHorizontal: 52,
      borderRadius: 20,
      zIndex: 9999,
      elevation: 10,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
  });
