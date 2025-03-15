import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Portal, Dialog, TextInput, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

interface ReportIssueModalProps {
  visible: boolean;
  onClose: () => void;
  onReport: (issueType: string, description: string) => Promise<void>;
}

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ visible, onClose, onReport }) => {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setIssueType('');
    setDescription('');
    setDescriptionError(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setDescriptionError(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onReport(issueType || 'Other issue', description);
      resetForm();
      onClose();
    } catch (error) {
      console.error('ReportIssueModal: Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose} style={styles.dialog}>
        <View style={styles.header}>
          <MaterialIcons name="report-problem" size={24} color="#fff" />
          <Text style={styles.headerTitle}>Report Issue</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Issue Type</Text>
            <View style={styles.textInputContainer}>
              <MaterialIcons name="error-outline" size={20} color="#64748b" />
              <TextInput
                value={issueType}
                onChangeText={setIssueType}
                placeholder="e.g., Damage, Access Problem, etc."
                style={styles.input}
                mode="flat"
                underlineColor="transparent"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <View style={[styles.textInputContainer, styles.textAreaContainer]}>
              <MaterialIcons 
                name="description" 
                size={20} 
                color="#64748b" 
                style={styles.textAreaIcon}
              />
              <TextInput
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  setDescriptionError(false);
                }}
                placeholder="Describe the issue in detail"
                multiline
                numberOfLines={4}
                style={[styles.input, styles.textArea]}
                mode="flat"
                underlineColor="transparent"
                error={descriptionError}
              />
            </View>
            {descriptionError && (
              <Text style={styles.errorText}>Please provide a description</Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={handleClose}
          >
            <MaterialIcons name="close" size={20} color="#6B7280" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.button, 
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled
            ]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <MaterialIcons name="send" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Text>
          </TouchableOpacity>
        </View>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    margin: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    padding: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    maxHeight: '70%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textAreaIcon: {
    marginTop: 4,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    marginLeft: 8,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  submitButton: {
    backgroundColor: '#EF4444',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportIssueModal;