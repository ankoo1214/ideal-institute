import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Keyboard,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';

import {
  setBatches,
  updateBatch,
  addBatch,
  deleteBatch,
} from '../redux/slice/batchSlice';
import { createTable } from '../db/createTable';
import { insertTable } from '../db/insertTable';
import { fetchTable } from '../db/fetchTable';
import { useTheme } from '../theme/ThemeContext';
import { sWidth, sHeight } from '../assets/utils';
import BatchForm from './BatchForm';

function groupBatches(data) {
  const grouped = {};
  data.forEach(batch => {
    if (!grouped[batch.class]) grouped[batch.class] = {};
    const grp =
      batch.class === '11' || batch.class === '12'
        ? batch.stream || 'Other'
        : 'All';
    if (!grouped[batch.class][grp]) grouped[batch.class][grp] = [];
    grouped[batch.class][grp].push(batch);
  });
  return grouped;
}

export default function Batches() {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const batches = useSelector(state => state.batches) || [];
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);

  const animateRefs = useRef({});

  useEffect(() => {
    createTable('BATCHES').then(loadBatches);
  }, []);

  async function loadBatches() {
    const rows = await fetchTable('BATCHES');
    dispatch(setBatches(rows));
  }

  function startEdit(batch) {
    setEditingId(batch.id);
    setEditForm({ ...batch });
  }

  function handleEditField(field, value) {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }

  async function saveEdit(id) {
    const changes = { ...editForm, id };
    dispatch(updateBatch({ id, changes }));
    await insertTable('BATCHES', changes);
    setEditingId(null);
    setEditForm({});
    Keyboard.dismiss();
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
    Keyboard.dismiss();
  }

  function confirmDelete(batch) {
    setBatchToDelete(batch);
    setShowDeleteConfirmation(true);
  }

  async function deleteSelectedBatch() {
    if (!batchToDelete) return;
    try {
      await insertOrUpdateBatch({ id: batchToDelete.id, _deleted: 1 }); // Optionally mark deleted for sync
      dispatch(deleteBatch(batchToDelete.id));
    } catch (e) {
      // handle error
    }
    setShowDeleteConfirmation(false);
    setBatchToDelete(null);
  }

  function onPressIn(id) {
    if (animateRefs.current[id])
      animateRefs.current[id].animate(
        { 0: { scale: 1 }, 1: { scale: 0.93 } },
        160,
      );
  }
  function onPressOut(id) {
    if (animateRefs.current[id])
      animateRefs.current[id].animate(
        { 0: { scale: 0.93 }, 1: { scale: 1 } },
        170,
      );
  }

  const grouped = groupBatches(batches);

  function renderBatch(batch, idx) {
    const isEditing = editingId === batch.id;
    return (
      <TouchableWithoutFeedback
        key={batch.id}
        onPressIn={() => onPressIn(batch.id)}
        onPressOut={() => onPressOut(batch.id)}
      >
        {isEditing ? (
          <Animatable.View
            ref={ref => (animateRefs.current[batch.id] = ref)}
            animation="fadeIn"
            style={[styles.card, { backgroundColor: colors.card }]}
          >
            <EditForm
              form={editForm}
              onChange={handleEditField}
              onSave={() => saveEdit(batch.id)}
              onCancel={cancelEdit}
              colors={colors}
            />
          </Animatable.View>
        ) : (
          <Animatable.View
            ref={ref => (animateRefs.current[batch.id] = ref)}
            animation="fadeInUp"
            delay={idx * 100}
            duration={550}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                shadowColor: colors.shadow || '#222',
              },
            ]}
            useNativeDriver={false}
          >
            <BatchCard
              batch={batch}
              colors={colors}
              onEdit={() => startEdit(batch)}
              onDelete={() => confirmDelete(batch)}
            />
          </Animatable.View>
        )}
      </TouchableWithoutFeedback>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: sWidth * 0.035,
          paddingTop: sHeight * 0.03,
        }}
      >
        <Text style={[styles.header, { color: colors.accent }]}>Batches</Text>

        <TouchableOpacity
          style={{ alignSelf: 'flex-end', marginBottom: sHeight * 0.01 }}
          onPress={() => setShowAddBatchModal(true)}
          accessibilityLabel="Add new batch"
          accessibilityHint="Opens form for adding a new batch"
        >
          <Icon name="plus-circle" size={36} color={colors.accent} />
        </TouchableOpacity>

        {grouped && Object.keys(grouped).length === 0 && (
          <Text
            style={{
              marginTop: 48,
              alignSelf: 'center',
              color: colors.placeholder,
            }}
          >
            No batches available
          </Text>
        )}

        {grouped &&
          Object.keys(grouped).map(classKey => (
            <View key={classKey} style={styles.groupSection}>
              <Text style={[styles.classTitle, { color: colors.text }]}>
                Class {classKey}
              </Text>

              {classKey === '11' || classKey === '12'
                ? Object.keys(grouped[classKey]).map(stream => (
                    <View key={stream} style={styles.streamSection}>
                      <Text
                        style={[styles.streamTitle, { color: colors.accent }]}
                      >
                        Stream: {stream}
                      </Text>
                      {grouped[classKey][stream].map((batch, idx) =>
                        renderBatch(batch, idx),
                      )}
                    </View>
                  ))
                : grouped[classKey].All?.map((batch, idx) =>
                    renderBatch(batch, idx),
                  )}
            </View>
          ))}
      </ScrollView>

      {/* Add Batch Form Modal */}
      <BatchForm
        visible={showAddBatchModal}
        onClose={() => setShowAddBatchModal(false)}
        onAdd={async newBatch => {
          dispatch(addBatch(newBatch));
          await insertTable('BATCHES', newBatch); // or your DB method to persist
          setShowAddBatchModal(false);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        visible={showDeleteConfirmation}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirmation(false)}
      >
        <View style={styles.modalBg}>
          <Animatable.View
            animation="fadeInUp"
            duration={300}
            style={[styles.confirmModal, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.confirmTitle, { color: colors.text }]}>
              Confirm Delete
            </Text>
            <Text style={[styles.confirmMessage, { color: colors.text }]}>
              Are you sure you want to delete batch "{batchToDelete?.name}"?
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => setShowDeleteConfirmation(false)}
                style={{ marginRight: 20 }}
              >
                <Text
                  style={{
                    color: colors.placeholder,
                    fontSize: sWidth * 0.045,
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteSelectedBatch}>
                <Text
                  style={{
                    color: colors.error,
                    fontSize: sWidth * 0.045,
                    fontWeight: '700',
                  }}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
}

function BatchCard({ batch, colors, onEdit, onDelete }) {
  return (
    <>
      <Text style={[styles.batchName, { color: colors.text }]}>
        {batch.name}
      </Text>
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: colors.placeholder }]}>
          Students:
        </Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>
          {batch.studentsCount}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: colors.placeholder }]}>
          Teacher:
        </Text>
        <Text style={[styles.infoValue, { color: colors.text, flexShrink: 1 }]}>
          {batch.teacher || (
            <Text style={{ color: colors.placeholder }}>Unassigned</Text>
          )}
        </Text>
        <TouchableOpacity onPress={onEdit} style={styles.iconBtn}>
          <Icon name="pencil-outline" color={colors.accent} size={20} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
          <Icon name="delete-outline" color={colors.error} size={20} />
        </TouchableOpacity>
      </View>
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: colors.placeholder }]}>
          Schedule:
        </Text>
        <Text style={[styles.infoValue, { color: colors.text, flexShrink: 1 }]}>
          {batch.schedule}
        </Text>
      </View>
    </>
  );
}

function EditForm({ form, onChange, onSave, onCancel, colors }) {
  return (
    <>
      <TextInput
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.accent,
            backgroundColor: colors.background,
          },
        ]}
        value={form.name}
        onChangeText={text => onChange('name', text)}
        placeholder="Batch Name"
        placeholderTextColor={colors.placeholder}
        maxLength={50}
      />
      <TextInput
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.accent,
            backgroundColor: colors.background,
          },
        ]}
        value={form.teacher}
        onChangeText={text => onChange('teacher', text)}
        placeholder="Teacher Name"
        placeholderTextColor={colors.placeholder}
        maxLength={50}
      />
      <TextInput
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.accent,
            backgroundColor: colors.background,
          },
        ]}
        value={form.schedule}
        onChangeText={text => onChange('schedule', text)}
        placeholder="Schedule"
        placeholderTextColor={colors.placeholder}
        maxLength={50}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <TouchableOpacity onPress={onCancel} style={{ marginRight: 12 }}>
          <Icon name="close-circle" color={colors.error} size={26} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSave}>
          <Icon name="check-circle" color={colors.accent} size={26} />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  batchName: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  infoRow: { flexDirection: 'row', marginBottom: 6, alignItems: 'center' },
  infoLabel: { fontWeight: '600', width: 100, fontSize: 14 },
  infoValue: { fontWeight: '500', fontSize: 14 },
  iconBtn: { marginLeft: 10 },

  card: {
    borderRadius: 15,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },

  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  groupSection: { marginBottom: 30 },
  classTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 5,
  },
  streamSection: { marginLeft: 20, marginBottom: 16 },
  streamTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 6,
  },

  header: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 1,
  },

  modalBg: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 24,
    elevation: 8,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
});
