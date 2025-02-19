import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Portal, Dialog, TextInput, Button } from 'react-native-paper';

interface ReportIssueModalProps {
  visible: boolean;
  onClose: () => void;
  onReport: (issueType: string, description: string) => void;
}

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ visible, onClose, onReport }) => {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');

  const handleReport = () => {
    onReport(issueType, description);
    setIssueType('');
    setDescription('');
    onClose();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onClose}>
        <Dialog.Title>Report Issue</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Issue Type"
            value={issueType}
            onChangeText={setIssueType}
            style={styles.input}
          />
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            style={[styles.input, { height: 80 }]}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onClose}>Cancel</Button>
          <Button onPress={handleReport}>Report</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  input: {
    marginVertical: 10
  }
});

export default ReportIssueModal;