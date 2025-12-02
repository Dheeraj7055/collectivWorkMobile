// src/components/EditLeaveModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Platform,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import moment from 'moment';
import AppModal from '@/common/AppModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { updateLeave, getLeaveUser } from '@/redux/slices/leaveSlice';
import { Upload } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { styles, pickerSelectStyles } from '@/styles/leaveStyles';
import { Snackbar } from 'react-native-paper';

interface Props {
  visible: boolean;
  onClose: () => void;
  leaveData: any;
  leaveListOptions: string[];
  reasonList: string[];
  names: any[];
  userData: any;
}

const EditLeaveModal: React.FC<Props> = ({
  visible,
  onClose,
  leaveData,
  leaveListOptions,
  reasonList,
  names,
  userData,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // form states
  const [subject, setSubject] = useState('');
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [dayType, setDayType] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startHalf, setStartHalf] = useState('');
  const [endHalf, setEndHalf] = useState('');
  const [reason, setReason] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherReason, setOtherReason] = useState('');
  const [description, setDescription] = useState('');
  const [clubing, setClubing] = useState('');
  const [isClubChecked, setIsClubChecked] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
  });

  // files
  const [fileList, setFileList] = useState<any[]>([]);
  const [editFileList, setEditFileList] = useState<any[]>([]);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activePicker, setActivePicker] = useState<string | null>(null);
  const [errorText, setErrorText] = useState('');
  const [isLeaveTypeOpen, setIsLeaveTypeOpen] = useState(false);
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [isDayTypeOpen, setIsDayTypeOpen] = useState(false);
  const [isNameOpen, setIsNameOpen] = useState(false);
  const [isClubingOpen, setIsClubingOpen] = useState(false);

  // pre-fill on open
  useEffect(() => {
    if (leaveData) {
      setSubject(leaveData.subject || '');
      setSelectedLeaveType(leaveData.leave_type || '');
      setDayType(leaveData.day_type || '');
      setStartDate(leaveData.start_date ? new Date(leaveData.start_date) : null);
      setEndDate(leaveData.end_date ? new Date(leaveData.end_date) : null);
      setStartHalf(leaveData.start_half || '');
      setEndHalf(leaveData.end_half || '');
      setReason(leaveData.reason || '');
      if (leaveData.reason === 'other') {
        setShowOtherInput(true);
        setOtherReason(leaveData.other_reason || '');
      }
      setDescription(leaveData.description || '');
      setClubing(leaveData.clubing || '');
      setIsClubChecked(!!leaveData.is_clubing);
      setSelectedName(leaveData.request_to || '');
      setEditFileList(leaveData.file_document || []);
    }
  }, [leaveData]);

  // handlers
  const handleReasonChange = (val: string) => {
    if (val === 'other') {
      setShowOtherInput(true);
      setReason('');
    } else {
      setShowOtherInput(false);
      setReason(val);
    }
  };

  const handleFileUpload = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 0,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        setErrorText(result.errorMessage || 'File upload failed.');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        setFileList(prev => [...prev, ...(result.assets ?? [])]);
      }
    } catch (err) {
      setErrorText('File upload failed.');
    }
  };

  const handleRemoveFile = (index: number) =>
    setFileList(prev => prev.filter((_, i) => i !== index));

  const handleDateChange = (event: any, date?: Date | undefined) => {
    if (activePicker === 'multiStart' || activePicker === 'single' || activePicker === 'halfShort') {
      setStartDate(date || null);
    } else if (activePicker === 'multiEnd') {
      setEndDate(date || null);
    }
    setActivePicker(null);
  };

  const handleUpdateSubmit = () => {
    const errors: Record<string, string> = {};
    if (!subject.trim()) errors.subject = 'Subject is required.';
    if (!selectedLeaveType) errors.leaveType = 'Leave Type is required.';
    if (!dayType) errors.dayType = 'Leave Duration is required.';
    if (!description.trim()) errors.description = 'Description is required.';

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      const payload = {
        leave_id: leaveData?.id,
        subject,
        leave_type: selectedLeaveType,
        start_date: startDate ? moment(startDate).format('YYYY-MM-DD') : null,
        end_date:
          dayType === 'multiple' && endDate
            ? moment(endDate).format('YYYY-MM-DD')
            : moment(startDate).format('YYYY-MM-DD'),
        start_half: startHalf || 'first_half',
        end_half: endHalf || 'second_half',
        clubing: clubing || '',
        is_clubing: !!isClubChecked,
        day_type: dayType,
        reason: reason === 'other' ? otherReason : reason,
        description,
        request_to: selectedName,
      };

      dispatch(updateLeave({ payload, files: [...fileList, ...editFileList] }))
        .unwrap()
        .then(() => {
          dispatch(getLeaveUser({ leave_id: leaveData?.id }));
          onClose();
        })
        .catch(err => {
          setSnackbar({
            visible: true,
            message: err || 'Something went wrong',
          });
          console.error('Update failed', err)
        }
        );
    }
  };

  const renderUserOptions = (userData: any, userNamesList: any[]) => {
    const managerOptions: any[] = [];

    if (userData?.reporting_manager) {
      managerOptions.push({
        id: userData.reporting_manager,
        first_name: userData.reporting_manager_name?.split(' ')[0] || '',
        last_name:
          userData.reporting_manager_name?.split(' ').slice(1).join(' ') || '',
        label: userData.reporting_manager_name,
        role: 'Reporting Manager',
      });
    }

    if (
      userData?.reporting_hr &&
      userData.reporting_hr !== userData.reporting_manager
    ) {
      managerOptions.push({
        id: userData.reporting_hr,
        first_name: userData.reporting_hr_name?.split(' ')[0] || '',
        last_name:
          userData.reporting_hr_name?.split(' ').slice(1).join(' ') || '',
        label: userData.reporting_hr_name,
        role: 'HR',
      });
    }

    return managerOptions.map(item => {
      const matchedUser = userNamesList.find(user => user.id === item.id);
      const employeeID = matchedUser?.employeeID || '';

      return {
        label: `${item.first_name} ${item.last_name} (${employeeID}) - ${item.role}`,
        value: item.id,
      };
    });
  };

  return (
    <AppModal visible={visible} onClose={onClose}>
      <View>
        <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator>
          {/* Header */}
          <Text style={styles.modalTitle}>Edit Leave</Text>
          <Text style={styles.modalSubtitle}>
            Update your leave request details below.
          </Text>

          {/* Subject */}
          <Text style={styles.label}>Subject <Text style={{ color: 'red' }}>*</Text></Text>
          <TextInput
            placeholder="Enter Subject"
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
          />
          {formErrors.subject && (
            <Text style={styles.errorText}>{formErrors.subject}</Text>
          )}

          {/* Leave Type */}
          <View style={styles.leaveContainer}>
            <Text style={styles.label}>Leave Type <Text style={{ color: 'red' }}>*</Text></Text>
            {Platform.OS === 'ios' ? (
              // ---------------- iOS: Custom Dropdown ----------------
              <View style={{ position: 'relative' }}>
                <TouchableOpacity
                  style={[
                    styles.leaveInputWrapper,
                    {
                      height: 42,
                      backgroundColor: 'white',
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setIsLeaveTypeOpen(prev => !prev)}
                >
                  <Text
                    style={
                      selectedLeaveType
                        ? styles.leaveValueText
                        : styles.leavePlaceholderText
                    }
                  >
                    {selectedLeaveType || 'Select Leave Type'}
                  </Text>

                  <Text style={styles.leaveArrow}>▾</Text>
                </TouchableOpacity>

                {isLeaveTypeOpen && (
                  <View style={styles.leaveDropdown}>
                    <ScrollView style={{ maxHeight: 200 }}>
                      {leaveListOptions.map(lt => (
                        <TouchableOpacity
                          key={lt}
                          style={styles.leaveOption}
                          onPress={() => {
                            setIsLeaveTypeOpen(false);
                            setSelectedLeaveType(lt);
                          }}
                        >
                          <Text style={styles.leaveOptionText}>{lt}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            ) : (
              // ---------------- Android: RNPickerSelect ----------------
              <RNPickerSelect
                onValueChange={(val) => {
                  setSelectedLeaveType(val);
                }}
                items={leaveListOptions.map(lt => ({ label: lt, value: lt }))}
                placeholder={{ label: 'Select Leave Type', value: '' }}
                value={selectedLeaveType}
                style={{
                  ...pickerSelectStyles,
                  inputAndroid: {
                    ...pickerSelectStyles.inputAndroid,
                    backgroundColor: 'white',
                  },
                  placeholder: {
                    ...pickerSelectStyles.placeholder,
                    color: '#777',
                  },
                }}
                useNativeAndroidPickerStyle={false}
              />
            )}

            {formErrors.leaveType && (
              <Text style={styles.errorText}>{formErrors.leaveType}</Text>
            )}
          </View>

          {/* Leave Duration */}
          <View style={styles.leaveContainer}>
            <Text style={styles.label}>Leave Duration <Text style={{ color: 'red' }}>*</Text></Text>
            {Platform.OS === 'ios' ? (
              // ---------------- iOS: Custom Dropdown ----------------
              <View style={{ position: 'relative' }}>
                <TouchableOpacity
                  style={[
                    styles.leaveInputWrapper,
                    {
                      height: 42,
                      backgroundColor: 'white',
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setIsDayTypeOpen(prev => !prev)}
                >
                  <Text
                    style={
                      dayType
                        ? styles.leaveValueText
                        : styles.leavePlaceholderText
                    }
                  >
                    {dayType
                      ? {
                        short: 'Short Day Leave',
                        half: 'Half Day Leave',
                        single: 'Single Day Leave',
                        multiple: 'Multiple Day Leave',
                      }[dayType]
                      : 'Select Day Type'}
                  </Text>

                  <Text style={styles.leaveArrow}>▾</Text>
                </TouchableOpacity>

                {isDayTypeOpen && (
                  <View style={styles.leaveDropdown}>
                    <ScrollView style={{ maxHeight: 220 }}>
                      {[
                        { label: 'Short Day Leave', value: 'short' },
                        { label: 'Half Day Leave', value: 'half' },
                        { label: 'Single Day Leave', value: 'single' },
                        { label: 'Multiple Day Leave', value: 'multiple' },
                      ].map(item => (
                        <TouchableOpacity
                          key={item.value}
                          style={styles.leaveOption}
                          onPress={() => {
                            setIsDayTypeOpen(false);
                            setDayType(item.value);
                          }}
                        >
                          <Text style={styles.leaveOptionText}>{item.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            ) : (
              // ---------------- Android: RNPickerSelect ----------------
              <RNPickerSelect
                onValueChange={(val) => {
                  setDayType(val);
                }}
                items={[
                  { label: 'Short Day Leave', value: 'short' },
                  { label: 'Half Day Leave', value: 'half' },
                  { label: 'Single Day Leave', value: 'single' },
                  { label: 'Multiple Day Leave', value: 'multiple' },
                ]}
                placeholder={{ label: 'Select Day Type', value: '' }}
                value={dayType}
                style={{
                  ...pickerSelectStyles,
                  inputAndroid: {
                    ...pickerSelectStyles.inputAndroid,
                    backgroundColor: 'white',
                  },
                  placeholder: {
                    ...pickerSelectStyles.placeholder,
                    color: '#777',
                  },
                }}
                useNativeAndroidPickerStyle={false}
              />
            )}

            {formErrors.dayType && (
              <Text style={styles.errorText}>{formErrors.dayType}</Text>
            )}
          </View>

          {/* Date pickers */}
          {dayType === 'single' && (
            <View style={styles.field}>
              <Text style={styles.label}>On <Text style={{ color: 'red' }}>*</Text></Text>
              <TouchableOpacity onPress={() => setActivePicker('single')}>
                <Text style={styles.input}>
                  {startDate
                    ? moment(startDate).format('DD-MMM-YYYY')
                    : 'Select Date'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {dayType === 'multiple' && (
            <View>
              <View style={styles.field}>
                <Text style={styles.label}>From <Text style={{ color: 'red' }}>*</Text></Text>
                <TouchableOpacity onPress={() => setActivePicker('multiStart')}>
                  <Text style={styles.input}>
                    {startDate
                      ? moment(startDate).format('DD-MMM-YYYY')
                      : 'Select Start Date'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>To <Text style={{ color: 'red' }}>*</Text></Text>
                <TouchableOpacity onPress={() => setActivePicker('multiEnd')}>
                  <Text style={styles.input}>
                    {endDate
                      ? moment(endDate).format('DD-MMM-YYYY')
                      : 'Select End Date'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {(dayType === 'half' || dayType === 'short') && (
            <View style={styles.field}>
              <Text style={styles.label}>On <Text style={{ color: 'red' }}>*</Text></Text>
              <TouchableOpacity onPress={() => setActivePicker('halfShort')}>
                <Text style={styles.input}>
                  {startDate
                    ? moment(startDate).format('DD-MMM-YYYY')
                    : 'Select Date'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* {activePicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="calendar"
              onChange={handleDateChange}
            />
          )} */}

          <Modal
            visible={!!activePicker}
            transparent
            animationType="fade"
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.4)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              activeOpacity={1}
              onPress={() => setActivePicker(null)} // close when tapping outside
            >
              <TouchableOpacity
                activeOpacity={1}
                style={{
                  width: '90%',
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  paddingVertical: 20,
                  alignItems: 'center',
                }}
              >
                <DateTimePicker
                  value={
                    activePicker === 'multiEnd'
                      ? endDate ?? new Date()
                      : startDate ?? new Date()
                  }
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'calendar'} // iOS middle calendar
                  onChange={(event, date) =>
                    handleDateChange(event, date)
                  }
                  themeVariant="light"
                />

               {Platform.OS === 'ios' && <TouchableOpacity
                  style={{ paddingVertical: 12 }}
                  onPress={() => setActivePicker(null)}
                >
                  <Text style={{ fontSize: 17, color: '#007AFF' }}>Cancel</Text>
                </TouchableOpacity>}
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>

          {/* Reason */}
          <View style={styles.leaveContainer}>
            <Text style={styles.label}>Reason</Text>
            {showOtherInput ? (
              <TextInput
                placeholder="Enter Custom Reason"
                style={styles.input}
                value={otherReason}
                onChangeText={setOtherReason}
              />
            ) : (
              Platform.OS === 'ios' ? (
                // ---------------- iOS: Custom Dropdown ----------------
                <View style={{ position: 'relative' }}>
                  <TouchableOpacity
                    style={[
                      styles.leaveInputWrapper,
                      {
                        height: 42,
                        backgroundColor: 'white',
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setIsReasonOpen(prev => !prev)}
                  >
                    <Text
                      style={
                        reason
                          ? styles.leaveValueText
                          : styles.leavePlaceholderText
                      }
                    >
                      {reason || 'Select Reason'}
                    </Text>

                    <Text style={styles.leaveArrow}>▾</Text>
                  </TouchableOpacity>

                  {isReasonOpen && (
                    <View style={styles.leaveDropdown}>
                      <ScrollView style={{ maxHeight: 250 }}>
                        {[
                          ...(reasonList ?? []).map(r => ({ label: r, value: r })),
                          { label: 'Other', value: 'other' },
                        ].map(item => (
                          <TouchableOpacity
                            key={item.value}
                            style={styles.leaveOption}
                            onPress={() => {
                              setIsReasonOpen(false);
                              handleReasonChange(item.value);
                            }}
                          >
                            <Text style={styles.leaveOptionText}>{item.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              ) : (
                // ---------------- Android: RNPickerSelect ----------------
                <RNPickerSelect
                  onValueChange={(val) => {
                    handleReasonChange(val);
                  }}
                  items={[
                    ...(reasonList ?? []).map(r => ({ label: r, value: r })),
                    { label: 'Other', value: 'other' },
                  ]}
                  placeholder={{ label: 'Select Reason', value: '' }}
                  value={reason}
                  style={{
                    ...pickerSelectStyles,
                    inputAndroid: {
                      ...pickerSelectStyles.inputAndroid,
                      backgroundColor: 'white',
                    },
                    placeholder: {
                      ...pickerSelectStyles.placeholder,
                      color: '#777',
                    },
                  }}
                  useNativeAndroidPickerStyle={false}
                />
              )
            )}
          </View>

          {/* Description */}
          <Text style={styles.label}>Description <Text style={{ color: 'red' }}>*</Text></Text>
          <TextInput
            placeholder="Enter Description"
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            multiline
            value={description}
            onChangeText={setDescription}
          />
          {formErrors.description && (
            <Text style={styles.errorText}>{formErrors.description}</Text>
          )}

          {/* Club Leave */}
          <View style={styles.clubContainer}>
            <Text style={styles.label}>Club Leave</Text>
            <View style={styles.radioRow}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setIsClubChecked(true)}
              >
                <View
                  style={[
                    styles.radioCircle,
                    isClubChecked === true && styles.radioSelected,
                  ]}
                />
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setIsClubChecked(false)}
              >
                <View
                  style={[
                    styles.radioCircle,
                    isClubChecked === false && styles.radioSelected,
                  ]}
                />
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>
            {isClubChecked && (
              Platform.OS === 'ios' ? (
                // ---------------- iOS: Custom Dropdown ----------------
                <View style={{ position: 'relative' }}>
                  <TouchableOpacity
                    style={[
                      styles.leaveInputWrapper,
                      {
                        height: 42,
                        backgroundColor: 'white',
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setIsClubingOpen(prev => !prev)}
                  >
                    <Text
                      style={
                        clubing
                          ? styles.leaveValueText
                          : styles.leavePlaceholderText
                      }
                    >
                      {clubing != '' ? clubing : 'Select Club Leave Type'}
                    </Text>

                    <Text style={styles.leaveArrow}>▾</Text>
                  </TouchableOpacity>

                  {isClubingOpen && (
                    <View style={styles.leaveDropdown}>
                      <ScrollView style={{ maxHeight: 220 }}>
                        {leaveListOptions.map(item => (
                          <TouchableOpacity
                            key={item}
                            style={styles.leaveOption}
                            onPress={() => {
                              setIsClubingOpen(false);
                              setClubing(item);
                            }}
                          >
                            <Text style={styles.leaveOptionText}>{item}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              ) : (
                // ---------------- Android: RNPickerSelect ----------------
                <RNPickerSelect
                  onValueChange={(val) => {
                    setClubing(val);
                  }}
                  items={leaveListOptions.map(lt => ({ label: lt, value: lt }))}
                  value={clubing}
                  placeholder={{ label: 'Select Club Leave Type', value: '' }}
                  style={{
                    ...pickerSelectStyles,
                    inputAndroid: {
                      ...pickerSelectStyles.inputAndroid,
                      backgroundColor: 'white',
                    },
                    placeholder: {
                      ...pickerSelectStyles.placeholder,
                      color: '#777',
                    },
                  }}
                  useNativeAndroidPickerStyle={false}
                />
              )

            )}
          </View>

          {/* Request To */}
          <View style={styles.leaveContainer}>
            <Text style={styles.label}>Request To <Text style={{ color: 'red' }}>*</Text></Text>
            {Platform.OS === 'ios' ? (
              // ---------------- iOS: Custom Dropdown ----------------
              <View style={{ position: 'relative' }}>
                <TouchableOpacity
                  style={[
                    styles.leaveInputWrapper,
                    {
                      height: 42,
                      backgroundColor: 'white',
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setIsNameOpen(prev => !prev)}
                >
                  <Text
                    style={
                      selectedName
                        ? styles.leaveValueText
                        : styles.leavePlaceholderText
                    }
                  >
                    {selectedName
                      ? renderUserOptions(userData, names).find(
                        opt => opt.value === selectedName
                      )?.label
                      : 'Select Reporting Manager/HR'}
                  </Text>

                  <Text style={styles.leaveArrow}>▾</Text>
                </TouchableOpacity>

                {isNameOpen && (
                  <View style={styles.leaveDropdown}>
                    <ScrollView style={{ maxHeight: 250 }}>
                      {renderUserOptions(userData, names).map(item => (
                        <TouchableOpacity
                          key={item.value}
                          style={styles.leaveOption}
                          onPress={() => {
                            setIsNameOpen(false);
                            setSelectedName(item.value);
                          }}
                        >
                          <Text style={styles.leaveOptionText}>{item.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            ) : (
              // ---------------- Android: RNPickerSelect ----------------
              <RNPickerSelect
                onValueChange={(val) => {
                  setSelectedName(val);
                }}
                items={renderUserOptions(userData, names)}
                value={selectedName}
                placeholder={{ label: 'Select Reporting Manager/HR', value: '' }}
                style={{
                  ...pickerSelectStyles,
                  inputAndroid: {
                    ...pickerSelectStyles.inputAndroid,
                    backgroundColor: 'white',
                  },
                  placeholder: {
                    ...pickerSelectStyles.placeholder,
                    color: '#777',
                  },
                }}
                useNativeAndroidPickerStyle={false}
              />
            )}

          </View>

          {/* Upload */}
          <View style={styles.leaveContainer}>
            <Text style={styles.label}>Upload</Text>
            <View style={styles.previewRow}>
              {fileList.map((file, index) => (
                <View key={index} style={styles.previewWrapper}>
                  <TouchableOpacity onPress={() => setPreviewUri(file.uri)}>
                    <Image
                      source={{ uri: file.uri }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteIcon}
                    onPress={() => handleRemoveFile(index)}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.uploadBox}
                onPress={handleFileUpload}
              >
                <Upload size={20} color="#666" />
                <Text style={styles.uploadText}>
                  {fileList.length ? 'Add More' : 'Upload File'}
                </Text>
              </TouchableOpacity>
            </View>
            {errorText ? (
              <Text style={styles.errorText}>{errorText}</Text>
            ) : null}
          </View>
        </ScrollView>

        {/* Update Button */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleUpdateSubmit}>
          <Text style={styles.submitText}>Update Leave</Text>
        </TouchableOpacity>
      </View>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        style={{
          backgroundColor: '#E53935',
          borderRadius: 8,
          top: -100,
        }}
      >
        {snackbar.message}
      </Snackbar>
    </AppModal>
  );
};

export default EditLeaveModal;
