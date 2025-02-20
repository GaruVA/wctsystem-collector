import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Portal, Dialog, TextInput, Text } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ReportIssueModalProps {
  visible: boolean;
  onClose: () => void;
  // onReport should call reportIssue API internally (with token) and return a promise
  onReport: (issueType: string, description: string) => Promise<void>;
}

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ visible, onClose, onReport }) => {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    if (!issueType || !description) return;
    setLoading(true);
    try {
      await onReport(issueType, description);
    } catch (error) {
      console.error('Report issue failed:', error);
    }
    setLoading(false);
    setIssueType('');
    setDescription('');
    onClose();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onClose} style={styles.dialog}>
        {/* Header with close icon and left-aligned title */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Report Issue</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Horizontal separator (HR) */}
        <View style={styles.hr} />
        <Dialog.Content style={styles.content}>
          <TextInput
            mode="outlined"
            label="Issue Type"
            value={issueType}
            onChangeText={setIssueType}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            style={[styles.input, { height: 100 }]}
          />
        </Dialog.Content>
        <View style={styles.hr} />
        {/* Bottom button styled like BinState */}
        <TouchableOpacity style={styles.bottomButton} onPress={handleReport} disabled={loading}>
          <Text style={styles.bottomButtonText}>
            {loading ? 'Reporting...' : 'Report'}
          </Text>
        </TouchableOpacity>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    margin: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    backgroundColor: '#DC2626', // Updated header color for reporting
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 0, // Remove white gap on top
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'left',
  },
  closeButton: {
    padding: 4,
  },
  hr: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  content: {
    padding: 16,
  },
  input: {
    marginVertical: 8,
  },
  bottomButton: {
    backgroundColor: '#EF4444', // Changed bottom button color to complement header
    paddingVertical: 14,
    margin: 16,
    borderRadius: 12,
  },
  bottomButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ReportIssueModal;