import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Portal, Dialog, TextInput, Text } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ReportIssueModalProps {
  visible: boolean;
  onClose: () => void;
  onReport: (issueType: string, description: string) => Promise<void>;
}

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ visible, onClose, onReport }) => {
  console.log('ReportIssueModal: Rendering modal, visible:', visible);
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    console.log('ReportIssueModal: Resetting form');
    setIssueType('');
    setDescription('');
    setDescriptionError(false);
  };

  const handleClose = () => {
    console.log('ReportIssueModal: Closing modal');
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    console.log('ReportIssueModal: Submitting issue', { issueType, description });
    if (!description.trim()) {
      console.log('ReportIssueModal: Description is empty, showing error');
      setDescriptionError(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onReport(issueType || 'Other issue', description);
      resetForm();
      onClose();
    } catch (error) {
      console.error('ReportIssueModal: Error submitting report', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose} style={styles.dialog}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Report Issue</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
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
            error={descriptionError}
          />
          {descriptionError && <Text style={styles.errorText}>Description is required.</Text>}
        </Dialog.Content>
        <View style={styles.hr} />
        <TouchableOpacity style={styles.bottomButton} onPress={handleSubmit} disabled={isSubmitting}>
          <Text style={styles.bottomButtonText}>
            {isSubmitting ? 'Reporting...' : 'Report'}
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
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 0,
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
    backgroundColor: '#EF4444',
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
  errorText: {
    color: '#DC2626',
    marginTop: 4,
  },
});

export default ReportIssueModal;