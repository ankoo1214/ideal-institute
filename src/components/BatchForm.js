import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';
import { useSelector } from 'react-redux';
import { sWidth, sHeight } from '../assets/utils';

const classOptions = Array.from({ length: 8 }, (_, i) => `${i + 5}`);
const streamOptions = ['Science', 'Commerce', 'Arts'];

export default function BatchForm({ visible, onClose, onAdd }) {
  const { colors } = useTheme();
  const batches = useSelector(state => state.batches) || [];

  // Form state
  const [form, setForm] = useState({
    name: '',
    class: '',
    stream: '',
    teacher: '',
    schedule: '',
    studentsCount: '',
    startTime: null, // Stored as ISO string or null
    endTime: null,
  });
  const [classModalVisible, setClassModalVisible] = useState(false);
  const [streamModalVisible, setStreamModalVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState({
    mode: null,
    field: null,
  });

  // Generate unique batch id: b1, b2, ...
  const generateBatchId = () => {
    const ids = batches
      .map(b => b.id)
      .filter(id => typeof id === 'string' && /^b\d+$/.test(id))
      .map(id => parseInt(id.substring(1), 10))
      .filter(num => !isNaN(num));
    const max = ids.length > 0 ? Math.max(...ids) : 0;
    return `b${max + 1}`;
  };

  const updateField = (field, value) => {
    if (field === 'class' && value !== '11' && value !== '12') {
      setForm(prev => ({ ...prev, class: value, stream: '' }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleShowTimePicker = field => {
    setShowTimePicker({ mode: 'time', field });
  };

  const onSelectTime = (field, event, selectedDate) => {
    setShowTimePicker({ mode: null, field: null });
    if (selectedDate) {
      // Store ISO string for serializability
      setForm(prev => ({ ...prev, [field]: selectedDate.toISOString() }));
    }
  };

  const formatTime = isoString => {
    if (!isoString) return 'Select Time';
    const dt = new Date(isoString);
    // Format: hh:mm AM/PM
    return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      alert('Please enter batch name');
      return;
    }
    if (!form.class) {
      alert('Please select a class');
      return;
    }
    if ((form.class === '11' || form.class === '12') && !form.stream) {
      alert('Please select a stream');
      return;
    }
    if (!form.startTime) {
      alert('Please select start time');
      return;
    }
    if (!form.endTime) {
      alert('Please select end time');
      return;
    }

    const newBatch = {
      id: generateBatchId(),
      name: form.name.trim(),
      class: form.class,
      stream: form.stream,
      teacher: form.teacher.trim(),
      startTime: form.startTime,
      endTime: form.endTime,
      schedule: `${formatTime(form.startTime)} - ${formatTime(form.endTime)}`,
      studentsCount: parseInt(form.studentsCount, 10) || 0,
    };

    onAdd(newBatch);

    // Reset form
    setForm({
      name: '',
      class: '',
      stream: '',
      teacher: '',
      schedule: '',
      studentsCount: '',
      startTime: null,
      endTime: null,
    });
  };

  const styles = getStyles(colors);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.modalWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animatable.View
          animation="fadeInUp"
          duration={350}
          style={[styles.modalContainer, { backgroundColor: colors.card }]}
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: sHeight * 0.03 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.header, { color: colors.text }]}>
              Add New Batch
            </Text>

            <TextInput
              placeholder="Batch Name"
              placeholderTextColor={colors.placeholder}
              style={styles.input}
              value={form.name}
              onChangeText={text => updateField('name', text)}
              returnKeyType="done"
            />

            <Text style={[styles.label, { color: colors.text }]}>Class</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setClassModalVisible(true)}
            >
              <Text
                style={
                  form.class
                    ? styles.dropdownActive
                    : styles.dropdownPlaceholder
                }
              >
                {form.class || 'Select Class'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.label, { color: colors.text }]}>Stream</Text>
            <TouchableOpacity
              style={[
                styles.dropdown,
                {
                  backgroundColor: ['11', '12'].includes(form.class)
                    ? colors.card
                    : colors.border,
                },
              ]}
              disabled={!['11', '12'].includes(form.class)}
              onPress={() =>
                ['11', '12'].includes(form.class) && setStreamModalVisible(true)
              }
            >
              <Text
                style={
                  form.stream
                    ? styles.dropdownActive
                    : styles.dropdownPlaceholder
                }
              >
                {form.stream ||
                  (['11', '12'].includes(form.class) ? 'Select Stream' : 'N/A')}
              </Text>
            </TouchableOpacity>

            <TextInput
              placeholder="Teacher Name"
              placeholderTextColor={colors.placeholder}
              style={styles.input}
              value={form.teacher}
              onChangeText={text => updateField('teacher', text)}
              returnKeyType="done"
            />

            <View style={styles.timeRow}>
              <View style={styles.timePickerContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Start Time
                </Text>
                <TouchableOpacity
                  style={styles.timePicker}
                  onPress={() => handleShowTimePicker('startTime')}
                >
                  <Text
                    style={{
                      color: form.startTime ? colors.text : colors.placeholder,
                    }}
                  >
                    {formatTime(form.startTime)}
                  </Text>
                </TouchableOpacity>
              </View>

              <Icon
                name="arrow-right-bold"
                size={26}
                color={colors.accent}
                style={{ marginHorizontal: sWidth * 0.03, alignSelf: 'center' }}
              />

              <View style={styles.timePickerContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  End Time
                </Text>
                <TouchableOpacity
                  style={styles.timePicker}
                  onPress={() => handleShowTimePicker('endTime')}
                >
                  <Text
                    style={{
                      color: form.endTime ? colors.text : colors.placeholder,
                    }}
                  >
                    {formatTime(form.endTime)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {showTimePicker.mode === 'time' && (
              <DateTimePicker
                value={
                  form[showTimePicker.field]
                    ? new Date(form[showTimePicker.field])
                    : new Date()
                }
                mode="time"
                display="default"
                is24Hour={false}
                onChange={(e, selectedDate) =>
                  onSelectTime(showTimePicker.field, e, selectedDate)
                }
              />
            )}

            <TextInput
              placeholder="Students Count"
              placeholderTextColor={colors.placeholder}
              style={styles.input}
              keyboardType="number-pad"
              value={form.studentsCount}
              onChangeText={text =>
                updateField('studentsCount', text.replace(/[^0-9]/g, ''))
              }
              returnKeyType="done"
            />

            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.error }]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.accent }]}
                onPress={handleSave}
              >
                <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Class selection modal */}
          <Modal
            visible={classModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setClassModalVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              onPressOut={() => setClassModalVisible(false)}
              activeOpacity={1}
            >
              <Animatable.View
                animation="fadeInUp"
                duration={300}
                style={[
                  styles.selectionModal,
                  { backgroundColor: colors.card },
                ]}
              >
                {classOptions.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.optionItem,
                      form.class === item && { backgroundColor: colors.accent },
                    ]}
                    onPress={() => {
                      updateField('class', item);
                      setClassModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        form.class === item && { color: colors.buttonText },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animatable.View>
            </TouchableOpacity>
          </Modal>

          {/* Stream selection modal */}
          <Modal
            visible={streamModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setStreamModalVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              onPressOut={() => setStreamModalVisible(false)}
              activeOpacity={1}
            >
              <Animatable.View
                animation="fadeInUp"
                duration={300}
                style={[
                  styles.selectionModal,
                  { backgroundColor: colors.card },
                ]}
              >
                {streamOptions.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.optionItem,
                      form.stream === item && {
                        backgroundColor: colors.accent,
                      },
                    ]}
                    onPress={() => {
                      updateField('stream', item);
                      setStreamModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        form.stream === item && { color: colors.buttonText },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animatable.View>
            </TouchableOpacity>
          </Modal>
        </Animatable.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const getStyles = colors =>
  StyleSheet.create({
    modalWrapper: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: '#000a',
    },
    modalContainer: {
      maxHeight: sHeight * 0.85,
      borderTopLeftRadius: sWidth * 0.04,
      borderTopRightRadius: sWidth * 0.04,
      paddingHorizontal: sWidth * 0.05,
      paddingTop: sHeight * 0.025,
      paddingBottom: sHeight * 0.03,
      marginHorizontal: sWidth * 0.02,
    },
    header: {
      fontSize: sWidth * 0.07,
      fontWeight: '700',
      marginBottom: sHeight * 0.03,
      textAlign: 'center',
      color: colors.text,
    },
    input: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: sWidth * 0.03,
      paddingVertical: sHeight * 0.015,
      paddingHorizontal: sWidth * 0.04,
      fontSize: sWidth * 0.045,
      marginBottom: sHeight * 0.02,
      color: colors.text,
    },
    label: {
      color: colors.text,
      fontSize: sWidth * 0.044,
      fontWeight: '600',
      marginBottom: sHeight * 0.009,
    },
    dropdown: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: sWidth * 0.03,
      paddingVertical: sHeight * 0.015,
      paddingHorizontal: sWidth * 0.04,
      marginBottom: sHeight * 0.02,
    },
    dropdownPlaceholder: {
      color: colors.placeholder,
      fontSize: sWidth * 0.044,
    },
    dropdownActive: {
      color: colors.text,
      fontSize: sWidth * 0.044,
    },
    buttonsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: sHeight * 0.01,
    },
    button: {
      flex: 0.48,
      paddingVertical: sHeight * 0.015,
      borderRadius: sWidth * 0.035,
      alignItems: 'center',
    },
    buttonText: {
      fontWeight: '700',
      fontSize: sWidth * 0.05,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: '#000a',
      justifyContent: 'flex-end',
    },
    selectionModal: {
      paddingVertical: sHeight * 0.02,
      borderTopLeftRadius: sWidth * 0.04,
      borderTopRightRadius: sWidth * 0.04,
      paddingHorizontal: sWidth * 0.05,
      maxHeight: sHeight * 0.5,
    },
    optionItem: {
      paddingVertical: sHeight * 0.012,
      borderRadius: sWidth * 0.03,
      marginBottom: sHeight * 0.008,
      alignItems: 'center',
    },
    optionText: {
      fontSize: sWidth * 0.045,
      color: colors.text,
      fontWeight: '600',
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: sHeight * 0.02,
      justifyContent: 'space-between',
    },
    timePickerContainer: {
      flex: 1,
    },
    timePicker: {
      backgroundColor: colors.card,
      borderRadius: sWidth * 0.03,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: sHeight * 0.015,
      paddingHorizontal: sWidth * 0.04,
    },
  });
