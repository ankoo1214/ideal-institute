import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Keyboard,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { sHeight, sWidth } from '../assets/utils';
import { fetchTable } from '../db/fetchTable';
import { dropStudentTable } from '../db/deleteTable';
import { setStudents, deleteStudent } from '../redux/slice/studentSlice';
import { deleteStudentFromDb } from '../db/deleteQuery';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import NetInfo from '@react-native-community/netinfo';
import {
  deleteStudentAsync,
  fetchStudentsAsync,
} from '../redux/thunk/studentThunk';
const classOptions = Array.from({ length: 8 }, (_, i) => `${i + 5}`);
const streamOptions = ['Science', 'Commerce', 'Arts'];

const sortOptions = [
  { label: 'Name (A - Z)', field: 'name', ascending: true },
  { label: 'Name (Z - A)', field: 'name', ascending: false },
  {
    label: 'Admission Date (Newest)',
    field: 'admissionDate',
    ascending: false,
  },
  { label: 'Admission Date (Oldest)', field: 'admissionDate', ascending: true },
];

export default function StudentList() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const students = useSelector(state => state.students) || [];
  const { colors } = useTheme();

  // States
  const [successMessageVisible, setSuccessMessageVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedStreams, setSelectedStreams] = useState([]);
  const [sortField, setSortField] = useState('name');
  const [sortAscending, setSortAscending] = useState(true);
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    student: null,
  });

  // Refs
  const keyboardDidHideListenerRef = useRef(null);

  // Fetch students from DB on mount and refresh
  useEffect(() => {
    checkNetwork();
    // dispatch(fetchStudentsAsync());
    loadStudents();

    // Cleanup keyboard listener
    keyboardDidHideListenerRef.current = Keyboard.addListener(
      'keyboardDidHide',
      () => setSortDropdownVisible(false),
    );
    return () =>
      keyboardDidHideListenerRef.current &&
      keyboardDidHideListenerRef.current.remove();
  }, []);
  useEffect(() => {}, []);

  const checkNetwork = async () => {
    const netState = await NetInfo.fetch();
    console.log('Net Status:>', netState);
    if (!netState.isConnected) {
      Alert.alert(
        'No Internet',
        'Please connect to the internet to properly use the app.',
      );
      return;
    }
  };
  async function loadStudents() {
    try {
      const storedStudents = await fetchTable('STUDENTS');

      console.log('Fetched Students:>', storedStudents);
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    loadStudents().finally(() => setRefreshing(false));
  };

  // Toggle multi-select filter
  function toggleSelection(value, selectedArray, setSelectedArray) {
    if (selectedArray.includes(value)) {
      setSelectedArray(selectedArray.filter(item => item !== value));
    } else {
      setSelectedArray([...selectedArray, value]);
    }
  }

  function clearFilters() {
    setSelectedClasses([]);
    setSelectedStreams([]);
    setSearchText('');
  }

  // Sorting handler
  function handleSelectSort(option) {
    setSortField(option.field);
    setSortAscending(option.ascending);
    setSortDropdownVisible(false);
  }

  // Filter + Search + Sort pipeline with memoization
  const filteredSortedStudents = useMemo(() => {
    let filtered = students;

    // Filter by search text
    if (searchText.trim().length > 0) {
      const lowerSearch = searchText.trim().toLowerCase();
      filtered = filtered.filter(
        s => s.name && s.name.toLowerCase().includes(lowerSearch),
      );
    }

    // Filter by selected classes
    if (selectedClasses.length > 0) {
      filtered = filtered.filter(s => selectedClasses.includes(s.class));
    }

    // Filter by selected streams
    if (selectedStreams.length > 0) {
      filtered = filtered.filter(s => selectedStreams.includes(s.stream));
    }

    // Sort filtered list
    filtered = [...filtered].sort((a, b) => {
      let valA, valB;
      if (sortField === 'name') {
        valA = a.name ? a.name.toLowerCase() : '';
        valB = b.name ? b.name.toLowerCase() : '';
      } else if (sortField === 'admissionDate') {
        valA = a.admissionDate ? new Date(a.admissionDate).getTime() : 0;
        valB = b.admissionDate ? new Date(b.admissionDate).getTime() : 0;
      } else {
        valA = '';
        valB = '';
      }
      if (valA < valB) return sortAscending ? -1 : 1;
      if (valA > valB) return sortAscending ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    students,
    searchText,
    selectedClasses,
    selectedStreams,
    sortField,
    sortAscending,
  ]);

  // Confirm & delete
  const confirmDelete = student => {
    setConfirmModal({ visible: true, student });
  };
  useEffect(() => {
    setLoading(true);
    dispatch(fetchStudentsAsync()).finally(() => {
      setLoading(false);
    });
  }, []);

  async function doDelete() {
    const student = confirmModal.student;
    if (!student) return;

    try {
      await deleteStudentFromDb(student.id);
      dispatch(deleteStudentAsync(student.id));
      dispatch(fetchStudentsAsync());
      setSuccessMessageVisible(true);

      setTimeout(() => setSuccessMessageVisible(false), 2000); // hide after 2s
    } catch (error) {
      console.error('Delete failed:', error);
    }
    setConfirmModal({ visible: false, student: null });
  }

  const handleEdit = student => {
    navigation.navigate('EditStudent', { student });
  };

  // Render each student item row
  function renderItem({ item, index }) {
    const remainingFees =
      (parseFloat(item.totalFees) || 0) -
      (item.submittedFees
        ? item.submittedFees.reduce((acc, fee) => acc + (fee.amount || 0), 0)
        : 0);

    return (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 70}
        duration={450}
        style={[
          styles.itemContainer,
          { backgroundColor: colors.card, shadowColor: colors.border },
        ]}
        useNativeDriver
      >
        <View style={styles.infoActionWrap}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => handleEdit(item)}
            activeOpacity={0.7}
          >
            <Text style={[styles.name, { color: colors.text }]}>
              {item.name || '-'}
            </Text>
            <Text style={{ color: colors.text }}>
              Class: {item.class || '-'}
            </Text>
            <Text style={{ color: colors.text }}>
              Stream: {item.stream || '-'}
              {item.stream === 'Science' && item.scienceGroup
                ? ` (${item.scienceGroup})`
                : ''}
            </Text>
            <Text style={{ color: colors.text }}>
              Phone: {item.phone || '-'}
            </Text>
            <Text style={{ color: colors.text }}>
              Total Fees: ₹{item.totalFees || '0'}
            </Text>
            <Text style={{ color: colors.text }}>
              Remaining: ₹{remainingFees.toFixed(2)}
            </Text>
            {item.submittedFees && item.submittedFees.length > 0 && (
              <>
                <Text
                  style={{
                    color: colors.text,
                    marginTop: 6,
                    fontWeight: '600',
                  }}
                >
                  Submitted Fees:
                </Text>
                {item.submittedFees.map((fee, idx) => (
                  <Text key={idx} style={{ color: colors.text }}>
                    ₹{fee.amount} on {fee.date}
                  </Text>
                ))}
              </>
            )}
          </TouchableOpacity>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => handleEdit(item)}
              style={styles.editButton}
              activeOpacity={0.7}
            >
              <Icon
                name="pencil-outline"
                size={sWidth * 0.055}
                color={colors.accent}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => confirmDelete(item)}
              style={styles.deleteButton}
              activeOpacity={0.7}
            >
              <Icon
                name="delete-outline"
                size={sWidth * 0.055}
                color={colors.error}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animatable.View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { borderColor: colors.border, backgroundColor: colors.card },
        ]}
      >
        <Icon name="magnify" size={24} color={colors.placeholder} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by name"
          placeholderTextColor={colors.placeholder}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
        />
        {(searchText.length > 0 ||
          selectedClasses.length > 0 ||
          selectedStreams.length > 0) && (
          <TouchableOpacity
            onPress={() => {
              setSearchText('');
              clearFilters();
            }}
          >
            <Icon name="close-circle" size={22} color={colors.placeholder} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter & Sort Bar */}
      <View
        style={[
          styles.filterSortBar,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={styles.filterSortButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Icon name="filter-outline" size={22} color={colors.accent} />
          <Text style={[styles.filterSortText, { color: colors.accent }]}>
            Filter
          </Text>
          {selectedClasses.length + selectedStreams.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {selectedClasses.length + selectedStreams.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: 'flex-end', position: 'relative' }}>
          <TouchableOpacity
            style={styles.filterSortButton}
            onPress={() => setSortDropdownVisible(v => !v)}
          >
            <Icon name="sort" size={22} color={colors.accent} />
            <Text style={[styles.filterSortText, { color: colors.accent }]}>
              {
                sortOptions.find(
                  o => o.field === sortField && o.ascending === sortAscending,
                )?.label
              }
            </Text>
          </TouchableOpacity>

          {/* Sort dropdown - Absolute overlay */}
          {sortDropdownVisible && (
            <Modal transparent animationType="fade">
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => setSortDropdownVisible(false)}
              >
                <Animatable.View
                  animation="fadeInDown"
                  duration={220}
                  style={[
                    styles.sortDropdown,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      marginTop: sHeight * 0.218, // adjust this value to position dropdown vertically
                      alignSelf: 'flex-end',
                      marginRight: sHeight * 0.022,
                    },
                  ]}
                >
                  {sortOptions.map(opt => (
                    <TouchableOpacity
                      key={opt.label}
                      style={[
                        styles.sortOption,
                        sortField === opt.field &&
                          sortAscending === opt.ascending &&
                          styles.sortOptionSelected,
                      ]}
                      onPress={() => {
                        handleSelectSort(opt);
                        setSortDropdownVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.sortOptionText,
                          sortField === opt.field &&
                          sortAscending === opt.ascending
                            ? { color: colors.accent, fontWeight: '700' }
                            : { color: colors.text },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </Animatable.View>
              </TouchableOpacity>
            </Modal>
          )}
        </View>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setFilterModalVisible(false)}
          style={styles.modalOverlay}
        >
          <Animatable.View
            animation="fadeInUp"
            duration={350}
            style={[styles.filterModal, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.filterTitle, { color: colors.text }]}>
              Filter by Class
            </Text>
            <View style={styles.optionsRow}>
              {classOptions.map(cls => (
                <TouchableOpacity
                  key={cls}
                  style={[
                    styles.filterOption,
                    selectedClasses.includes(cls) && {
                      backgroundColor: colors.accent,
                    },
                  ]}
                  onPress={() =>
                    toggleSelection(cls, selectedClasses, setSelectedClasses)
                  }
                >
                  <Text
                    style={
                      ([
                        styles.filterOptionText,
                        selectedClasses.includes(cls) && {
                          color: colors.buttonText,
                        },
                      ],
                      { color: colors.text })
                    }
                  >
                    {cls}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text
              style={[
                styles.filterTitle,
                { color: colors.text, marginTop: 20 },
              ]}
            >
              Filter by Stream
            </Text>
            <View style={styles.optionsRow}>
              {streamOptions.map(stream => (
                <TouchableOpacity
                  key={stream}
                  style={[
                    styles.filterOption,
                    selectedStreams.includes(stream) && {
                      backgroundColor: colors.accent,
                    },
                  ]}
                  onPress={() =>
                    toggleSelection(stream, selectedStreams, setSelectedStreams)
                  }
                >
                  <Text
                    style={
                      ([
                        styles.filterOptionText,
                        selectedStreams.includes(stream) && {
                          color: colors.buttonText,
                        },
                      ],
                      { color: colors.text })
                    }
                  >
                    {stream}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.accent }]}
              onPress={() => setFilterModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.applyButtonText, { color: colors.text }]}>
                Apply Filters
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        </TouchableOpacity>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        visible={confirmModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setConfirmModal({ visible: false, student: null })
        }
      >
        <View style={styles.modalCenterer}>
          <Animatable.View
            animation="bounceIn"
            duration={350}
            style={[styles.confirmModalCard, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.confirmModalTitle, { color: colors.text }]}>
              Delete Student
            </Text>
            <Text style={[styles.confirmModalMsg, { color: colors.text }]}>
              Are you sure you want to delete "{confirmModal.student?.name}"?
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                onPress={() =>
                  setConfirmModal({ visible: false, student: null })
                }
              >
                <Text
                  style={[
                    styles.confirmModalCancel,
                    { color: colors.placeholder },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={doDelete}>
                <Text
                  style={[styles.confirmModalDelete, { color: colors.error }]}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </View>
      </Modal>
      {successMessageVisible && (
        <Animatable.View
          animation="fadeInDown"
          duration={400}
          style={[styles.toastContainer, { backgroundColor: colors.success }]}
        >
          <Text style={[styles.toastText, { color: colors.background }]}>
            Student deleted successfully!
          </Text>
        </Animatable.View>
      )}

      {/* Student List */}
      {loading ? (
        <View
          style={[
            styles.loaderContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : filteredSortedStudents.length === 0 ? (
        <View
          style={[
            styles.emptyContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.emptyText, { color: colors.placeholder }]}>
            No students found.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSortedStudents}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : `no-id-${index}`
          }
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContainer,
            { backgroundColor: colors.background },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        />
      )}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },

  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: sWidth * 0.04,
    paddingVertical: sHeight * 0.005,
    margin: sWidth * 0.05,
    borderRadius: sWidth * 0.04,
    borderWidth: 1,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: sWidth * 0.02,
    fontSize: sWidth * 0.045,
  },

  filterSortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: sWidth * 0.05,
    marginBottom: sWidth * 0.025,
    paddingHorizontal: sWidth * 0.04,
    paddingVertical: sHeight * 0.012,
    borderRadius: 10,
  },
  filterSortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterSortText: {
    fontSize: sWidth * 0.042,
    marginLeft: sWidth * 0.018,
  },

  badge: {
    backgroundColor: '#d43a3a',
    borderRadius: sWidth * 0.025,
    paddingHorizontal: sWidth * 0.018,
    paddingVertical: sHeight * 0.003,
    marginLeft: sWidth * 0.015,
    minWidth: sWidth * 0.06,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontWeight: '700',
    fontSize: sWidth * 0.035,
  },

  sortDropdown: {
    marginTop: sHeight * 0.009,
    width: sWidth * 0.4,
    borderRadius: sWidth * 0.024,
    borderWidth: 1,
    elevation: 6,
    zIndex: 50,
    alignSelf: 'flex-end',
    paddingVertical: sHeight * 0.008,
    position: 'absolute',
  },
  sortOption: {
    paddingVertical: sHeight * 0.012,
    paddingHorizontal: sWidth * 0.04,
    borderRadius: sWidth * 0.027,
  },
  sortOptionSelected: {
    // backgroundColor: '#f0f8ff',
  },
  sortOptionText: {
    fontSize: sWidth * 0.035,
    color: '#444',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'flex-end',
  },
  filterModal: {
    borderTopRightRadius: sWidth * 0.04,
    borderTopLeftRadius: sWidth * 0.04,
    padding: sWidth * 0.05,
    maxHeight: sHeight * 0.6,
  },
  filterTitle: {
    fontSize: sWidth * 0.048,
    fontWeight: '700',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: sHeight * 0.012,
  },
  filterOption: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: sWidth * 0.03,
    paddingHorizontal: sWidth * 0.04,
    paddingVertical: sHeight * 0.014,
    marginRight: sWidth * 0.03,
    marginBottom: sHeight * 0.015,
  },
  filterOptionText: {
    fontSize: sWidth * 0.043,
    fontWeight: '600',
  },

  applyButton: {
    marginTop: sHeight * 0.025,
    paddingVertical: sHeight * 0.022,
    borderRadius: sWidth * 0.03,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: sWidth * 0.045,
    fontWeight: '700',
  },

  listContainer: {
    paddingHorizontal: sWidth * 0.05,
    paddingBottom: sHeight * 0.03,
  },
  itemContainer: {
    marginBottom: sHeight * 0.02,
    borderRadius: sWidth * 0.03,
    padding: sWidth * 0.04,
    elevation: 4,
    shadowRadius: sWidth * 0.02,
    shadowOpacity: 0.15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sHeight * 0.003 },
  },

  infoActionWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  name: {
    fontWeight: 'bold',
    fontSize: sWidth * 0.05,
    marginBottom: sHeight * 0.008,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',

    alignSelf: 'flex-start',
  },
  editButton: {
    // marginRight: sWidth * 0.03,
    padding: sWidth * 0.014,
  },
  deleteButton: {
   marginLeft: sWidth * 0.01,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: sWidth * 0.1,
  },
  emptyText: {
    fontSize: sWidth * 0.045,
    color: '#888',
  },

  modalCenterer: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalCard: {
    width: '80%',
    padding: sWidth * 0.06,
    borderRadius: sWidth * 0.035,
    elevation: 7,
  },
  confirmModalTitle: {
    fontSize: sWidth * 0.055,
    fontWeight: 'bold',
    marginBottom: sHeight * 0.018,
  },
  confirmModalMsg: {
    fontSize: sWidth * 0.046,
    marginBottom: sHeight * 0.026,
  },
  confirmModalCancel: {
    fontSize: sWidth * 0.045,
    color: '#888',
    marginRight: sWidth * 0.045,
  },
  confirmModalDelete: {
    fontSize: sWidth * 0.047,
    color: '#d32f2f',
    fontWeight: '700',
  },
  toastContainer: {
    position: 'absolute',
    top: sHeight * 0.5,
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
  toastText: {
    fontSize: sWidth * 0.045,
    fontWeight: '600',
    textAlign: 'center',
  },
});
