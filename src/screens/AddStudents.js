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
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  Keyboard,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Animatable from 'react-native-animatable';
import { useDispatch, useSelector } from 'react-redux';
import { insertTable } from '../db/insertTable';
import { createTable } from '../db/createTable';
import { addStudent } from '../redux/slice/studentSlice';
import { useTheme } from '../theme/ThemeContext';
import { addStudentAsync } from '../redux/thunk/studentThunk';
import CustomTSDropdown from '../components/CustomTSDropdown';
import NetInfo from '@react-native-community/netinfo';
const { width } = Dimensions.get('window');
const sWidth = width;
const sHeight = Dimensions.get('window').height;

const classOptions = Array.from({ length: 8 }, (_, i) => `${i + 5}`);
const streamOptions = ['Science', 'Commerce', 'Arts'];
const scienceGroups = ['PCM', 'PCB'];
const genderOptions = ['Male', 'Female', 'Other'];

export default function AddStudent() {
  const dispatch = useDispatch();
  const students = useSelector(state => state.students) || [];
  const [schoolOptions, setSchoolOptions] = useState([
    'Central High School',
    'Greenwood Academy',
    'Riverdale Public School',
    'Sunnyvale School',
    'Oakridge International',
    'Springfield High',
    'Hilltop School',
    'Cedar Valley',
    'Lakeside Academy',
    'Other',
  ]);

  const [addOtherSchoolVisible, setAddOtherSchoolVisible] = useState(false);
  const [otherSchoolValue, setOtherSchoolValue] = useState('');

  const { colors } = useTheme();

  const [form, setForm] = useState({
    name: '',
    dob: null,
    phone: '',
    gender: '',
    address: '',
    school: '',
    class: '',
    stream: '',
    scienceGroup: '',
    admissionDate: null,
    totalFees: '',
    submittedFees: [],
  });

  const [dobPicker, setDobPicker] = useState(false);
  const [admissionPicker, setAdmissionPicker] = useState(false);
  const [feeModal, setFeeModal] = useState(false);
  const [feeAmount, setFeeAmount] = useState('');
  const [feeDate, setFeeDate] = useState(null);
  const [feeDatePicker, setFeeDatePicker] = useState(false);
  const [classModal, setClassModal] = useState(false);
  const [streamModal, setStreamModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const classModalRef = useRef(null);
  const streamModalRef = useRef(null);
  const successPopRef = useRef(null);

  useEffect(() => {
    createTable('STUDENTS');
  }, []);

  // Generate unique student ID like s1, s2, ...
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
  const handleSchoolSelect = value => {
    if (value === 'Other') {
      setAddOtherSchoolVisible(true);
    } else {
      handleChange('school', value);
    }
  };

  const handleAddOtherSchool = () => {
    if (!otherSchoolValue.trim()) return;

    const newSchool = otherSchoolValue.trim();
    if (!schoolOptions.includes(newSchool)) {
      setSchoolOptions([...schoolOptions.slice(0, -1), newSchool, 'Other']);
    }
    handleChange('school', newSchool);
    setOtherSchoolValue('');
    setAddOtherSchoolVisible(false);
  };

  // Handle field changes; reset science group if stream changes
  const handleChange = (field, value) => {
    if (field === 'stream') {
      setForm(prev => ({ ...prev, stream: value, scienceGroup: '' }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  // Add new fee to submittedFees array
  const submitFee = () => {
    if (feeAmount) {
      const newFee = {
        amount: parseFloat(feeAmount),
        date: feeDate ? feeDate.toDateString() : new Date().toDateString(),
      };
      handleChange('submittedFees', [...form.submittedFees, newFee]);
      setFeeAmount('');
      setFeeDate(null);
      setFeeModal(false);
    }
  };

  // Calculate remaining fees safely
  const remainingFees =
    form.totalFees && !isNaN(parseFloat(form.totalFees))
      ? parseFloat(form.totalFees) -
        form.submittedFees.reduce((sum, f) => sum + (f.amount || 0), 0)
      : 0;

  // Close modals with animations
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

  // Parse ISO date string or fallback to current Date
  const parseDate = dateString =>
    dateString ? new Date(dateString) : new Date();

  // Save student with serializable dates (ISO strings)
  // Simple Gmail validation
  // const isValidGmail = email => {
  //   const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  //   return gmailRegex.test(email.trim());
  // };

  // Phone validation (10 digits)
  const isValidIndianPhone = phone => {
    const phoneRegex = /^[6-9]\d{9}$/; // Starts with 6-9, total 10 digits
    return phoneRegex.test(phone.trim());
  };

  const handleSave = async () => {
    console.log('handleSave: started');
    const netState = await NetInfo.fetch();
    console.log('New Status::>', netState);
    if (!netState.isConnected) {
      Alert.alert('No Internet', 'Please connect to the internet to proceed.');
      return;
    }
    if (!form.name.trim()) {
      console.log('handleSave: name validation failed');
      alert('Please enter student name');
      return;
    }
    // if (!isValidGmail(form.email)) {
    //   alert('Please enter a valid Gmail address (example@gmail.com)');
    //   return;
    // }

    if (!isValidIndianPhone(form.phone)) {
      alert('Please enter a valid 10-digit Indian phone number');
      return;
    }

    const newId = generateStudentId();
    console.log('handleSave: generated ID =', newId);

    const studentToSave = {
      id: newId,
      name: form.name.trim(),
      dob: form.dob instanceof Date ? form.dob.toISOString() : form.dob,
      phone: form.phone.trim(),
      gender: form.gender,
      address: form.address.trim(),
      school: form.school.trim(),
      class: form.class,
      stream: form.stream,
      scienceGroup: form.scienceGroup,
      admissionDate:
        form.admissionDate instanceof Date
          ? form.admissionDate.toISOString()
          : form.admissionDate,
      totalFees: form.totalFees.trim(),
      submittedFees: form.submittedFees.map((f, idx) => {
        console.log(
          `handleSave: fee item ${idx} - amount: ${f.amount}, date: ${f.date}`,
        );
        return {
          amount: f.amount,
          date: f.date, // assumed already string
        };
      }),
    };

    console.log('handleSave: studentToSave object:', studentToSave);

    try {
      console.log('handleSave: dispatching addStudent');
      dispatch(addStudentAsync(studentToSave));

      console.log('handleSave: calling insertTable...');
      await insertTable('STUDENTS', studentToSave);
      console.log('handleSave: insertTable success');

      setShowSuccess(true);
      if (successPopRef.current) {
        console.log('handleSave: animating success pop-up (fadeIn)');
        await successPopRef.current.fadeInUp(500);
        console.log('handleSave: success pop-up animation complete');
      }

      setTimeout(async () => {
        if (successPopRef.current) {
          console.log('handleSave: animating success pop-up (fadeOut)');
          await successPopRef.current.fadeOutDown(400);
          console.log('handleSave: success pop-up fadeOut complete');
        }
        setShowSuccess(false);
        console.log('handleSave: success pop-up hidden');
      }, 2000);

      console.log('handleSave: resetting form');
      setForm({
        name: '',
        dob: new Date().toISOString(),
        phone: '',
        gender: '',
        address: '',
        school: '',
        class: '',
        stream: '',
        scienceGroup: '',
        admissionDate: new Date().toISOString(),
        totalFees: '',
        submittedFees: [],
      });

      console.log('handleSave: completed successfully');
    } catch (error) {
      console.error('handleSave: error occurred:', error);
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

          {/* Name */}
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={colors.placeholder}
            value={form.name}
            onChangeText={val => handleChange('name', val)}
          />

          {/* Gender */}
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

          {/* Date of Birth */}
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity
            style={styles.datePicker}
            onPress={() => setDobPicker(true)}
          >
            <Text style={styles.dateText}>
              {form.dob
                ? parseDate(form.dob).toDateString()
                : 'Select Date of Birth'}
            </Text>
          </TouchableOpacity>
          {dobPicker && (
            <DateTimePicker
              value={parseDate(form.dob)}
              mode="date"
              display="default"
              onChange={(e, date) => {
                setDobPicker(Platform.OS === 'ios');
                if (date) handleChange('dob', date.toISOString());
              }}
              maximumDate={new Date()}
            />
          )}

          {/* Phone */}
          <View style={styles.phoneRow}>
            <Text style={styles.phonePrefix}>🇮🇳 +91</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="Phone"
              placeholderTextColor={colors.placeholder}
              keyboardType="phone-pad"
              value={form.phone}
              maxLength={10} // allow only 10 digits
              onChangeText={val =>
                handleChange('phone', val.replace(/[^0-9]/g, ''))
              } // numeric only
            />
          </View>

          {/* Address */}
          <TextInput
            style={[styles.input, { minHeight: 60 }]}
            placeholder="Address"
            placeholderTextColor={colors.placeholder}
            multiline
            value={form.address}
            onChangeText={val => handleChange('address', val)}
          />

          {/* School */}
          <CustomTSDropdown
            label="School"
            data={schoolOptions}
            selectedValue={form.school}
            onValueChange={handleSchoolSelect}
            colors={colors}
            sWidth={sWidth}
            sHeight={sHeight}
            placeholder="Select School"
            style={{ marginBottom: sHeight * 0.02 }}
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
              {form.admissionDate
                ? parseDate(form.admissionDate).toDateString()
                : 'Select Date'}
            </Text>
          </TouchableOpacity>
          {admissionPicker && (
            <DateTimePicker
              value={parseDate(form.admissionDate)}
              mode="date"
              display="default"
              onChange={(e, date) => {
                setAdmissionPicker(Platform.OS === 'ios');
                if (date) handleChange('admissionDate', date.toISOString());
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

          {/* Add Fee Button */}
          <Animatable.View animation="bounceIn" duration={600}>
            <TouchableOpacity
              style={styles.feeButton}
              onPress={() => setFeeModal(true)}
            >
              <Text style={styles.feeButtonText}>Add Submitted Fee</Text>
            </TouchableOpacity>
          </Animatable.View>

          {/* Remaining Fees */}
          <Text style={styles.label}>
            Remaining Fees: ₹
            {isNaN(remainingFees) ? '0.00' : remainingFees.toFixed(2)}
          </Text>

          {/* Fee List */}
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
                  <Text style={styles.dateText}>
                    {feeDate
                      ? feeDate.toDateString()
                      : new Date().toDateString()}
                  </Text>
                </TouchableOpacity>
                {feeDatePicker && (
                  <DateTimePicker
                    value={feeDate || new Date()}
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
        <Modal
          visible={addOtherSchoolVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAddOtherSchoolVisible(false)}
        >
          <TouchableWithoutFeedback
            onPress={() => setAddOtherSchoolVisible(false)}
          >
            <View style={modalStyles.overlay}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    modalStyles.modalContainer,
                    { backgroundColor: colors.card },
                  ]}
                >
                  <Text
                    style={[modalStyles.modalTitle, { color: colors.text }]}
                  >
                    Enter new "{otherSchoolValue}"
                  </Text>
                  <TextInput
                    style={[
                      modalStyles.modalInput,
                      { borderColor: colors.border, color: colors.text },
                    ]}
                    placeholder={`New ${otherSchoolValue}`}
                    placeholderTextColor={colors.placeholder}
                    value={otherSchoolValue}
                    onChangeText={setOtherSchoolValue}
                    autoFocus
                    onSubmitEditing={handleAddOtherSchool}
                  />
                  <View style={modalStyles.modalButtons}>
                    <TouchableOpacity
                      onPress={() => setAddOtherSchoolVisible(false)}
                      style={[
                        modalStyles.modalButton,
                        { backgroundColor: colors.error },
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          modalStyles.modalButtonText,
                          { color: colors.buttonText },
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleAddOtherSchool}
                      style={[
                        modalStyles.modalButton,
                        { backgroundColor: colors.accent },
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          modalStyles.modalButtonText,
                          { color: colors.buttonText },
                        ]}
                      >
                        Add
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </KeyboardAvoidingView>

      {/* Success Popup */}

      {showSuccess && (
        <Animatable.View
          ref={successPopRef}
          style={[styles.successPopup, { backgroundColor: colors.success }]}
          useNativeDriver={false}
          pointerEvents="none"
        >
          <Text
            style={{
              color: colors.background,
              fontWeight: 'bold',
              fontSize: sWidth * 0.05,
              textAlign: 'center',
            }}
          >
            Student Added
          </Text>
        </Animatable.View>
      )}
    </>
  );
}

const getStyles = colors =>
  StyleSheet.create({
    container: {
      padding: sWidth * 0.06,
      paddingBottom: sHeight * 0.08,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: sWidth * 0.055,
      fontWeight: '700',
      color: colors.accent,
      marginVertical: sHeight * 0.02,
      alignSelf: 'center',
      letterSpacing: 2,
    },
    input: {
      backgroundColor: colors.card,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: sWidth * 0.03,
      padding: sWidth * 0.035,
      fontSize: sWidth * 0.042,
      marginBottom: sHeight * 0.02,
    },
    label: {
      fontSize: sWidth * 0.042,
      fontWeight: '700',
      color: colors.text,
      marginBottom: sHeight * 0.01,
    },
    genderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: sHeight * 0.03,
    },
    genderOption: {
      flex: 1,
      marginHorizontal: sWidth * 0.01,
      borderWidth: 1,
      borderRadius: sWidth * 0.03,
      borderColor: colors.border,
      paddingVertical: sHeight * 0.015,
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
      fontSize: sWidth * 0.038,
    },
    genderTextSelected: {
      color: colors.buttonText,
    },
    datePicker: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: sWidth * 0.03,
      padding: sWidth * 0.035,
      marginBottom: sHeight * 0.03,
    },
    dateText: {
      color: colors.text,
      fontSize: sWidth * 0.042,
    },
    dropdown: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: sWidth * 0.03,
      padding: sWidth * 0.035,
      marginBottom: sHeight * 0.03,
    },
    dropdownTextPlaceholder: {
      color: colors.placeholder,
      fontSize: sWidth * 0.042,
    },
    dropdownTextActive: {
      color: colors.text,
      fontSize: sWidth * 0.042,
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
      borderRadius: sWidth * 0.04,
      paddingVertical: sWidth * 0.045,
      paddingHorizontal: sWidth * 0.06,
      // maxHeight: '50%',
    },
    option: {
      paddingVertical: sHeight * 0.02,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    optionText: {
      fontSize: sWidth * 0.042,
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
      borderRadius: sWidth * 0.05,
      paddingVertical: sHeight * 0.01,
      marginTop: sHeight * 0.02,
      marginBottom: sHeight * 0.01,
      alignItems: 'center',
    },
    feeButtonText: {
      fontSize: sWidth * 0.042,
      fontWeight: '700',
      color: colors.buttonText,
    },
    feeItem: {
      backgroundColor: colors.card,
      borderRadius: sWidth * 0.03,
      padding: sWidth * 0.035,
      marginVertical: sHeight * 0.008,
    },
    feeItemText: {
      color: colors.accent,
      fontWeight: '600',
      fontSize: sWidth * 0.042,
    },
    saveButton: {
      borderRadius: sWidth * 0.06,
      paddingVertical: sHeight * 0.015,
      marginTop: sHeight * 0.02,
      alignItems: 'center',
    },
    saveButtonText: {
      fontSize: sWidth * 0.04,
      fontWeight: '700',
    },
    successPopup: {
      position: 'absolute',
      bottom: sHeight * 0.25,
      alignSelf: 'center',
      paddingVertical: sHeight * 0.02,
      paddingHorizontal: sWidth * 0.15,
      borderRadius: sWidth * 0.06,
      zIndex: 9999,
      elevation: 20,
    },
    phoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: sWidth * 0.03,
      marginBottom: sHeight * 0.02,
      paddingHorizontal: sWidth * 0.025,
    },
    phonePrefix: {
      fontSize: sWidth * 0.042,
      color: colors.text,
      marginRight: sWidth * 0.02,
    },
    phoneInput: {
      flex: 1,
      fontSize: sWidth * 0.042,
      color: colors.text,
      paddingVertical: sHeight * 0.015,
    },
  });

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    paddingHorizontal: sWidth * 0.12,
  },
  modalContainer: {
    borderRadius: sWidth * 0.035,
    paddingVertical: sWidth * 0.05,
    paddingHorizontal: sWidth * 0.04,
  },
  modalTitle: {
    fontSize: sWidth * 0.052,
    fontWeight: '700',
    marginBottom: sWidth * 0.03,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: sWidth * 0.03,
    paddingHorizontal: sWidth * 0.03,
    paddingVertical: sWidth * 0.04,
    fontSize: sWidth * 0.045,
    marginBottom: sWidth * 0.04,
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: sWidth * 0.035,
    borderRadius: sWidth * 0.03,
    alignItems: 'center',
    marginHorizontal: sWidth * 0.01,
  },
  modalButtonText: {
    fontWeight: '700',
    fontSize: sWidth * 0.045,
  },
});
