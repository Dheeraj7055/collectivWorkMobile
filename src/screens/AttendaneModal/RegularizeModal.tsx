import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import AppModal from '@/common/AppModal';
import { Edit2 } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { attendanceService } from '@/services/attendanceService';
import { encodeData } from '@/utils/cryptoHelpers';
import Toast from 'react-native-toast-message';
import { Snackbar } from 'react-native-paper';
import moment from 'moment';

interface RegularizeModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (form: any) => void;
}

const RegularizeModal: React.FC<RegularizeModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const userData = useSelector((state: RootState) => state.user.profile);
  const { names } = useSelector((state: RootState) => state.user);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
  });

  // 👇 Single state object for form
  const [form, setForm] = useState({
    attendanceDay: null,
    selectedName: '',
    requestTo: '',
    requestFor: '',
    captureMode: '',
    timeIn: new Date(),
    timeOut: new Date(),
    reason: '',
    otherReason: '',
    description: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPunchOutPicker, setShowPunchOutPicker] = useState(false);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isSelectedNameOpen, setIsSelectedNameOpen] = useState(false);
  const [isRequestForOpen, setIsRequestForOpen] = useState(false);
  const [isCaptureModeOpen, setIsCaptureModeOpen] = useState(false);
  const [isReasonOpen, setIsReasonOpen] = useState(false);

  // 🔹 Build reasonList only when userData or requestFor changes
  const reasonList = useMemo(() => {
    const apiReasonsEnabled =
      userData?.AttendancePolicy?.regularization?.regularization_reason
        ?.regularization_reason_required_enabled;

    const reasonsFromAPI =
      userData?.AttendancePolicy?.regularization?.regularization_reason
        ?.regularization_reasons || [];

    const base: { label: string; value: string }[] = [];

    // 🔹 Add conditional static reasons
    if (form.requestFor === 'Punch-In') {
      base.push({ label: 'Forgot to punch-in', value: 'Forgot to punch-in' });
    }
    if (form.requestFor === 'Punch-Out') {
      base.push({ label: 'Forgot to punch-out', value: 'Forgot to punch-out' });
    }
    if (form.requestFor === 'Both') {
      base.push({
        label: 'Forgot to punch-in and punch-out',
        value: 'Forgot to punch-in and punch-out',
      });
    }

    base.push(
      { label: 'Network issue', value: 'Network issue' },
      { label: 'Other', value: 'Other' },
    );

    // 🔹 If API reasons are enabled, merge them + base
    if (apiReasonsEnabled) {
      return [
        ...reasonsFromAPI.map((r: string) => ({ label: r, value: r })),
        ...base,
      ];
    }

    return base;
  }, [userData, form.requestFor]);

  // 🔹 Memoized helper for updating form fields
  const updateForm = useCallback(
    (field: string, value: any) => {
      setForm(prev => ({ ...prev, [field]: value }));
      if (formErrors[field]) {
        setFormErrors(prev => {
          const { [field]: removed, ...rest } = prev;
          return rest;
        });
      }
    },
    [formErrors],
  );

  // 🔹 Reset all
  const resetAllState = useCallback(() => {
    setForm({
      attendanceDay: null,
      requestTo: '',
      selectedName: '',
      requestFor: '',
      captureMode: '',
      timeIn: new Date(),
      timeOut: new Date(),
      reason: '',
      otherReason: '',
      description: '',
    });
    setFormErrors({});
  }, []);

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!form.attendanceDay)
      errors.attendanceDay = 'Attendance day is required.';
    if (!form.selectedName) errors.selectedName = 'Request to is required.';
    if (!form.requestFor) errors.requestFor = 'Request for is required.';
    if (!form.captureMode) errors.captureMode = 'Capture mode is required.';
    if (
      (form.requestFor === 'Punch-In' || form.requestFor === 'Both') &&
      !form.timeIn
    ) {
      errors.timeIn = 'Punch-In time is required.';
    }
    if (
      (form.requestFor === 'Punch-Out' || form.requestFor === 'Both') &&
      !form.timeOut
    ) {
      errors.timeOut = 'Punch-Out time is required.';
    }
    if (!form.reason) errors.reason = 'Reason is required.';
    if (form.reason === 'Other' && !form.otherReason.trim()) {
      errors.otherReason = 'Other reason is required.';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setLoading(true);

      const payload = encodeData({
        user_id: userData?.user_id,
        request_date: form?.attendanceDay,
        check_in:
          form.requestFor === 'Punch-In' || form.requestFor === 'Both'
            ? form.timeIn.toISOString()
            : null,
        check_out:
          form.requestFor === 'Punch-Out' || form.requestFor === 'Both'
            ? form.timeOut.toISOString()
            : null,
        capture_mode: form.captureMode,
        request_to: form.requestTo,
        reason: form.reason === 'Other' ? form.otherReason : form.reason,
        description: form.description,
        status_updated_by: form.requestTo,
        request_for:
          form.requestFor === 'Punch-Out'
            ? 'checkOut'
            : form.requestFor === 'Punch-In'
              ? 'checkIn'
              : 'both',
      });

      const res = await attendanceService.raiseAttendanceRequest({ payload });
      if (res.success) {
        Toast.show({
          type: 'success',
          text1: res.message || 'Attendance request submitted',
        });
        resetAllState();
        onClose();
      } else {
        setSnackbar({
          visible: true,
          message: res.message || 'Failed to submit request',
        });
      }
    } catch (err: any) {
      setSnackbar({
        visible: true,
        message: err.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
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

  useEffect(() => {
    updateForm('reason', '');
  }, [form.requestFor]);

  return (
    <>
      <AppModal visible={visible} onClose={onClose}>

        <ScrollView style={{ maxHeight: 600 }} showsVerticalScrollIndicator>
          <View style={styles.iconGeneralCircle}>
            <Edit2 size="20" color="#0E79B6" />
          </View>

          <Text style={styles.heading}>Regularize</Text>
          <Text style={styles.subheading}>
            Please fill out the details below to regularize your attendance.
          </Text>

          {/* Attendance Day */}
          <View style={styles.field}>
            <Text>
              Attendance Day <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.inputBox}
              onPress={() => {
                setShowDatePicker(true);
                updateForm('attendanceDay', form.attendanceDay);
              }}
            >
              <Text>
                {form?.attendanceDay
                  ? moment(form.attendanceDay).format('DD/MMM/YYYY')
                  : 'Select Date'}
              </Text>
            </TouchableOpacity>
            {formErrors.attendanceDay && (
              <Text style={styles.errorText}>{formErrors.attendanceDay}</Text>
            )}
            {showDatePicker && (
              <DateTimePicker
                value={form?.attendanceDay ? new Date(form.attendanceDay) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) updateForm('attendanceDay', selectedDate);
                }}
              />
            )}
          </View>

          {/* Request To */}
          <View style={styles.field}>
            <Text>
              Request To <Text style={{ color: 'red' }}>*</Text>
            </Text>
            {Platform.OS === 'ios' ? (
              // ---------------- iOS: Custom Dropdown ----------------
              <View style={{ position: 'relative' }}>
                <TouchableOpacity
                  style={[
                    styles.leaveInputWrapper,
                    {
                      height: 42,
                      backgroundColor: 'white',
                      marginTop: 6
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setIsSelectedNameOpen(prev => !prev)}
                >
                  <Text
                    style={
                      form.selectedName
                        ? styles.leaveValueText
                        : styles.leavePlaceholderText
                    }
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {form.selectedName
                      ? renderUserOptions(userData, names).find(
                        item => item.value === form.selectedName
                      )?.label
                      : 'Select Reporting Manager/HR'}
                  </Text>

                  <Text style={styles.leaveArrow}>▾</Text>
                </TouchableOpacity>

                {isSelectedNameOpen && (
                  <View style={styles.leaveDropdown}>
                    <ScrollView style={{ maxHeight: 250 }}>
                      {renderUserOptions(userData, names).map(item => (
                        <TouchableOpacity
                          key={item.value}
                          style={styles.leaveOption}
                          onPress={() => {
                            setIsSelectedNameOpen(false);
                            updateForm('selectedName', item.value);
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
                onValueChange={(value) => {
                  updateForm('selectedName', value);
                }}
                items={renderUserOptions(userData, names)}
                value={form.selectedName}
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

            {formErrors.selectedName && (
              <Text style={styles.errorText}>{formErrors.selectedName}</Text>
            )}
          </View>

          {/* Request For */}
          <View style={styles.field}>
            <Text>
              Request For <Text style={{ color: 'red' }}>*</Text>
            </Text>
            {Platform.OS === 'ios' ? (
              // ---------------- iOS: Custom Dropdown ----------------
              <View style={{ position: 'relative' }}>
                <TouchableOpacity
                  style={[
                    styles.leaveInputWrapper,
                    {
                      height: 42,
                      backgroundColor: 'white',
                      marginTop: 6
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setIsRequestForOpen(prev => !prev)}
                >
                  <Text
                    style={
                      form.requestFor
                        ? styles.leaveValueText
                        : styles.leavePlaceholderText
                    }
                  >
                    {form.requestFor || 'Select Request For'}
                  </Text>

                  <Text style={styles.leaveArrow}>▾</Text>
                </TouchableOpacity>

                {isRequestForOpen && (
                  <View style={styles.leaveDropdown}>
                    <ScrollView style={{ maxHeight: 200 }}>
                      {[
                        { label: 'Punch-In', value: 'Punch-In' },
                        { label: 'Punch-Out', value: 'Punch-Out' },
                        { label: 'Both', value: 'Both' },
                      ].map(item => (
                        <TouchableOpacity
                          key={item.value}
                          style={styles.leaveOption}
                          onPress={() => {
                            setIsRequestForOpen(false);
                            updateForm('requestFor', item.value);
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
                onValueChange={(value) => {
                  updateForm('requestFor', value);
                }}
                items={[
                  { label: 'Punch-In', value: 'Punch-In' },
                  { label: 'Punch-Out', value: 'Punch-Out' },
                  { label: 'Both', value: 'Both' },
                ]}
                value={form.requestFor}
                placeholder={{ label: 'Select Request For', value: '' }}
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

            {formErrors.requestFor && (
              <Text style={styles.errorText}>{formErrors.requestFor}</Text>
            )}
          </View>

          {/* Capture Mode */}
          <View style={styles.field}>
            <Text>
              Capture Mode <Text style={{ color: 'red' }}>*</Text>
            </Text>
            {Platform.OS === 'ios' ? (
              // ---------------- iOS: Custom Dropdown ----------------
              <View style={{ position: 'relative' }}>
                <TouchableOpacity
                  style={[
                    styles.leaveInputWrapper,
                    {
                      height: 42,
                      backgroundColor: 'white',
                      marginTop: 6
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setIsCaptureModeOpen(prev => !prev)}
                >
                  <Text
                    style={
                      form.captureMode
                        ? styles.leaveValueText
                        : styles.leavePlaceholderText
                    }
                  >
                    {form.captureMode || 'Select Capture Mode'}
                  </Text>

                  <Text style={styles.leaveArrow}>▾</Text>
                </TouchableOpacity>

                {isCaptureModeOpen && (
                  <View style={styles.leaveDropdown}>
                    <ScrollView style={{ maxHeight: 200 }}>
                      {[
                        { label: 'Web', value: 'Web' },
                        { label: 'Remote', value: 'Remote' },
                      ].map(item => (
                        <TouchableOpacity
                          key={item.value}
                          style={styles.leaveOption}
                          onPress={() => {
                            setIsCaptureModeOpen(false);
                            updateForm('captureMode', item.value);
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
                onValueChange={(value) => {
                  updateForm('captureMode', value);
                }}
                items={[
                  { label: 'Web', value: 'Web' },
                  { label: 'Remote', value: 'Remote' },
                ]}
                value={form.captureMode}
                placeholder={{ label: 'Select Capture Mode', value: '' }}
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

            {formErrors.captureMode && (
              <Text style={styles.errorText}>{formErrors.captureMode}</Text>
            )}
          </View>

          {/* Punch-In Time */}
          {(form.requestFor === 'Punch-In' || form.requestFor === 'Both') && (
            <View style={styles.field}>
              <Text>
                Punch-in <Text style={{ color: 'red' }}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.inputBox}
                onPress={() => setShowTimePicker(true)}
              >
                <Text>
                  {form.timeIn.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </TouchableOpacity>
              {formErrors.timeIn && (
                <Text style={styles.errorText}>{formErrors.timeIn}</Text>
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={form.timeIn}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(false);
                    if (selectedTime) updateForm('timeIn', selectedTime);
                  }}
                />
              )}
            </View>
          )}

          {/* Punch-Out Time */}
          {(form.requestFor === 'Punch-Out' || form.requestFor === 'Both') && (
            <View style={styles.field}>
              <Text>
                Punch-out <Text style={{ color: 'red' }}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.inputBox}
                onPress={() => setShowPunchOutPicker(true)}
              >
                <Text>
                  {form.timeOut.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </TouchableOpacity>
              {formErrors.timeOut && (
                <Text style={styles.errorText}>{formErrors.timeOut}</Text>
              )}
              {showPunchOutPicker && (
                <DateTimePicker
                  value={form.timeOut}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedTime) => {
                    setShowPunchOutPicker(false);
                    if (selectedTime) updateForm('timeOut', selectedTime);
                  }}
                />
              )}
            </View>
          )}

          {/* Reason */}
          <View style={styles.field}>
            <Text>
              Reason <Text style={{ color: 'red' }}>*</Text>
            </Text>
            {Platform.OS === 'ios' ? (
              // ---------------- iOS: Custom Dropdown ----------------
              <View style={{ position: 'relative' }}>
                <TouchableOpacity
                  style={[
                    styles.leaveInputWrapper,
                    {
                      height: 42,
                      backgroundColor: 'white',
                      marginTop: 6
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setIsReasonOpen(prev => !prev)}
                >
                  <Text
                    style={
                      form.reason
                        ? styles.leaveValueText
                        : styles.leavePlaceholderText
                    }
                  >
                    {form.reason
                      ? reasonList.find(r => r.value === form.reason)?.label
                      : 'Select Reason'}
                  </Text>

                  <Text style={styles.leaveArrow}>▾</Text>
                </TouchableOpacity>

                {isReasonOpen && (
                  <View style={styles.leaveDropdown}>
                    <ScrollView style={{ maxHeight: 220 }}>
                      {reasonList.map(item => (
                        <TouchableOpacity
                          key={item.value}
                          style={styles.leaveOption}
                          onPress={() => {
                            setIsReasonOpen(false);
                            updateForm('reason', item.value);
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
                onValueChange={(value) => {
                  updateForm('reason', value);
                }}
                items={reasonList}
                value={form.reason}
                placeholder={{ label: 'Select Reason', value: null }}
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

            {formErrors.reason && (
              <Text style={styles.errorText}>{formErrors.reason}</Text>
            )}

            {form.reason === 'Other' && (
              <View style={{ marginTop: 12 }}>
                <Text>
                  Other Reason <Text style={{ color: 'red' }}>*</Text>
                </Text>
                <TextInput
                  value={form.otherReason}
                  onChangeText={text => updateForm('otherReason', text)}
                  placeholder="Enter other reason (Max. 50 characters)"
                  maxLength={50}
                  style={styles.inputBox}
                />
                {formErrors.otherReason && (
                  <Text style={styles.errorText}>{formErrors.otherReason}</Text>
                )}
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text>Description</Text>
            <TextInput
              placeholder="Enter Description"
              value={form.description}
              onChangeText={text => updateForm('description', text)}
              multiline
              style={styles.textArea}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              {loading ? 'Submitting...' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
          duration={3000}
          style={{
            backgroundColor: '#E53935',
            borderRadius: 8,
            top: -100
          }}
        >
          {snackbar.message}
        </Snackbar>
      </AppModal >
    </>
  );
};

export default RegularizeModal;

const styles = StyleSheet.create({
  iconGeneralCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heading: { fontSize: 18, fontWeight: '700', marginBottom: 10, marginTop: 8 },
  subheading: { color: '#666', marginBottom: 16 },
  field: { marginBottom: 12 },
  inputBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginTop: 6,
  },
  errorText: { color: '#E02D3C', fontSize: 12 },
  submitBtn: {
    backgroundColor: '#0E79B6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    height: 80,
    textAlignVertical: 'top',
    marginTop: 6,
  },
  leaveInputWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },

  leavePlaceholderText: {
    color: '#999',
    fontSize: 14,
  },

  leaveValueText: {
    color: '#000',
    fontSize: 14,
    display: 'flex',
    flexWrap: 'nowrap',
  },

  leaveArrow: {
    fontSize: 14,
    color: '#555',
  },

  leaveDropdown: {
    position: 'absolute',
    top: 45,                // list BELOW the input
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    zIndex: 9999,          // ensure it floats above everything
    elevation: 5,          // Android shadow
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  leaveOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  leaveOptionText: {
    fontSize: 14,
    color: '#000',
  },
});

const pickerSelectStyles = {
  inputIOS: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginTop: 6,
    // marginBottom: 12,
  },
  inputAndroid: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginTop: 6,
    // marginBottom: 12,
  },
  placeholder: {
    color: '#888',
  },
};
