// CustomDropdown.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { sHeight, sWidth } from '../assets/utils';
export default function CustomTSDropdown({
  label,
  data,
  selectedValue,
  onValueChange,
  placeholder,
  colors,

  style,
}) {
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const [modalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredData(data);
    } else {
      const ft = searchText.trim().toLowerCase();
      setFilteredData(data.filter(d => d.toLowerCase().includes(ft)));
    }
  }, [searchText, data]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={customStyles.dropdownItem(sWidth, colors)}
      onPress={() => {
        onValueChange(item);
        setModalVisible(false);
        setSearchText('');
        Keyboard.dismiss();
      }}
      activeOpacity={0.6}
    >
      <Text
        style={[
          customStyles.itemText(sWidth, colors),
          item === selectedValue ? { fontWeight: '700' } : null,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[customStyles.container, style]}>
      {/* {label && (
        <Text
          style={customStyles.label(sWidth, colors)}
          onPress={() => {
            setModalVisible(true);
          }}
        >
          {label}
        </Text>
      )} */}

      <TouchableOpacity
        style={customStyles.dropdownButton(sWidth, colors)}
        onPress={() => {
          Keyboard.dismiss();
          setModalVisible(true);
          console.log('Modal Opened');
        }}
        activeOpacity={0.8}
      >
        <Text
          style={[
            customStyles.selectedText(sWidth, colors),
            !selectedValue ? { color: colors.placeholder } : null,
          ]}
        >
          {selectedValue || placeholder || 'Select...'}
        </Text>
        <Icon
          name="menu-down"
          size={sWidth * 0.06}
          color={colors.placeholder}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View
            style={[
              customStyles.modalOverlay,
              { paddingHorizontal: sWidth * 0.05 },
            ]}
          >
            <TouchableWithoutFeedback>
              <View
                style={customStyles.modalContainer(sWidth, sHeight, colors)}
              >
                <TextInput
                  placeholder="Search..."
                  placeholderTextColor={colors.placeholder}
                  style={customStyles.searchInput(sWidth, colors)}
                  value={searchText}
                  onChangeText={setSearchText}
                  autoFocus
                  clearButtonMode="while-editing"
                />
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  style={{ maxHeight: sHeight * 0.4 }}
                >
                  {filteredData.length === 0 ? (
                    <Text style={customStyles.emptyText(sWidth, colors)}>
                      No items found
                    </Text>
                  ) : (
                    filteredData.map((item, idx) => (
                      <TouchableOpacity
                        key={`${item}-${idx}`}
                        style={customStyles.dropdownItem(sWidth, colors)}
                        onPress={() => {
                          onValueChange(item);
                          setModalVisible(false);
                          setSearchText('');
                          Keyboard.dismiss();
                        }}
                        activeOpacity={0.6}
                      >
                        <Text
                          style={[
                            customStyles.itemText(sWidth, colors),
                            item === selectedValue
                              ? { fontWeight: '700' }
                              : null,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const customStyles = StyleSheet.create({
  container: {
    // marginBottom: 18,
  },
  label: (sWidth, colors) => ({
    // fontSize: sWidth * 0.04,
    fontWeight: '600',
    marginBottom: sWidth * 0.015,
    color: colors.text,
  }),
  dropdownButton: (sWidth, colors) => ({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: sWidth * 0.03,
    paddingHorizontal: sWidth * 0.04,
    paddingVertical: sWidth * 0.035,
    borderColor: colors.border,
    color: colors.text,
  }),
  selectedText: (sWidth, colors) => ({
    fontSize: sWidth * 0.045,
    color: colors.text,
  }),
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000044',
    justifyContent: 'center',
  },
  modalContainer: (sWidth, sHeight, colors) => ({
    maxHeight: sHeight * 0.5,
    backgroundColor: colors.card,
    borderRadius: sWidth * 0.04,
    paddingVertical: sWidth * 0.04,
    paddingHorizontal: sWidth * 0.03,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: sWidth * 0.02,
    shadowOffset: { width: 0, height: sWidth * 0.012 },
  }),
  searchInput: (sWidth, colors) => ({
    height: sHeight * 0.05,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    color: colors.text,
    fontSize: sWidth * 0.043,
    paddingHorizontal: sWidth * 0.025,
    marginBottom: sWidth * 0.035,
  }),
  dropdownItem: (sWidth, colors) => ({
    paddingVertical: sHeight * 0.013,
    paddingHorizontal: sWidth * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  }),
  itemText: (sWidth, colors) => ({
    fontSize: sWidth * 0.045,
    color: colors.text,
  }),
  emptyText: (sWidth, colors) => ({
    fontSize: sWidth * 0.045,
    color: colors.placeholder,
    textAlign: 'center',
    paddingVertical: sHeight * 0.02,
  }),
});
