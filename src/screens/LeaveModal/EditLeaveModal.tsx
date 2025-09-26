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

  // files
  const [fileList, setFileList] = useState<any[]>([]);
  const [editFileList, setEditFileList] = useState<any[]>([]);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activePicker, setActivePicker] = useState<string | null>(null);
  const [errorText, setErrorText] = useState('');

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
        .catch(err => console.error('Update failed', err));
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
            <RNPickerSelect
              onValueChange={setSelectedLeaveType}
              items={leaveListOptions.map(lt => ({ label: lt, value: lt }))}
              placeholder={{ label: 'Select Leave Type', value: '' }}
              value={selectedLeaveType}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
            />
            {formErrors.leaveType && (
              <Text style={styles.errorText}>{formErrors.leaveType}</Text>
            )}
          </View>

          {/* Leave Duration */}
          <View style={styles.leaveContainer}>
            <Text style={styles.label}>Leave Duration <Text style={{ color: 'red' }}>*</Text></Text>
            <RNPickerSelect
              onValueChange={setDayType}
              items={[
                { label: 'Short Day Leave', value: 'short' },
                { label: 'Half Day Leave', value: 'half' },
                { label: 'Single Day Leave', value: 'single' },
                { label: 'Multiple Day Leave', value: 'multiple' },
              ]}
              placeholder={{ label: 'Select Day Type', value: '' }}
              value={dayType}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
            />
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

          {activePicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="calendar"
              onChange={handleDateChange}
            />
          )}

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
              <RNPickerSelect
                onValueChange={handleReasonChange}
                items={[
                  ...(reasonList ?? []).map(r => ({ label: r, value: r })),
                  { label: 'Other', value: 'other' },
                ]}
                placeholder={{ label: 'Select Reason', value: '' }}
                value={reason}
                style={pickerSelectStyles}
                useNativeAndroidPickerStyle={false}
              />
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
              <RNPickerSelect
                onValueChange={setClubing}
                items={leaveListOptions.map(lt => ({ label: lt, value: lt }))}
                value={clubing}
                placeholder={{ label: 'Select Club Leave Type', value: '' }}
                style={pickerSelectStyles}
                useNativeAndroidPickerStyle={false}
              />
            )}
          </View>

          {/* Request To */}
          <View style={styles.leaveContainer}>
            <Text style={styles.label}>Request To <Text style={{ color: 'red' }}>*</Text></Text>
            <RNPickerSelect
              onValueChange={setSelectedName}
              items={renderUserOptions(userData, names)}
              value={selectedName}
              placeholder={{ label: 'Select Reporting Manager/HR', value: '' }}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
            />
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
    </AppModal>
  );
};

export default EditLeaveModal;
