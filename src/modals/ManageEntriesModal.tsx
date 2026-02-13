// src/modals/ManageEntriesModal.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { WearSession } from '../types';
import { colors } from '../constants/colors';
import { formatDuration } from '../utils/timeUtils';
import { formatDate } from '../utils/dateUtils';

interface ManageEntriesModalProps {
  visible: boolean;
  onClose: () => void;
  sessions: WearSession[];
  onDeleteSessions: (sessionIds: string[]) => void;
}

export const ManageEntriesModal: React.FC<ManageEntriesModalProps> = ({
  visible,
  onClose,
  sessions,
  onDeleteSessions,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sessions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sessions.map(s => s.id)));
    }
  };

  const handleDelete = () => {
    if (selectedIds.size === 0) return;

    Alert.alert(
      'Delete Entries',
      `Are you sure you want to delete ${selectedIds.size} selected entr${selectedIds.size === 1 ? 'y' : 'ies'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDeleteSessions(Array.from(selectedIds));
            setSelectedIds(new Set());
            onClose();
          },
        },
      ]
    );
  };

  const renderSession = ({ item }: { item: WearSession }) => {
    const isSelected = selectedIds.has(item.id);
    const date = new Date(item.startTime);
    const formattedDate = formatDate(date);
    const startTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity
        style={[styles.sessionItem, isSelected && styles.selectedItem]}
        onPress={() => toggleSelection(item.id)}
      >
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionDate}>{formattedDate}</Text>
          <Text style={styles.sessionTime}>Started: {startTime}</Text>
          <Text style={styles.sessionDuration}>
            Duration: {formatDuration(item.duration)}
          </Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Manage Entries</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionBar}>
            <TouchableOpacity
              style={styles.selectAllButton}
              onPress={toggleSelectAll}
            >
              <Text style={styles.selectAllText}>
                {selectedIds.size === sessions.length ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.selectedCount}>
              {selectedIds.size} selected
            </Text>
            {selectedIds.size > 0 && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>

          {sessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No entries to manage</Text>
            </View>
          ) : (
            <FlatList
              data={sessions}
              renderItem={renderSession}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray800,
  },
  closeButton: {
    fontSize: 24,
    color: colors.gray500,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  selectAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.gray100,
    borderRadius: 8,
  },
  selectAllText: {
    fontSize: 14,
    color: colors.gray700,
    fontWeight: '600',
  },
  selectedCount: {
    fontSize: 14,
    color: colors.gray600,
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.danger,
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.gray50,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedItem: {
    backgroundColor: colors.primary + '20', // 20% opacity
    borderWidth: 2,
    borderColor: colors.primary,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: 2,
  },
  sessionDuration: {
    fontSize: 14,
    color: colors.gray500,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray400,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray500,
    fontStyle: 'italic',
  },
});