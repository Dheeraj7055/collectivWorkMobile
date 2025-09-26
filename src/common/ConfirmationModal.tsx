// src/components/ConfirmationModal.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AppModal from './AppModal';
import { CheckCircle2 } from 'lucide-react-native';

interface Props {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<Props> = ({
  visible,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <AppModal visible={visible} onClose={onCancel}>
      <View >
        {/* ✅ Icon + Message in same row */}
        <View style={styles.confirmationBlock}>
          <CheckCircle2 size={32} color="white" fill="green" />
          <Text style={styles.message}>{message}</Text>
        </View>

        {/* ✅ Full-width Confirm Button */}
        <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
          <Text style={styles.confirmText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </AppModal>
  );
};

export default ConfirmationModal;

const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//   },
  confirmationBlock: {
    flexDirection: 'row',
    alignItems: 'center', // center vertically
    justifyContent: 'center', // center horizontally
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
    flexShrink: 1,
    // textAlign: 'center',
  },
  confirmBtn: {
    width: '100%',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#0E79B6',
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
