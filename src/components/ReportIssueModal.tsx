import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Modal, 
  Animated, 
  Keyboard,
  Platform
} from 'react-native';
import { TextInput, Text, Portal } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ReportIssueModalProps {
  visible: boolean;
  onClose: () => void;
  onReport: (issueType: string, description: string) => Promise<void>;
}

const ISSUE_TYPES = [
  'Sensor Malfunction',
  'Physical Damage',
  'Fill Level Inaccurate',
  'Location Error',
  'Access Problem',
  'Collection Issue',
  'Other'
];

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ visible, onClose, onReport }) => {
  const insets = useSafeAreaInsets();
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIssueTypes, setShowIssueTypes] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(100));
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const resetForm = () => {
    setIssueType('');
    setDescription('');
    setDescriptionError(false);
    setShowIssueTypes(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
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

  const selectIssueType = (type: string) => {
    setIssueType(type);
    setShowIssueTypes(false);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onRequestClose={handleClose}
        transparent
        animationType="none"
        statusBarTranslucent
      >
        <Animated.View 
          style={[
            styles.overlay,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.backdropTouch} 
            activeOpacity={1} 
            onPress={handleClose}
          />
          
          <Animated.View 
            style={[
              styles.modalContainer, 
              { 
                marginTop: insets.top,
                marginBottom: insets.bottom,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Report an Issue</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={handleClose}
              >
                <MaterialIcons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.content}
              contentContainerStyle={[
                styles.contentContainer,
                keyboardVisible && styles.contentContainerKeyboardOpen
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Issue Type</Text>
                <TouchableOpacity
                  style={styles.dropdownContainer}
                  onPress={() => setShowIssueTypes(!showIssueTypes)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dropdownText,
                    !issueType && styles.dropdownPlaceholder
                  ]}>
                    {issueType || "Select issue type"}
                  </Text>
                  <MaterialIcons 
                    name={showIssueTypes ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={24} 
                    color="#64748B" 
                  />
                </TouchableOpacity>
                
                {showIssueTypes && (
                  <View style={styles.dropdownMenu}>
                    {ISSUE_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.dropdownItem,
                          issueType === type && styles.dropdownItemSelected
                        ]}
                        onPress={() => selectIssueType(type)}
                      >
                        <Text style={[
                          styles.dropdownItemText,
                          issueType === type && styles.dropdownItemTextSelected
                        ]}>
                          {type}
                        </Text>
                        {issueType === type && (
                          <MaterialIcons name="check" size={20} color="#3B82F6" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <View style={[
                  styles.textAreaContainer,
                  descriptionError && styles.inputError
                ]}>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Optional: Provide additional details about the issue..."
                    multiline
                    numberOfLines={6}
                    style={styles.textArea}
                    mode="flat"
                    underlineColor="transparent"
                    placeholderTextColor="#94A3B8"
                    selectionColor="#3B82F6"
                  />
                </View>
              </View>

              <View style={styles.infoContainer}>
                <MaterialIcons name="info" size={20} color="#64748B" />
                <Text style={styles.infoText}>
                  Your report will be reviewed by our team and we'll get back to you as soon as possible.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  isSubmitting && styles.submitButtonDisabled
                ]} 
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.7}
              >
                {isSubmitting ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.submitButtonText}>Submitting</Text>
                    <View style={styles.loadingDots}>
                      <View style={styles.loadingDot} />
                      <View style={[styles.loadingDot, styles.loadingDotMiddle]} />
                      <View style={styles.loadingDot} />
                    </View>
                  </View>
                ) : (
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </Portal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: width > 500 ? 480 : width * 0.92,
    backgroundColor: '#fff',
    borderRadius: 24,
    maxHeight: height * 0.85,
    elevation: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 18,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  content: {
    maxHeight: height * 0.6,
  },
  contentContainer: {
    padding: 24,
  },
  contentContainerKeyboardOpen: {
    paddingBottom: 100,
  },
  inputContainer: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
    marginBottom: 8,
  },
  requiredBadge: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
  },
  dropdownText: {
    fontSize: 16,
    color: '#111827',
  },
  dropdownPlaceholder: {
    color: '#94A3B8',
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemSelected: {
    backgroundColor: '#F0F9FF',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#334155',
  },
  dropdownItemTextSelected: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  textAreaContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  textArea: {
    backgroundColor: 'transparent',
    fontSize: 16,
    color: '#111827',
    minHeight: 150,
    paddingHorizontal: 16,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  submitButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    elevation: 2,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    marginLeft: 8,
    alignItems: 'center',
  },
  loadingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
    opacity: 0.7,
  },
  loadingDotMiddle: {
    marginHorizontal: 4,
    opacity: 0.9,
    width: 6,
    height: 6,
  },
});

export default ReportIssueModal;