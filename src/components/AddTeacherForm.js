// AddTeacherForm.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../theme/ThemeContext';
import { sWidth, sHeight } from '../assets/utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomTSDropdown from '../components/CustomTSDropdown';

export default function AddTeacherForm({
  visible = true,
  onClose,
  onAdd,
  initialData = null,
}) {
  const { colors } = useTheme();

  // Dropdown options with "Other"
  const [subjectOptions, setSubjectOptions] = useState([
    'Mathematics',
    'Physics',
    'Chemistry',
    'English',
    'History',
    'Other',
  ]);
  const [departmentOptions, setDepartmentOptions] = useState([
    'Science',
    'Commerce',
    'Languages',
    'Social Studies',
    'Arts',
    'Physical Education',
    'Other',
  ]);
  const [schoolOptions, setSchoolOptions] = useState([
    'Central High School',
    'Greenwood Academy',
    'Riverdale Public School',
    'Maple Leaf',
    'Sunnyvale School',
    'Oakridge International',
    'Springfield High',
    'Hilltop School',
    'Cedar Valley',
    'Lakeside Academy',
    'Riverside High',
    'Eastwood School',
    'Westgate',
    'Northfield',
    'Southside',
    'Pinecrest School',
    'Brookfield',
    'Kingsway Academy',
    'Stonebridge',
    'Meadowbrook',
    'Evergreen High',
    'Summit Academy',
    'Willow Creek',
    'Silver Lake',
    'Highland School',
    'Valley View',
    'Crestwood',
    'Elmwood School',
    'Shadow Hills',
    'Parkview Academy',
    'Other',
  ]);
  const [qualificationOptions, setQualificationOptions] = useState([
    // School-level
    'Higher Secondary (10+2)',

    // Engineering - Bachelor of Engineering (B.E.) and B.Tech Streams
    'B.Tech - Computer Science Engineering (CSE)',
    'B.Tech - Information Technology (IT)',
    'B.Tech - Electronics & Communication Engineering (ECE)',
    'B.Tech - Electrical Engineering (EE)',
    'B.Tech - Mechanical Engineering (ME)',
    'B.Tech - Civil Engineering',
    'B.Tech - Chemical Engineering',
    'B.Tech - Aerospace Engineering',
    'B.Tech - Biotechnology',
    'B.Tech - Petroleum Engineering',
    'B.Tech - Production Engineering',
    'B.Tech - Agricultural Engineering',
    'B.Tech - Automobile Engineering',
    'B.Tech - Mining Engineering',
    'B.Tech - Metallurgical Engineering',
    'B.Tech - Textile Engineering',
    'B.E. - Computer Science Engineering (CSE)',
    'B.E. - Electronics & Communication Engineering (ECE)',
    'B.E. - Electrical Engineering',
    'B.E. - Mechanical Engineering',
    'B.E. - Civil Engineering',
    'B.E. - Chemical Engineering',
    'B.E. - Information Technology',
    'B.E. - Instrumentation & Control Engineering',
    'B.E. - Automobile Engineering',
    'B.E. - Production Engineering',
    'B.E. - Metallurgical Engineering',
    'B.E. - Aerospace Engineering',

    // BBA specializations
    'BBA - General',
    'BBA - Finance',
    'BBA - Marketing',
    'BBA - Human Resource Management',
    'BBA - Tourism & Hospitality',
    'BBA - International Business',
    'BBA - Entrepreneurship',
    'BBA - Banking & Insurance',
    'BBA - Computer Applications',
    'BBA - Logistics',

    // MBA specializations
    'MBA - General',
    'MBA - Finance',
    'MBA - Marketing',
    'MBA - Human Resources',
    'MBA - International Business',
    'MBA - Operations Management',
    'MBA - Information Technology',
    'MBA - Business Analytics',
    'MBA - Entrepreneurship',
    'MBA - Supply Chain Management',
    'MBA - Healthcare & Hospital Management',
    'MBA - Rural Management',
    'MBA - Retail Management',
    'MBA - Event Management',
    'MBA - Agri-Business',

    // Bachelor of Commerce (B.Com) and major specializations
    'B.Com - General',
    'B.Com - Accounting & Finance',
    'B.Com - Banking & Insurance',
    'B.Com - Computer Applications',
    'B.Com - Corporate Secretaryship',
    'B.Com - Taxation',
    'B.Com - Economics',
    'B.Com - Foreign Trade',
    'B.Com - Marketing Management',
    'B.Com - E-Commerce',
    'B.Com - Travel & Tourism Management',
    'B.Com - Business Analytics',

    // Master of Commerce (M.Com) and major specializations
    'M.Com - General',
    'M.Com - Accounting & Finance',
    'M.Com - Banking & Insurance',
    'M.Com - E-Commerce',
    'M.Com - Financial Management',
    'M.Com - International Business',
    'M.Com - Taxation',
    'M.Com - Corporate Secretaryship',
    'M.Com - Business Analytics',

    // General Bachelors
    'B.Sc. - Physics',
    'B.Sc. - Chemistry',
    'B.Sc. - Mathematics',
    'B.Sc. - Computer Science',
    'B.Sc. - Biology',
    'BCA (Bachelor of Computer Applications)',
    'B.A.',
    'BFA',
    'B.Ed.',
    'B.Arch',
    'LLB',
    'MBBS',
    'BDS',
    'B.Pharm',
    'BHM',

    // Paramedical & AYUSH
    'B.Sc. Nursing',
    'BPT (Physiotherapy)',
    'BMLT (Medical Lab Technology)',
    'BAMS (Ayurveda)',
    'BHMS (Homeopathy)',
    'BUMS (Unani)',
    'BNYS (Yoga & Naturopathy)',

    // Polytechnic/Diploma/ITI
    'Diploma - Computer Engineering',
    'Diploma - Civil Engineering',
    'Diploma - Mechanical Engineering',
    'Diploma - Electrical Engineering',
    'Diploma - Electronics Engineering',
    'Diploma - Chemical Engineering',
    'Diploma in Education (D.Ed.)',
    'Diploma in Nursing',
    'Diploma in Pharmacy',
    'Diploma in Financial Accounting',
    'Diploma in Graphic Design',
    'ITI - Electrician',
    'ITI - Fitter',
    'ITI - Welder',
    'ITI - Draughtsman Civil',
    'ITI - Mechanic Motor Vehicle',
    'ITI - COPA (Computer Operator)',

    // Master's & PG
    'M.Sc. - Physics',
    'M.Sc. - Chemistry',
    'M.Sc. - Mathematics',
    'M.Sc. - Computer Science',
    'M.Sc. - Biology',
    'M.Com',
    'MA - English',
    'MA - Economics',
    'MA - Hindi',
    'M.Ed.',
    'MCA (Master of Computer Applications)',
    'M.Tech - Computer Science',
    'M.Tech - Mechanical Engineering',
    'M.Tech - Civil Engineering',
    'M.Tech - Electronics & Communication',
    'M.Tech - Electrical Engineering',
    'LLM',

    // Research & Doctoral
    'Ph.D. - Engineering',
    'Ph.D. - Science',
    'Ph.D. - Management',
    'Ph.D. - Commerce',
    'Ph.D. - Law',
    'D.Litt.',
    'D.Sc.',

    // Professional
    'CA (Chartered Accountant)',
    'CS (Company Secretary)',
    'CMA (Cost & Management Accountant)',
    'PGDM - Management',
    'PG Diploma in Data Science',
    'PG Diploma in Business Analytics',
    'PG Diploma in Child Psychology',
    'PG Diploma in Early Childhood Education',
    'PG Diploma in Journalism',
    'PG Diploma in Finance',

    // Vocational and Modern/Skill Courses
    'Certificate - Data Analytics',
    'Certificate - Web Development',
    'Certificate - Mobile App Development',
    'Certificate - Digital Marketing',
    'Certificate - Yoga Instructor',
    'Certificate - Teaching Skills',
    'Certificate - Animation',
    'Certificate - Hospitality Management',
    'Certificate - Fashion Design',

    // Others
    'Advanced Diploma',
    'General Diploma',
    'General Certificate',
    'Post Doctoral Fellowship',
    'Other',
  ]);

  // Form states
  const [name, setName] = useState('');
  const [subject, setSubject] = useState(null);
  const [department, setDepartment] = useState(null);
  const [school, setSchool] = useState(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUri, setAvatarUri] = useState(null);
  const [qualification, setQualification] = useState(null);
  // State for controlling "Add other" modal
  const [addOtherVisible, setAddOtherVisible] = useState(false);
  const [addOtherType, setAddOtherType] = useState(null);
  const [addOtherValue, setAddOtherValue] = useState('');
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSubject(initialData.subject || null);
      setDepartment(initialData.department || null);
      setSchool(initialData.school || null);
      setQualification(initialData.qualification || null);
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setAvatarUri(initialData.avatar || null);
    }
  }, [initialData]);
  // Image picker handler
  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.6 }, response => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert('Image Error', response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setAvatarUri(response.assets[0].uri);
      }
    });
  };

  const handleAddOther = () => {
    if (!addOtherValue.trim()) {
      Alert.alert('Required', 'Please enter a value.');
      return;
    }
    const trimmed = addOtherValue.trim();
    if (addOtherType === 'subject') {
      if (!subjectOptions.includes(trimmed)) {
        setSubjectOptions([...subjectOptions.slice(0, -1), trimmed, 'Other']);
      }
      setSubject(trimmed);
    } else if (addOtherType === 'department') {
      if (!departmentOptions.includes(trimmed)) {
        setDepartmentOptions([
          ...departmentOptions.slice(0, -1),
          trimmed,
          'Other',
        ]);
      }
      setDepartment(trimmed);
    } else if (addOtherType === 'school') {
      if (!schoolOptions.includes(trimmed)) {
        setSchoolOptions([...schoolOptions.slice(0, -1), trimmed, 'Other']);
      }
      setSchool(trimmed);
    } else if (addOtherType === 'qualification') {
      // ADD THIS BRANCH
      if (!qualificationOptions.includes(trimmed)) {
        setQualificationOptions([
          ...qualificationOptions.slice(0, -1),
          trimmed,
          'Other',
        ]);
      }
      setQualification(trimmed);
    }
    setAddOtherVisible(false);
    setAddOtherValue('');
  };

  // When dropdown changes value
  const handleDropdownChange = (type, value) => {
    if (value === 'Other') {
      setAddOtherType(type);
      setAddOtherValue('');
      setAddOtherVisible(true);
    } else {
      if (type === 'subject') setSubject(value);
      else if (type === 'department') setDepartment(value);
      else if (type === 'school') setSchool(value);
      else if (type === 'qualification') setQualification(value); // ADD THIS
    }
  };
  function generateRandomID() {
    const prefix = 'F';
    const randomNumber = Math.floor(100 + Math.random() * 900); // random number 100-999
    return prefix + randomNumber;
  }

  const handleSubmit = () => {
    if (!name.trim() || !subject || !department || !school) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    const teacherId = initialData ? initialData.id : generateRandomID();
    const newTeacher = {
      fId: teacherId,
      name: name.trim(),
      subject: subject.trim(),
      department: department.trim(),
      school: school.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatar: avatarUri || null,
      qualification: qualification.trim(),
    };
    onAdd && onAdd(newTeacher);

    // Reset form
    setName('');
    setSubject(null);
    setDepartment(null);
    setSchool(null);
    setEmail('');
    setPhone('');
    setQualification('');
    setAvatarUri(null);
  };

  if (!visible) return null;

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide" // or 'fade'
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={[styles.header, { color: colors.accent }]}>
                {initialData ? 'Edit Teacher' : 'Add Teacher'}
              </Text>

              <TouchableOpacity
                style={[styles.avatarPick, { borderColor: colors.border }]}
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={{ color: colors.placeholder, fontSize: 40 }}>
                    +
                  </Text>
                )}
              </TouchableOpacity>
              <Text style={styles.avatarLabel}>Tap to add image</Text>

              <TextInput
                style={[
                  styles.input,
                  { borderColor: colors.border, color: colors.text },
                ]}
                placeholder="Name *"
                placeholderTextColor={colors.placeholder}
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={[
                  styles.input,
                  { borderColor: colors.border, color: colors.text },
                ]}
                placeholder="Email"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={[
                  styles.input,
                  { borderColor: colors.border, color: colors.text },
                ]}
                placeholder="Phone"
                placeholderTextColor={colors.placeholder}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <CustomTSDropdown
                label="Subject *"
                data={subjectOptions}
                selectedValue={subject}
                onValueChange={val => handleDropdownChange('subject', val)}
                colors={colors}
                sWidth={sWidth}
                sHeight={sHeight}
                placeholder="Select subject"
                style={{ marginBottom: sHeight * 0.012, width: '100%' }}
              />

              <CustomTSDropdown
                label="Department *"
                data={departmentOptions}
                selectedValue={department}
                onValueChange={val => handleDropdownChange('department', val)}
                colors={colors}
                sWidth={sWidth}
                sHeight={sHeight}
                placeholder="Select department"
                style={{ marginBottom: sHeight * 0.012, width: '100%' }}
              />

              <CustomTSDropdown
                label="School *"
                data={schoolOptions}
                selectedValue={school}
                onValueChange={val => handleDropdownChange('school', val)}
                colors={colors}
                sWidth={sWidth}
                sHeight={sHeight}
                placeholder="Select school"
                style={{ marginBottom: sHeight * 0.012, width: '100%' }}
              />

              <CustomTSDropdown
                label="Qualification*"
                data={qualificationOptions}
                selectedValue={qualification}
                onValueChange={val =>
                  handleDropdownChange('qualification', val)
                }
                colors={colors}
                sWidth={sWidth}
                sHeight={sHeight}
                placeholder="Select Qualification"
                style={{ marginBottom: sHeight * 0.012, width: '100%' }}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.accent }]}
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.buttonText, { color: colors.buttonText }]}
                  >
                    {initialData ? 'Save' : 'Add'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.error }]}
                  onPress={() => {
                    setName('');
                    setSubject(null);
                    setDepartment(null);
                    setSchool(null);
                    setQualification('');
                    setEmail('');
                    setPhone('');
                    setAvatarUri(null);
                    onClose && onClose();
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.buttonText, { color: colors.buttonText }]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          <Modal
            visible={addOtherVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setAddOtherVisible(false)}
          >
            <TouchableWithoutFeedback onPress={() => setAddOtherVisible(false)}>
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
                      Enter new {addOtherType}
                    </Text>
                    <TextInput
                      style={[
                        modalStyles.modalInput,
                        { borderColor: colors.border, color: colors.text },
                      ]}
                      placeholder={`New ${addOtherType}`}
                      placeholderTextColor={colors.placeholder}
                      value={addOtherValue}
                      onChangeText={setAddOtherValue}
                      autoFocus
                      onSubmitEditing={handleAddOther}
                    />
                    <View style={modalStyles.modalButtons}>
                      <TouchableOpacity
                        onPress={() => setAddOtherVisible(false)}
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
                        onPress={handleAddOther}
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
        </View>
      </Modal>
    </>
  );
}

const AVATAR_SIZE = sWidth * 0.2;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // dim backdrop
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: sHeight * 0.85,
    borderTopLeftRadius: sWidth * 0.08, // Curve top border
    borderTopRightRadius: sWidth * 0.08,
    padding: sWidth * 0.06,
    backgroundColor: 'white', // w
  },
  scrollContainer: {
    paddingBottom: sHeight * 0.06,
    alignItems: 'center',
  },
  header: {
    fontSize: sWidth * 0.07,
    fontWeight: '900',
    marginBottom: sHeight * 0.02,
    textAlign: 'center',
  },
  avatarPick: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#e4eaf7',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 2,
    marginBottom: sHeight * 0.012,
    overflow: 'hidden',
  },
  avatarLabel: {
    marginBottom: sHeight * 0.012,
    fontSize: 16,
    color: '#777',
    alignSelf: 'center',
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  input: {
    height: sHeight * 0.065,
    borderWidth: 1,
    borderRadius: sWidth * 0.03,
    paddingHorizontal: sWidth * 0.03,
    marginBottom: sHeight * 0.018,
    fontSize: sWidth * 0.045,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: sHeight * 0.04,
  },
  button: {
    flex: 1,
    padding: sWidth * 0.035,
    borderRadius: sWidth * 0.04,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: sWidth * 0.015,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sWidth * 0.014 },
    shadowOpacity: 0.18,
    shadowRadius: sWidth * 0.04,
    elevation: 6,
  },
  buttonText: {
    fontWeight: '700',
    fontSize: sWidth * 0.047,
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
