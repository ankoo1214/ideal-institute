import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { sHeight, sWidth } from '../assets/utils';

const classOptions = Array.from({ length: 8 }, (_, i) => `${i + 5}`);
const streamOptions = ['Science', 'Commerce', 'Arts'];

export default function AddStudentForm() {
  const [form, setForm] = useState({
    name: '',
    dob: new Date(),
    phone: '',
    address: '',
    school: '',
    class: '',
    stream: '',
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

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

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
    form.submittedFees.reduce((sum, f) => sum + f.amount, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Student</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={form.name}
        onChangeText={val => handleChange('name', val)}
      />

      <TouchableOpacity onPress={() => setDobPicker(true)} style={styles.input}>
        <Text>{form.dob.toDateString()}</Text>
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
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="numeric"
        value={form.phone}
        onChangeText={val => handleChange('phone', val)}
      />

      <TextInput
        style={styles.input}
        placeholder="Address"
        value={form.address}
        onChangeText={val => handleChange('address', val)}
      />

      <TextInput
        style={styles.input}
        placeholder="School Name"
        value={form.school}
        onChangeText={val => handleChange('school', val)}
      />

      <Text style={styles.label}>Select Class:</Text>
      <FlatList
        horizontal
        data={classOptions}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleChange('class', item)}
            style={[
              styles.option,
              form.class === item && styles.selectedOption,
            ]}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {(form.class === '11' || form.class === '12') && (
        <>
          <Text style={styles.label}>Select Stream:</Text>
          <FlatList
            horizontal
            data={streamOptions}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleChange('stream', item)}
                style={[
                  styles.option,
                  form.stream === item && styles.selectedOption,
                ]}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      <TouchableOpacity
        onPress={() => setAdmissionPicker(true)}
        style={styles.input}
      >
        <Text>{form.admissionDate.toDateString()}</Text>
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
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Total Fees"
        keyboardType="numeric"
        value={form.totalFees}
        onChangeText={val => handleChange('totalFees', val)}
      />

      <TouchableOpacity
        onPress={() => setFeeModal(true)}
        style={styles.feeButton}
      >
        <Text style={styles.feeText}>Add Submitted Fee</Text>
      </TouchableOpacity>

      <Text style={styles.label}>
        Remaining Fees: ₹{isNaN(remainingFees) ? 0 : remainingFees}
      </Text>

      <FlatList
        data={form.submittedFees}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.feeItem}>
            <Text>
              ₹{item.amount} on {item.date}
            </Text>
          </View>
        )}
      />

      {/* Fee Modal */}
      <Modal visible={feeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TextInput
              placeholder="Fee Amount"
              style={styles.input}
              keyboardType="numeric"
              value={feeAmount}
              onChangeText={setFeeAmount}
            />
            <TouchableOpacity
              style={styles.input}
              onPress={() => setFeeDatePicker(true)}
            >
              <Text>{feeDate.toDateString()}</Text>
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
              style={[styles.feeButton, { backgroundColor: '#999' }]}
            >
              <Text style={styles.feeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: sWidth * 0.05,
    paddingTop: sHeight * 0.05,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: sWidth * 0.06,
    fontWeight: 'bold',
    marginBottom: sHeight * 0.02,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: sWidth * 0.03,
    marginBottom: sHeight * 0.015,
    borderRadius: sWidth * 0.02,
  },
  label: {
    fontSize: sWidth * 0.045,
    marginVertical: sHeight * 0.01,
    fontWeight: '600',
  },
  option: {
    padding: sWidth * 0.03,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: sWidth * 0.02,
    marginRight: sWidth * 0.02,
  },
  selectedOption: {
    backgroundColor: '#aaf',
  },
  feeButton: {
    backgroundColor: '#28a745',
    padding: sWidth * 0.035,
    alignItems: 'center',
    borderRadius: sWidth * 0.02,
    marginVertical: sHeight * 0.01,
  },
  feeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  feeItem: {
    padding: sWidth * 0.03,
    backgroundColor: '#eee',
    borderRadius: sWidth * 0.02,
    marginVertical: sHeight * 0.005,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: sWidth * 0.9,
    backgroundColor: '#fff',
    padding: sWidth * 0.05,
    borderRadius: sWidth * 0.04,
    elevation: 10,
  },
});
