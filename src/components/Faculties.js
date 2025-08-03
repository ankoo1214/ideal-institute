import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../theme/ThemeContext';
import AddTeacherForm from './AddTeacherForm';
import Icon from 'react-native-vector-icons/Ionicons';

const sWidth = Dimensions.get('window').width;
const sHeight = Dimensions.get('window').height;

const initialTeachers = [
  {
    fId: 't1',
    name: 'Dr. Ankita Mishra',
    subject: 'Mathematics',
    department: 'Science',
    email: 'ankita.mishra@example.com',
    phone: '9876543210',
    avatar: null,
    qualification: 'M.Sc Math',
  },
  {
    fId: 't2',
    name: 'Mr. Rohit Sharma',
    subject: 'English',
    department: 'Languages',
    email: 'rohit.sharma@example.com',
    phone: '9123456780',
    avatar: null,
  },
  // ... Your other initial teachers
];

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
  const animateRefs = useRef({});

  const [teachers, setTeachers] = useState(initialTeachers);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null); // null means add new

  const groupedTeachers = groupTeachersByDepartment(teachers);

  // Animations on press
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

  // Open form for adding new or editing teacher
  function openForm(forTeacher = null) {
    setEditingTeacher(forTeacher);
    setShowTeacherForm(true);
  }

  // When form submits, add or update teacher in list
  function handleAddOrUpdateTeacher(teacher) {
    setTeachers(prevTeachers => {
      const idx = prevTeachers.findIndex(t => t.fId === teacher.fId);
      if (idx >= 0) {
        // Update teacher
        const updated = [...prevTeachers];
        updated[idx] = teacher;
        return updated;
      }
      // Add new teacher
      return [teacher, ...prevTeachers];
    });
    setShowTeacherForm(false);
    setEditingTeacher(null);
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
          onPress: () => {
            setTeachers(prev => prev.filter(t => t.id !== id));
          },
        },
      ],
      { cancelable: true },
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.title, { color: colors.accent }]}>
          Our Faculties
        </Text>

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

        {/* Teacher List */}
        {Object.entries(groupedTeachers).map(([department, teacherList]) => (
          <View key={department} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {department}
            </Text>
            {teacherList.map((teacher, idx) => (
              <TouchableWithoutFeedback
                key={teacher.fId}
                onPressIn={() => onPressIn(teacher.id)}
                onPressOut={() => onPressOut(teacher.id)}
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
                        source={{ uri: teacher.avatar }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View
                        style={[
                          styles.avatarPlaceholder,
                          { backgroundColor: colors.accent },
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
                  {/* Edit and Delete Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      onPress={() => openForm(teacher)}
                      style={[
                        styles.actionButton,
                        { backgroundColor: '#4caf50' },
                      ]}
                    >
                      <Icon name="pencil" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteTeacher(teacher.id)}
                      style={[
                        styles.actionButton,
                        { backgroundColor: '#f44336', marginLeft: 8 },
                      ]}
                    >
                      <Icon name="trash" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </Animatable.View>
              </TouchableWithoutFeedback>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Add/Edit Teacher Modal */}
      {showTeacherForm && (
        <AddTeacherForm
          visible={showTeacherForm}
          onClose={() => setShowTeacherForm(false)}
          onAdd={handleAddOrUpdateTeacher}
          initialData={editingTeacher}
        />
      )}
    </>
  );
}

const CARD_HEIGHT = sHeight * 0.13;
const AVATAR_SIZE = CARD_HEIGHT * 0.62;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: sHeight * 0.02,
    paddingHorizontal: sWidth * 0.03,
  },
  title: {
    fontSize: sWidth * 0.08,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: sHeight * 0.025,
    letterSpacing: 1.3,
  },
  addButton: {
    alignSelf: 'center',
    backgroundColor: '#0099ff',
    paddingVertical: sHeight * 0.015,
    paddingHorizontal: sWidth * 0.1,
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
    fontSize: sWidth * 0.05,
    fontWeight: '700',
  },
  section: {
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: sWidth * 0.055,
    fontWeight: '700',
    marginBottom: sHeight * 0.008,
    marginLeft: sWidth * 0.01,
    letterSpacing: 0.8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: sWidth * 0.04,
    minHeight: CARD_HEIGHT,
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
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#777',
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
    fontSize: sWidth * 0.052,
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
    right: sWidth * 0.03,
    top: sHeight * 0.02,
  },
  actionButton: {
    width: sWidth * 0.08,
    height: sWidth * 0.08,
    borderRadius: sWidth * 0.04,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
