import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';

interface ReportIssueModalProps {
  visible: boolean;
  onClose: () => void;
  onReport: (issueType: string, description: string) => void;
}

const ReportIssueModal = ({ visible, onClose, onReport }: ReportIssueModalProps) => {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');

  const handleReport = () => {
    onReport(issueType, description);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Report Issue</Text>
        <TextInput
          style={styles.input}
          placeholder="Issue Type"
          value={issueType}
          onChangeText={setIssueType}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Button title="Report" onPress={handleReport} />
        <Button title="Cancel" onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10
  }
});

export default ReportIssueModal;