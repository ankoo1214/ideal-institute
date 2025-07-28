import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Image,
  Dimensions,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../theme/ThemeContext';

const sWidth = Dimensions.get('window').width;
const sHeight = Dimensions.get('window').height;

const teachersSample = [
  {
    id: 't1',
    name: 'Dr. Anjali Mehta',
    subject: 'Mathematics',
    department: 'Science',
    email: 'anjali.mehta@example.com',
    phone: '+91 9876543210',
    avatar: null, // Or provide a URL
  },
  {
    id: 't2',
    name: 'Mr. Rohit Sharma',
    subject: 'English',
    department: 'Languages',
    email: 'rohit.sharma@example.com',
    phone: '+91 9123456780',
    avatar: null,
  },
  {
    id: 't3',
    name: 'Ms. Sneha Patil',
    subject: 'Physics',
    department: 'Science',
    email: 'sneha.patil@example.com',
    phone: '+91 9988776655',
    avatar: null,
  },
  {
    id: 't4',
    name: 'Mrs. Kavita Joshi',
    subject: 'History',
    department: 'Social Studies',
    email: 'kavita.joshi@example.com',
    phone: '+91 9765432109',
    avatar: null,
  },
];

function groupTeachersByDepartment(data) {
  const grouped = {};
  data.forEach(teacher => {
    if (!grouped[teacher.department]) grouped[teacher.department] = [];
    grouped[teacher.department].push(teacher);
  });
  return grouped;
}

export default function Teachers() {
  const { colors } = useTheme();
  const animateRefs = useRef({});

  const groupedTeachers = groupTeachersByDepartment(teachersSample);

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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.accent }]}>Our Teachers</Text>
      {Object.entries(groupedTeachers).map(([department, teachers]) => (
        <View key={department} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {department}
          </Text>
          {teachers.map((teacher, idx) => (
            <TouchableWithoutFeedback
              key={teacher.id}
              onPressIn={() => onPressIn(teacher.id)}
              onPressOut={() => onPressOut(teacher.id)}
            >
              <Animatable.View
                ref={ref => (animateRefs.current[teacher.id] = ref)}
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
                        {teacher.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.info}>
                  <Text style={[styles.name, { color: colors.text }]}>
                    {teacher.name}
                  </Text>
                  <Text style={[styles.subject, { color: colors.placeholder }]}>
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
                </View>
              </Animatable.View>
            </TouchableWithoutFeedback>
          ))}
        </View>
      ))}
    </ScrollView>
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
  section: { marginBottom: 26 },
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
  },
  avatarContainer: {
    marginRight: sWidth * 0.045,
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: sWidth * 0.075,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  info: { flex: 1 },
  name: {
    fontSize: sWidth * 0.052,
    fontWeight: '700',
  },
  subject: {
    fontSize: sWidth * 0.042,
    fontWeight: '600',
    marginBottom: 2,
  },
  contact: {
    fontSize: sWidth * 0.037,
    marginTop: 2,
  },
});
