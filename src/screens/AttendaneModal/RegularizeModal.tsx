import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  StyleSheet,
  Alert,
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
  const [attendanceDay, setAttendanceDay] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [requestTo, setRequestTo] = useState<string | null>(null);
  const [requestFor, setRequestFor] = useState<string | null>('');
  const [captureMode, setCaptureMode] = useState<string | null>('');
  const [timeIn, setTimeIn] = useState(new Date());
  const [timeOut, setTimeOut] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPunchOutPicker, setShowPunchOutPicker] = useState(false);

  const [reason, setReason] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [loading, setLoading] = useState(false);
  const [reasonList, setReasonList] = useState<
    { label: string; value: string }[]
  >([]);
  const [otherReason, setOtherReason] = useState<string>('');

  useEffect(() => {
    if (userData?.AttendancePolicy) {
      const userReasonList = userData?.AttendancePolicy?.regularization
        ?.regularization_reason?.regularization_reason_required_enabled
        ? userData.AttendancePolicy.regularization.regularization_reason.regularization_reasons.map(
            (r: string) => ({
              label: r,
              value: r,
            }),
          )
        : [];

      if (userReasonList.length > 0) {
        // If reasons come from API, just append "Other"
        setReasonList([...userReasonList, { label: 'Other', value: 'Other' }]);
      } else {
        // Build list dynamically based on requestFor
        const baseReasons = [];

        if (requestFor === 'Punch-In') {
          baseReasons.push({
            label: 'Forgot to punch-in',
            value: 'Forgot to punch-in',
          });
        }
        if (requestFor === 'Punch-Out') {
          baseReasons.push({
            label: 'Forgot to punch-out',
            value: 'Forgot to punch-out',
          });
        }
        if (requestFor === 'Both') {
          baseReasons.push({
            label: 'Forgot to punch-in and punch-out',
            value: 'Forgot to punch-in and punch-out',
          });
        }

        baseReasons.push(
          { label: 'Network issue', value: 'Network issue' },
          { label: 'Other', value: 'Other' },
        );

        setReasonList(baseReasons);
      }
    }
  }, [userData, requestFor]);

  // const handleSubmit = () => {
  //   onSubmit({
  //     attendanceDay,
  //     requestTo,
  //     requestFor,
  //     captureMode,
  //     timeIn,
  //     timeOut,
  //     reason,
  //     description,
  //   });
  //   onClose();
  // };

  // const handleSubmit = () => {
  //   const errors: Record<string, string> = {};

  //   // Attendance Day
  //   if (!attendanceDay) {
  //     errors.attendanceDay = 'Attendance day is required.';
  //   }

  //   // Request To
  //   if (!selectedName) {
  //     errors.selectedName = 'Request to is required.';
  //   }

  //   // Request For
  //   if (!requestFor) {
  //     errors.requestFor = 'Request for is required.';
  //   }

  //   // Capture Mode
  //   if (!captureMode) {
  //     errors.captureMode = 'Capture mode is required.';
  //   }

  //   // Punch-In validation
  //   if ((requestFor === 'Punch-In' || requestFor === 'Both') && !timeIn) {
  //     errors.timeIn = 'Punch-In time is required.';
  //   }

  //   // Punch-Out validation
  //   if ((requestFor === 'Punch-Out' || requestFor === 'Both') && !timeOut) {
  //     errors.timeOut = 'Punch-Out time is required.';
  //   }

  //   // Reason validation
  //   if (!reason) {
  //     errors.reason = 'Reason is required.';
  //   }

  //   // Conditional Other Reason
  //   if (reason === 'Other' && !otherReason.trim()) {
  //     errors.otherReason = 'Other reason is required.';
  //   }

  //   setFormErrors(errors);

  //   if (Object.keys(errors).length > 0) {
  //     return; // Stop if errors
  //   }

  //   // Submit logic here
  //   console.log('Form Submitted Successfully');
  //   onSubmit({
  //     attendanceDay,
  //     requestTo,
  //     requestFor,
  //     captureMode,
  //     timeIn,
  //     timeOut,
  //     reason,
  //     description,
  //   });
  //   onClose();
  // };

  const resetAllState = () => {
    setAttendanceDay(new Date());
    setSelectedName('');
    setRequestFor('');
    setCaptureMode('');
    setTimeIn(new Date());
    setTimeOut(new Date());
    setReason('');
    setOtherReason('');
    setDescription('');
    setFormErrors({});
  };

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};

    // === VALIDATION ===
    if (!attendanceDay) errors.attendanceDay = 'Attendance day is required.';
    if (!selectedName) errors.selectedName = 'Request to is required.';
    if (!requestFor) errors.requestFor = 'Request for is required.';
    if (!captureMode) errors.captureMode = 'Capture mode is required.';
    if ((requestFor === 'Punch-In' || requestFor === 'Both') && !timeIn) {
      errors.timeIn = 'Punch-In time is required.';
    }
    if ((requestFor === 'Punch-Out' || requestFor === 'Both') && !timeOut) {
      errors.timeOut = 'Punch-Out time is required.';
    }
    if (!reason) errors.reason = 'Reason is required.';
    if (reason === 'Other' && !otherReason.trim()) {
      errors.otherReason = 'Other reason is required.';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setLoading(true);

      const payload = encodeData({
        user_id: userData?.user_id,
        request_date: attendanceDay,
        check_in:
          requestFor === 'Punch-In' || requestFor === 'Both'
            ? timeIn.toISOString()
            : null,
        check_out:
          requestFor === 'Punch-Out' || requestFor === 'Both'
            ? timeOut.toISOString()
            : null,
        capture_mode: captureMode,
        request_to: selectedName,
        reason: reason === 'Other' ? otherReason : reason,
        description,
        status_updated_by: selectedName,
        request_for: requestFor === 'Punch-Out'
            ? 'checkOut'
            : requestFor === 'Punch-In'
            ? 'checkIn'
            : 'both'
      });


      // === API CALL ===
      const res = await attendanceService.raiseAttendanceRequest({ payload });
      if (res.success) {
        Toast.show({
          type: 'success',
          text1: res.message || 'Attendance request submitted',
        });
        resetAllState();
        onClose();
      } else {
        Toast.show({
          type: 'error',
          text1: res.message || 'Failed to submit request',
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.message || 'Something went wrong',
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

  return (
    // <AppModal visible={visible} onClose={onClose}>
    //   <ScrollView style={{ maxHeight: 600 }} showsVerticalScrollIndicator>
    //     <View style={styles.iconGeneralCircle}>
    //       <Edit2 size="20" color="#0E79B6" />
    //     </View>
    //     <Text
    //       style={{
    //         fontSize: 18,
    //         fontWeight: '700',
    //         marginBottom: 10,
    //         marginTop: 8,
    //       }}
    //     >
    //       Regularize
    //     </Text>
    //     <Text style={{ color: '#666', marginBottom: 16 }}>
    //       Please fill out the details below to regularize your attendance.
    //     </Text>

    //     {/* Attendance Day */}
    //     <Text style={{ marginBottom: 6 }}>
    //       Attendance Day <Text style={{ color: 'red' }}>*</Text>
    //     </Text>
    //     <TouchableOpacity
    //       style={{
    //         padding: 12,
    //         borderWidth: 1,
    //         borderColor: '#ccc',
    //         borderRadius: 6,
    //         marginBottom: 12,
    //       }}
    //       onPress={() => setShowDatePicker(true)}
    //     >
    //       <Text>{attendanceDay.toLocaleDateString('en-GB')}</Text>
    //     </TouchableOpacity>
    //     {formErrors.attendanceDay && (
    //       <Text style={styles.errorText}>{formErrors.attendanceDay}</Text>
    //     )}
    //     {showDatePicker && (
    //       <DateTimePicker
    //         value={attendanceDay}
    //         mode="date"
    //         display={Platform.OS === 'ios' ? 'spinner' : 'default'}
    //         onChange={(event, selectedDate) => {
    //           setShowDatePicker(false);
    //           if (selectedDate) setAttendanceDay(selectedDate);
    //         }}
    //       />
    //     )}

    //     {/* Request To */}
    //     <Text style={{ marginBottom: 6, marginTop: 6 }}>
    //       Request To <Text style={{ color: 'red' }}>*</Text>
    //     </Text>
    //     <RNPickerSelect
    //       onValueChange={setSelectedName}
    //       items={renderUserOptions(userData, names)}
    //       value={selectedName}
    //       placeholder={{ label: 'Select Reporting Manager/HR', value: '' }}
    //       style={pickerSelectStyles}
    //       useNativeAndroidPickerStyle={false}
    //     />
    //     {formErrors.selectedName && (
    //       <Text style={styles.errorText}>{formErrors.selectedName}</Text>
    //     )}

    //     {/* Request For */}
    //     <Text style={{ marginVertical: 6 }}>
    //       Request For <Text style={{ color: 'red' }}>*</Text>
    //     </Text>
    //     <RNPickerSelect
    //       onValueChange={value => setRequestFor(value)}
    //       items={[
    //         { label: 'Punch-In', value: 'Punch-In' },
    //         { label: 'Punch-Out', value: 'Punch-Out' },
    //         { label: 'Both', value: 'Both' },
    //       ]}
    //       style={pickerSelectStyles}
    //       value={requestFor}
    //       useNativeAndroidPickerStyle={false}
    //     />

    //     <Text style={{ marginVertical: 6 }}>
    //       Capture Mode <Text style={{ color: 'red' }}>*</Text>
    //     </Text>
    //     <RNPickerSelect
    //       onValueChange={value => setCaptureMode(value)}
    //       items={[
    //         { label: 'Web', value: 'Web' },
    //         { label: 'Remote', value: 'Remote' },
    //       ]}
    //       style={pickerSelectStyles}
    //       value={captureMode}
    //       useNativeAndroidPickerStyle={false}
    //     />

    //     {/* Punch-In Time (only if Punch-In or Both) */}
    //     {(requestFor === 'Punch-In' || requestFor === 'Both') && (
    //       <>
    //         <Text style={{ marginBottom: 6, marginTop: 6 }}>
    //           Punch-in <Text style={{ color: 'red' }}>*</Text>
    //         </Text>
    //         <TouchableOpacity
    //           style={{
    //             padding: 12,
    //             borderWidth: 1,
    //             borderColor: '#ccc',
    //             borderRadius: 6,
    //             marginBottom: 12,
    //           }}
    //           onPress={() => setShowTimePicker(true)}
    //         >
    //           <Text>
    //             {timeIn.toLocaleTimeString([], {
    //               hour: '2-digit',
    //               minute: '2-digit',
    //               hour12: true,
    //             })}
    //           </Text>
    //         </TouchableOpacity>
    //         {showTimePicker && (
    //           <DateTimePicker
    //             value={timeIn}
    //             mode="time"
    //             display={Platform.OS === 'ios' ? 'spinner' : 'default'}
    //             onChange={(event, selectedTime) => {
    //               setShowTimePicker(false);
    //               if (selectedTime) setTimeIn(selectedTime);
    //             }}
    //           />
    //         )}
    //       </>
    //     )}

    //     {/* Punch-Out Time (only if Punch-Out or Both) */}
    //     {(requestFor === 'Punch-Out' || requestFor === 'Both') && (
    //       <>
    //         <Text style={{ marginBottom: 6, marginTop: 6 }}>
    //           Punch-out <Text style={{ color: 'red' }}>*</Text>
    //         </Text>
    //         <TouchableOpacity
    //           style={{
    //             padding: 12,
    //             borderWidth: 1,
    //             borderColor: '#ccc',
    //             borderRadius: 6,
    //             marginBottom: 12,
    //           }}
    //           onPress={() => setShowPunchOutPicker(true)}
    //         >
    //           <Text>
    //             {timeOut.toLocaleTimeString([], {
    //               hour: '2-digit',
    //               minute: '2-digit',
    //               hour12: true,
    //             })}
    //           </Text>
    //         </TouchableOpacity>
    //         {showPunchOutPicker && (
    //           <DateTimePicker
    //             value={timeOut}
    //             mode="time"
    //             display={Platform.OS === 'ios' ? 'spinner' : 'default'}
    //             onChange={(event, selectedTime) => {
    //               setShowPunchOutPicker(false);
    //               if (selectedTime) setTimeOut(selectedTime);
    //             }}
    //           />
    //         )}
    //       </>
    //     )}

    //     {/* Reason */}
    //     <View style={{ marginBottom: 6, marginTop: 6 }}>
    //       {/* Label */}
    //       <Text style={{ marginBottom: 6 }}>
    //         Reason <Text style={{ color: 'red' }}>*</Text>
    //       </Text>

    //       {/* Dropdown */}
    //       <RNPickerSelect
    //         onValueChange={value => setReason(value)}
    //         items={reasonList}
    //         value={reason}
    //         style={pickerSelectStyles}
    //         placeholder={{ label: 'Select Reason', value: null }}
    //         useNativeAndroidPickerStyle={false}
    //       />

    //       {/* Conditionally show text input if Other is selected */}
    //       {reason === 'Other' && (
    //         <>
    //           <Text style={{ marginBottom: 6, marginTop: 12 }}>
    //             Other Reason <Text style={{ color: 'red' }}>*</Text>
    //           </Text>
    //           <TextInput
    //             value={otherReason}
    //             onChangeText={setOtherReason}
    //             placeholder="Enter other reason (Max. 50 characters)"
    //             maxLength={50}
    //             style={{
    //               borderWidth: 1,
    //               borderColor: '#ccc',
    //               borderRadius: 6,
    //               padding: 12,
    //               marginBottom: 12,
    //             }}
    //           />
    //         </>
    //       )}
    //     </View>

    //     {/* Description */}
    //     <Text style={{ marginBottom: 6, marginTop: 6 }}>Description</Text>
    //     <TextInput
    //       placeholder="Enter Description"
    //       value={description}
    //       onChangeText={setDescription}
    //       multiline
    //       style={{
    //         borderWidth: 1,
    //         borderColor: '#ccc',
    //         borderRadius: 6,
    //         padding: 10,
    //         height: 80,
    //         textAlignVertical: 'top',
    //       }}
    //     />

    //     {/* Submit Button */}
    //     <TouchableOpacity
    //       style={{
    //         backgroundColor: '#0E79B6',
    //         padding: 12,
    //         borderRadius: 8,
    //         alignItems: 'center',
    //         marginTop: 16,
    //       }}
    //       onPress={handleSubmit}
    //     >
    //       <Text style={{ color: '#fff', fontWeight: '600' }}>Submit</Text>
    //     </TouchableOpacity>
    //   </ScrollView>
    // </AppModal>
    <AppModal visible={visible} onClose={onClose}>
      <ScrollView style={{ maxHeight: 600 }} showsVerticalScrollIndicator>
        <View style={styles.iconGeneralCircle}>
          <Edit2 size="20" color="#0E79B6" />
        </View>

        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            marginBottom: 10,
            marginTop: 8,
          }}
        >
          Regularize
        </Text>
        <Text style={{ color: '#666', marginBottom: 16 }}>
          Please fill out the details below to regularize your attendance.
        </Text>

        {/* Attendance Day */}
        <View style={{ marginBottom: 12 }}>
          <Text>
            Attendance Day <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <TouchableOpacity
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 6,
              marginTop: 6,
            }}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{attendanceDay.toLocaleDateString('en-GB')}</Text>
          </TouchableOpacity>
          {formErrors.attendanceDay && (
            <Text style={styles.errorText}>{formErrors.attendanceDay}</Text>
          )}
          {showDatePicker && (
            <DateTimePicker
              value={attendanceDay}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setAttendanceDay(selectedDate);
              }}
            />
          )}
        </View>

        {/* Request To */}
        <View style={{ marginBottom: 12 }}>
          <Text>
            Request To <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <RNPickerSelect
            onValueChange={setSelectedName}
            items={renderUserOptions(userData, names)}
            value={selectedName}
            placeholder={{ label: 'Select Reporting Manager/HR', value: '' }}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
          />
          {formErrors.selectedName && (
            <Text style={styles.errorText}>{formErrors.selectedName}</Text>
          )}
        </View>

        {/* Request For */}
        <View style={{ marginBottom: 12 }}>
          <Text>
            Request For <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <RNPickerSelect
            onValueChange={value => setRequestFor(value)}
            items={[
              { label: 'Punch-In', value: 'Punch-In' },
              { label: 'Punch-Out', value: 'Punch-Out' },
              { label: 'Both', value: 'Both' },
            ]}
            style={pickerSelectStyles}
            value={requestFor}
            useNativeAndroidPickerStyle={false}
          />
          {formErrors.requestFor && (
            <Text style={styles.errorText}>{formErrors.requestFor}</Text>
          )}
        </View>

        {/* Capture Mode */}
        <View style={{ marginBottom: 12 }}>
          <Text>
            Capture Mode <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <RNPickerSelect
            onValueChange={value => setCaptureMode(value)}
            items={[
              { label: 'Web', value: 'Web' },
              { label: 'Remote', value: 'Remote' },
            ]}
            style={pickerSelectStyles}
            value={captureMode}
            useNativeAndroidPickerStyle={false}
          />
          {formErrors.captureMode && (
            <Text style={styles.errorText}>{formErrors.captureMode}</Text>
          )}
        </View>

        {/* Punch-In Time */}
        {(requestFor === 'Punch-In' || requestFor === 'Both') && (
          <View style={{ marginBottom: 12 }}>
            <Text>
              Punch-in <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TouchableOpacity
              style={{
                padding: 12,
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 6,
                marginTop: 6,
              }}
              onPress={() => setShowTimePicker(true)}
            >
              <Text>
                {timeIn.toLocaleTimeString([], {
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
                value={timeIn}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) setTimeIn(selectedTime);
                }}
              />
            )}
          </View>
        )}

        {/* Punch-Out Time */}
        {(requestFor === 'Punch-Out' || requestFor === 'Both') && (
          <View style={{ marginBottom: 12 }}>
            <Text>
              Punch-out <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TouchableOpacity
              style={{
                padding: 12,
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 6,
                marginTop: 6,
              }}
              onPress={() => setShowPunchOutPicker(true)}
            >
              <Text>
                {timeOut.toLocaleTimeString([], {
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
                value={timeOut}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedTime) => {
                  setShowPunchOutPicker(false);
                  if (selectedTime) setTimeOut(selectedTime);
                }}
              />
            )}
          </View>
        )}

        {/* Reason */}
        <View style={{ marginBottom: 12 }}>
          <Text>
            Reason <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <RNPickerSelect
            onValueChange={value => setReason(value)}
            items={reasonList}
            value={reason}
            style={pickerSelectStyles}
            placeholder={{ label: 'Select Reason', value: null }}
            useNativeAndroidPickerStyle={false}
          />
          {formErrors.reason && (
            <Text style={styles.errorText}>{formErrors.reason}</Text>
          )}

          {reason === 'Other' && (
            <View style={{ marginTop: 8 }}>
              <Text>
                Other Reason <Text style={{ color: 'red' }}>*</Text>
              </Text>
              <TextInput
                value={otherReason}
                onChangeText={setOtherReason}
                placeholder="Enter other reason (Max. 50 characters)"
                maxLength={50}
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 6,
                  padding: 12,
                  marginTop: 6,
                }}
              />
              {formErrors.otherReason && (
                <Text style={styles.errorText}>{formErrors.otherReason}</Text>
              )}
            </View>
          )}
        </View>

        {/* Description */}
        <View style={{ marginBottom: 12 }}>
          <Text>Description</Text>
          <TextInput
            placeholder="Enter Description"
            value={description}
            onChangeText={setDescription}
            multiline
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 6,
              padding: 10,
              height: 80,
              textAlignVertical: 'top',
              marginTop: 6,
            }}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={{
            backgroundColor: '#0E79B6',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 16,
          }}
          onPress={handleSubmit}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </AppModal>
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
  errorText: {
    color: '#E02D3C',
    fontSize: 12,
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
};
