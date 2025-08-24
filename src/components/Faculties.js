import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

import * as Animatable from 'react-native-animatable';
import { useTheme } from '../theme/ThemeContext';
import AddTeacherForm from './AddTeacherForm';
import Entypo from 'react-native-vector-icons/Entypo';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTeachersAsync,
  addTeacherAsync,
  updateTeacherAsync,
  deleteTeacherAsync,
} from '../redux/thunk/facultyThunk';
import { Dimensions } from 'react-native';
import { deleteStudentFromDb } from '../db/deleteQuery';
import { fetchTable } from '../db/fetchTable';
import { dropTable } from '../db/deleteTable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const sWidth = Dimensions.get('window').width;
const sHeight = Dimensions.get('window').height;

// Helper to group teachers by department
function groupTeachersByDepartment(data) {
  const grouped = {};
  data.forEach(teacher => {
    if (!grouped[teacher.department]) grouped[teacher.department] = [];
    grouped[teacher.department].push(teacher);
  });
  return grouped;
}

export default function Faculties() {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const animateRefs = useRef({});

  const faculties = useSelector(state => state.faculties.teachers);
  const loading = useSelector(state => state.faculties.loading);
  const error = useSelector(state => state.faculties.error);
  const [successMessageVisible, setSuccessMessageVisible] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  // Local state for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data when component mounts
  useEffect(() => {
    const checkConnectionAndFetch = async () => {
      const netState = await NetInfo.fetch();

      if (netState.isConnected) {
        dispatch(fetchTeachersAsync());
      } else {
        Alert.alert(
          'No Internet',
          'Please connect to the internet to fetch teacher data.',
        );
      }
    };

    checkConnectionAndFetch();
  }, [dispatch]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchTeachersAsync())
      .unwrap()
      .finally(() => setRefreshing(false));
  }, [dispatch]);

  const normalizeImageUri = uri => {
    if (!uri) return null;
    if (uri.startsWith('file://')) {
      return uri; // local image (picked but not uploaded yet)
    } else if (uri.startsWith('http')) {
      return uri; // already a full URL
    } else {
      console.log(`https://ideal-server-6c83.onrender.com${uri}`);
      return `https://ideal-server-6c83.onrender.com${uri}`; // server uploads
    }
  };
  const groupedTeachers = groupTeachersByDepartment(faculties || []);

  const CARD_HEIGHT = sHeight * 0.13;
  const AVATAR_SIZE = CARD_HEIGHT * 0.62;

  function onPressIn(id) {
    if (animateRefs.current[id]) {
      animateRefs.current[id].animate(
        { 0: { scale: 1 }, 1: { scale: 0.95 } },
        140,
      );
    }
  }
  function onPressOut(id) {
    if (animateRefs.current[id]) {
      animateRefs.current[id].animate(
        { 0: { scale: 0.95 }, 1: { scale: 1 } },
        140,
      );
    }
  }

  async function openForm(forTeacher = null) {
    console.log('Types of faculties fId::::::>', forTeacher);
    setEditingTeacher(forTeacher);
    setShowForm(true);
    console.log('For Teacher:>', faculties);
    console.log(
      'Type of teacher.fId:',
      typeof forTeacher?.fId,
      'Value:',
      forTeacher?.fId,
    );
    console.log('Types of faculties fId:-->', JSON.stringify(faculties));
    if (faculties.some(t => t.fId === forTeacher.fId)) {
      console.log('Teacher exists → update:', forTeacher);
    } else {
      console.log('Teacher does not exist → add:', forTeacher);
    }
  }

  async function handleAddOrUpdateTeacher(teacher) {
    try {
      const netState = await NetInfo.fetch();

      if (!netState.isConnected) {
        Alert.alert(
          'No Internet',
          'Please connect to the internet to proceed.',
        );
        return;
      }
      console.log('All faculties:>', teacher);
      console.log(
        'Type of teacher.fId:',
        typeof teacher?.fId,
        'Value:',
        teacher?.fId,
      );
      console.log('Types of faculties fId:', JSON.stringify(faculties));
      if (teacher?.fId && faculties.some(t => t.fId === teacher.fId)) {
        console.log('Teacher exists → update:', teacher);
        await dispatch(
          updateTeacherAsync({
            id: teacher.fId,
            changes: teacher,
          }),
        );
      } else {
        console.log('Teacher does not exist → add:', teacher);
        await dispatch(addTeacherAsync(teacher));
      }

      // Reset UI state
      setShowForm(false);
      setEditingTeacher(null);
    } catch (error) {
      console.error('Failed to add or update teacher:', error);
      Alert.alert('Error', 'Something went wrong while saving teacher data.');
    }
  }

  // Delete a teacher by id
  function handleDeleteTeacher(id) {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this teacher?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteTeacherAsync(id)).unwrap();
              setSuccessMessageVisible(true);
              setTimeout(() => setSuccessMessageVisible(false), 2000);
            } catch (error) {
              Alert.alert(
                'Delete Failed',
                error.message || 'Failed to delete teacher',
              );
            }
          },
        },
      ],
      { cancelable: true },
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        <Text style={[styles.title, { color: colors.accent }]}>
          Our Faculties
        </Text>

        {loading && !refreshing && (
          <ActivityIndicator
            size="large"
            color={colors.accent}
            style={{ marginVertical: sWidth * 0.009 }}
          />
        )}

        {error && (
          <Text
            style={{
              color: colors.error || 'red',
              textAlign: 'center',
              marginBottom: 10,
            }}
          >
            {error}
          </Text>
        )}

        {!loading && (!faculties || faculties.length === 0) && (
          <Text
            style={{
              color: colors.text,
              textAlign: 'center',
              marginVertical: 20,
            }}
          >
            No faculties found.
          </Text>
        )}

        {/* Add Teacher Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accent }]}
          activeOpacity={0.8}
          onPress={() => openForm(null)}
        >
          <Text style={[styles.addButtonText, { color: colors.buttonText }]}>
            + Add Teacher
          </Text>
        </TouchableOpacity>

        {/* Faculties grouped */}
        {Object.entries(groupedTeachers).map(([department, teachers]) => (
          <View key={department} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {department}
            </Text>
            {teachers.map((teacher, idx) => (
              <TouchableWithoutFeedback
                key={teacher.fId}
                onPressIn={() => onPressIn(teacher.fId)}
                onPressOut={() => onPressOut(teacher.fId)}
              >
                <Animatable.View
                  ref={ref => (animateRefs.current[teacher.fId] = ref)}
                  animation="fadeInUp"
                  delay={idx * 90}
                  duration={550}
                  useNativeDriver={false}
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.card,
                      shadowColor: colors.shadow || '#000',
                    },
                  ]}
                >
                  <View style={styles.avatarContainer}>
                    {teacher.avatar ? (
                      <Image
                        source={{ uri: normalizeImageUri(teacher.avatar) }}
                        style={[
                          styles.avatar,
                          {
                            width: AVATAR_SIZE,
                            height: AVATAR_SIZE,
                            borderRadius: AVATAR_SIZE / 2,
                          },
                        ]}
                      />
                    ) : (
                      <View
                        style={[
                          styles.avatarPlaceholder,
                          { backgroundColor: colors.accent },
                          {
                            width: AVATAR_SIZE,
                            height: AVATAR_SIZE,
                            borderRadius: AVATAR_SIZE / 2,
                          },
                        ]}
                      >
                        <Text style={styles.avatarInitial}>
                          {teacher.name.charAt(0)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.info}>
                    <Text style={[styles.name, { color: colors.text }]}>
                      {teacher.name}
                    </Text>
                    <Text
                      style={[styles.subject, { color: colors.placeholder }]}
                    >
                      {teacher.subject}
                    </Text>
                    <Text
                      style={[styles.contact, { color: colors.text }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      📧 {teacher.email}
                    </Text>
                    <Text style={[styles.contact, { color: colors.text }]}>
                      📞 {teacher.phone}
                    </Text>
                    {teacher.qualification && (
                      <Text
                        style={[styles.qualification, { color: colors.text }]}
                      >
                        🎓 {teacher.qualification}
                      </Text>
                    )}
                  </View>
                  <View style={styles.actionButtons}>
                    {/* <TouchableOpacity
                      onPress={() => openForm(teacher)}
                      style={[
                        styles.actionButton,
                        { backgroundColor: '#4caf50' },
                      ]}
                    >
                      <Icon name="pencil" size={20} color="#fff" />
                    </TouchableOpacity> */}
                    <TouchableOpacity
                      // Implement delete logic here if needed
                      onPress={() => {
                        handleDeleteTeacher(teacher.id);
                      }}
                      style={[
                        // backgroundColor: '#f44336'),
                        styles.actionButton,
                        {
                          marginLeft: sWidth * 0.1,
                        },
                      ]}
                    >
                      <Icon
                        name="delete-outline"
                        size={sWidth * 0.055}
                        color={colors.error}
                      />
                    </TouchableOpacity>
                  </View>
                </Animatable.View>
              </TouchableWithoutFeedback>
            ))}
          </View>
        ))}
      </ScrollView>
      {successMessageVisible && (
        <Animatable.View
          animation="fadeInDown"
          duration={400}
          style={[styles.successToast, { backgroundColor: colors.success }]}
        >
          <Text style={[styles.successToastText, { color: colors.background }]}>
            Teacher deleted successfully!
          </Text>
        </Animatable.View>
      )}

      {showForm && (
        <AddTeacherForm
          visible={showForm}
          onClose={() => setShowForm(false)}
          onAdd={handleAddOrUpdateTeacher}
          initialData={editingTeacher}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: sHeight * 0.02,
    paddingHorizontal: sWidth * 0.03,
  },
  title: {
    fontSize: sWidth * 0.05,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: sHeight * 0.025,
    letterSpacing: 1.3,
  },
  addButton: {
    alignSelf: 'center',
    backgroundColor: '#0099ff',
    paddingVertical: sHeight * 0.01,
    paddingHorizontal: sWidth * 0.05,
    borderRadius: sWidth * 0.04,
    marginBottom: sHeight * 0.02,
    elevation: 5,
    shadowColor: '#0066cc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: sWidth * 0.04,
    fontWeight: '700',
  },
  section: {
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: sWidth * 0.045,
    fontWeight: '700',
    marginBottom: sHeight * 0.008,
    marginLeft: sWidth * 0.01,
    letterSpacing: 0.8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: sWidth * 0.04,
    minHeight: sHeight * 0.13,
    paddingVertical: sHeight * 0.019,
    paddingHorizontal: sWidth * 0.035,
    marginBottom: 15,
    shadowOpacity: 0.13,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    position: 'relative',
  },
  avatarContainer: {
    marginRight: sWidth * 0.045,
  },
  avatar: {
    // Overridden dynamically
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: sWidth * 0.075,
    fontWeight: '900',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: sWidth * 0.042,
    fontWeight: '700',
  },
  subject: {
    fontSize: sWidth * 0.04,
    fontWeight: '600',
    color: '#666',
  },
  contact: {
    fontSize: sWidth * 0.037,
    marginTop: 2,
  },
  qualification: {
    fontSize: sWidth * 0.038,
    marginTop: 4,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    position: 'absolute',
    right: sWidth * 0.01,
    top: sHeight * 0.01,
  },
  actionButton: {
    width: sWidth * 0.08,
    height: sWidth * 0.08,
    borderRadius: sWidth * 0.04,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successToast: {
    position: 'absolute',
    top: sHeight * 0.05,
    alignSelf: 'center',
    paddingVertical: sHeight * 0.015,
    paddingHorizontal: sWidth * 0.1,
    borderRadius: sWidth * 0.04,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: sWidth * 0.03,
    shadowOffset: { width: 0, height: sHeight * 0.008 },
    zIndex: 1000,
  },
  successToastText: {
    fontSize: sWidth * 0.045,
    fontWeight: '600',
    textAlign: 'center',
  },
});
