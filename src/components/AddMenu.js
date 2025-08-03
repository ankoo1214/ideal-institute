// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { useTheme } from '../theme/ThemeContext';
// import { sWidth, sHeight } from '../assets/utils';
// import { useDispatch } from 'react-redux';
// import { addBatch } from '../redux/slice/batchSlice'; // adjust path
// import BatchForm from '../components/BatchForm'; // adjust path
// import { insertTable } from '../db/insertTable'; // your SQLite insert function
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // import icon set
// import AddTeacherFrom from '../components/AddTeacherFrom';
// function AddMenu({ navigation }) {
//   const { colors } = useTheme();
//   const dispatch = useDispatch();

//   // Control batch form modal visibility
//   const [showAddBatchModal, setShowAddBatchModal] = useState(false);
//   const [showTeacherModal, setTeacherModal] = useState(false);
//   // List of add options
//   const options = [
//     { key: 'teachers', label: 'Add Teacher', screen: 'AddTeacher' },
//     // Instead of navigation, open the BatchForm modal here
//     { key: 'batches', label: 'Add Batch', screen: null },
//     // Add more options if needed
//   ];

//   // Handle press for buttons
//   const handlePress = option => {
//     if (option.key === 'batches') {
//       setShowAddBatchModal(true);
//     } else if (option.screen) {
//       navigation.navigate(option.screen);
//     }
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <Text style={[styles.title, { color: colors.text }]}>
//         What do you want to add?
//       </Text>

//       {options.map(option => (
//         <TouchableOpacity
//           key={option.key}
//           style={[styles.button, { backgroundColor: colors.accent }]}
//           onPress={() => handlePress(option)}
//           activeOpacity={0.8}
//         >
//           <Icon
//             name="plus-circle-outline"
//             size={sWidth * 0.06}
//             color={colors.buttonText}
//             style={styles.icon}
//           />
//           <Text style={[styles.buttonText, { color: colors.buttonText }]}>
//             {option.label}
//           </Text>
//         </TouchableOpacity>
//       ))}

//       {/* Batch form modal */}
//       <BatchForm
//         visible={showAddBatchModal}
//         onClose={() => setShowAddBatchModal(false)}
//         onAdd={async newBatch => {
//           dispatch(addBatch(newBatch)); // Update redux state
//           await insertTable('BATCHES', newBatch); // Persist in SQLite
//           setShowAddBatchModal(false); // Close modal
//         }}
//       />
//       <AddTeacherFrom />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: sWidth * 0.1,
//   },
//   title: {
//     fontSize: sWidth * 0.06,
//     fontWeight: '700',
//     marginBottom: sHeight * 0.04,
//     textAlign: 'center',
//   },
//   button: {
//     flexDirection: 'row', // Arrange icon and text horizontally
//     alignItems: 'center', // Vertically center icon & text
//     justifyContent: 'center', // Center contents in button
//     paddingVertical: sHeight * 0.02,
//     borderRadius: 12,
//     marginBottom: sHeight * 0.025,

//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,

//     elevation: 8,
//   },
//   icon: {
//     marginRight: sWidth * 0.04, // Space between icon and text
//   },
//   buttonText: {
//     fontSize: sWidth * 0.05,
//     fontWeight: '700',
//   },
// });

// export default AddMenu;
