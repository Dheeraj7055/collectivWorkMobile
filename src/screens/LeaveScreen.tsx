import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { ProgressCircle } from 'react-native-svg-charts';
import { styles, pickerSelectStyles } from '@/styles/leaveStyles';
import {
  MoreVertical,
  Plus,
  Search,
  Upload,
  XCircleIcon,
} from 'lucide-react-native';
import { Card } from '@/components/Card';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/Header';
import { useDispatch, useSelector } from 'react-redux';
import {
  createLeave,
  fetchLeaves,
  fetchUserLeaveQuotaList,
  withdrawLeave,
} from '@/redux/slices/leaveSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchUserData, fetchUserNamesList } from '@/redux/slices/userSlice';
import moment from 'moment';
import AppModal from '@/common/AppModal';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { AppStackParamList, MainTabParamList } from '@/navigation/AppNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import LeaveBalanceDonut from '@/components/LeaveBalanceDonut';
import ConfirmationModal from '@/common/ConfirmationModal';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { RefreshableList } from '@/common/RefreshableList';
import { Picker as NativePicker } from '@react-native-picker/picker';
import { Snackbar } from 'react-native-paper';

type LeaveScreenRoute = RouteProp<MainTabParamList, 'Leave'>;

interface LeaveSummary {
  id: string;
  title: string;
  short: string;
  consumed: number;
  allocated: number;
  annual: number;
  color: string;
}

interface LeaveRequest {
  id: string;
  type: string;
  requestType: string;
  requestTo: string;
  from: string;
  to: string;
  days: number;
  status: 'Pending' | 'Approved' | 'Rejected';
}

type LeaveScreenNavProp = StackNavigationProp<AppStackParamList, 'MainTabs'>;
dayjs.extend(isSameOrBefore);

export const LeaveScreen: React.FC = () => {
  const userData = useSelector((state: RootState) => state.user.profile);
  const { names } = useSelector((state: RootState) => state.user);
  const { userLeaveQuotaList } = useSelector((state: RootState) => state.leave);
  const dispatch = useDispatch<AppDispatch>();
  const [leaveModalVisible, setLeaveModalVisible] = React.useState(false);
  const navigation = useNavigation<LeaveScreenNavProp>();
  // Request To dropdown
  const [selectedName, setSelectedName] = useState<string>('');
  const route = useRoute<LeaveScreenRoute>();
  const [activePicker, setActivePicker] = useState<
    null | 'single' | 'multiStart' | 'multiEnd' | 'halfShort'
  >(null);

  // Common form validation flag
  const [showErrors, setShowErrors] = useState<boolean>(false);

  // const [leaveListOptions, setLeaveListOptions] = useState<string[]>([]);
  // ----------------------------
  // State Declarations
  // ----------------------------
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('');
  const [singleDay, setSingleDay] = useState(false);
  const [multipleDay, setMultipleDay] = useState(false);
  const [halfDay, setHalfDay] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isClubChecked, setIsClubChecked] = useState<boolean | null>(null);
  type HalfDayType = 'first_half' | 'second_half' | '';

  const [startHalf, setStartHalf] = useState<HalfDayType>('');
  const [endHalf, setEndHalf] = useState<HalfDayType>('');

  // Attachments & Mandatory Rules
  const [mandatoryAttachment, setMandatoryAttachment] = useState(false);
  const [mandatoryFile, setMandatoryFile] = useState<any>(null);
  const [mandatoryRaiseDays, setMandatoryRaiseDays] = useState<number | null>(
    null,
  );
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [errorText, setErrorText] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
  });

  // Quota & Balance
  const [allowBeyondQuota, setAllowBeyondQuota] = useState(false);
  const [leaveRemainingLeaves, setLeaveRemainingLeaves] = useState<number>(0);
  const [leaveQuota, setLeaveQuota] = useState<number>(0);

  // Reasons
  const [reasonList, setReasonList] = useState<string[]>([]);
  const [reason, setReason] = useState<string>('');
  const [showOtherInput, setShowOtherInput] = useState<boolean>(false);
  const [otherReason, setOtherReason] = useState<string>('');

  // Backdated Rules
  const [backdatedLeaveEnabled, setBackdatedLeaveEnabled] = useState(false);
  const [limitLastDateEnabled, setLimitLastDateEnabled] = useState(false);
  const [backdatedLastDate, setBackdatedLastDate] = useState<string | null>(
    null,
  );

  // Club Leave
  const [clubLeaveAllowed, setClubLeaveAllowed] = useState(false);
  const [leaveClubedNotAllowed, setLeaveClubedNotAllowed] = useState<string[]>(
    [],
  );
  const [isLeaveTypeOpen, setIsLeaveTypeOpen] = useState(false);
  const [isDayTypeOpen, setIsDayTypeOpen] = useState(false);
  const [isEndHalfOpen, setIsEndHalfOpen] = useState(false);
  const [isStartHalfOpen, setIsStartHalfOpen] = useState(false);
  const [isNameOpen, setIsNameOpen] = useState(false);
  const [isReasonOpen, setIsReasonOpen] = useState(false);

  // Leave Duration Config
  const [allowedShortHalfday, setAllowedShortHalfday] = useState<{
    allow_half_day_leave: boolean;
    allow_short_leave: boolean;
  } | null>(null);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<
    number | string | null
  >(null);

  const [dayType, setDayType] = useState<string>('');

  interface LeaveData {
    leave_type: string;
    clubing: string | null;
    start_date: string;
    end_date: string;
    no_of_days: number;
  }

  // State with type
  const [leaveData, setLeaveData] = useState<LeaveData>({
    leave_type: '',
    clubing: null,
    start_date: '',
    end_date: '',
    no_of_days: 0,
  });

  // If you already have this from elsewhere, keep it
  const [clubing, setClubing] = useState<string | null>(null);

  const { records: leaveRequests } = useSelector(
    (state: RootState) => state.leave,
  );

  const dayTypeItems = [
    ...(allowedShortHalfday?.allow_short_leave
      ? [{ label: 'Short Day Leave', value: 'short' as const }]
      : []),
    ...(allowedShortHalfday?.allow_half_day_leave
      ? [{ label: 'Half Day Leave', value: 'half' as const }]
      : []),
    { label: 'Single Day Leave', value: 'single' as const },
    { label: 'Multiple Day Leave', value: 'multiple' as const },
  ];

  const selectedDayTypeLabel =
    dayTypeItems.find(item => item.value === dayType)?.label || '';

  const getLeaveDurationLabel = (no_of_days: number) => {
    if (no_of_days === 1) return 'Single Day';
    if (no_of_days > 1) return 'Multiple Days';
    if (no_of_days === 0.5) return 'Half Day';
    if (no_of_days < 0.5 && no_of_days > 0) return 'Short Leave';
    return '';
  };

  const handleLeaveChange = (value: string, type?: string) => {
    let removedLeave: string[] = [];

    // Update selected leave type
    setSelectedLeaveType(value);
    setMandatoryAttachment(false);

    // 🔹 Loop through userLeaveQuotaList configs
    userLeaveQuotaList?.leave_config?.forEach((item: any) => {
      if (value === item?.leave_type) {
        setMandatoryFile(item?.mandatory_attachments);
        setMandatoryRaiseDays(
          item?.mandatory_attachments ? item?.mandatory_raise_days : null,
        );

        setAllowBeyondQuota(
          item?.allow_request_beyond_quota_allocation
            ? item?.allow_request_beyond_quota_allocation === 'no'
              ? true
              : false
            : false,
        );

        setLeaveRemainingLeaves(item?.remaining_leaves);
        setReasonList(item?.reason_list);

        setBackdatedLeaveEnabled(
          item?.rules?.last_date_to_raise_back_dated_leave?.enabled,
        );

        setLimitLastDateEnabled(
          item?.rules?.last_date_to_raise_back_dated_leave
            ?.request_last_date_back_dated_enabled,
        );

        if (
          item?.rules?.last_date_to_raise_back_dated_leave
            ?.request_last_date_back_dated_enabled
        ) {
          setBackdatedLastDate(
            item?.rules?.last_date_to_raise_back_dated_leave?.value,
          );
        }
      }
    });

    // 🔹 Handle Club Leave Restrictions
    userData?.LeavePolicy?.LeavePolicyTypeMappings?.forEach((leave: any) => {
      if (leave?.LeaveType?.leave_name === value) {
        setClubLeaveAllowed(
          leave?.apply_rules
            ? leave?.apply_rules?.leave_application_restrictions?.club_leave
              ?.allowed === 'no'
              ? false
              : true
            : false,
        );

        if (leave?.apply_rules) {
          removedLeave.push(
            ...(leave?.apply_rules?.leave_application_restrictions?.club_leave
              ?.cannot_be_clubbed_with || []),
          );
        }

        removedLeave.push(value);
        setLeaveClubedNotAllowed(removedLeave);
      }
    });

    // 🔹 Update Leave Data
    setLeaveData(prev => ({
      ...prev,
      leave_type: value,
      clubing: clubing === value ? null : prev?.clubing,
    }));

    if (type === 'leave_duration') {
      const leaveTypeData =
        userData?.LeavePolicy?.LeavePolicyTypeMappings?.filter(
          (it: any) => it?.quota_allocation_rules != null,
        ).find(
          (it: any) =>
            it?.LeaveType.leave_name.toLowerCase() === value.toLowerCase(),
        )?.quota_allocation_rules?.leave_configuration;

      const updatedLeaveType = leaveTypeData
        ? leaveTypeData
        : {
          allow_half_day_leave: false,
          allow_short_leave: false,
        };

      const leaveQuotaDay = userLeaveQuotaList?.leave_config?.find(
        (it: any) => it?.leave_type.toLowerCase() === value.toLowerCase(),
      )?.remaining_leaves;

      setLeaveQuota(leaveQuotaDay);
      setAllowedShortHalfday(updatedLeaveType);
      setDayType('');
    }
  };

  const renderFakeInput = useCallback(
    (
      label: string,
      value: Date | null,
      onPress: () => void,
      errorField?: string,
    ) => (
      <TouchableOpacity
        style={styles.input}
        onPress={() => {
          if (errorField) clearError(errorField);
          onPress();
        }}
      >
        <Text style={{ color: value ? '#000' : '#888' }}>
          {value ? moment(value).format("DD/MM/YYYY") : label}
        </Text>
      </TouchableOpacity>
    ),
    [clearError]  
  );


  const handleDay = (value: string | null) => {
    if (!value) return;
    setDayType(value);

    setSingleDay(value === 'single');
    setMultipleDay(value === 'multiple');
    setHalfDay(value === 'half' || value === 'short');

    if (mandatoryFile) {
      let mandatoryEnabled = false;
      if (mandatoryRaiseDays !== null) {
        if (value === 'short') mandatoryEnabled = mandatoryRaiseDays < 0.25;
        else if (value === 'half') mandatoryEnabled = mandatoryRaiseDays < 0.5;
        else if (value === 'single') mandatoryEnabled = mandatoryRaiseDays < 1;
      }

      setMandatoryAttachment(mandatoryEnabled);
    }
  };

  const leaveCreationModal = () => {
    setLeaveModalVisible(true);
    dispatch(fetchUserNamesList({}));
  };

  const calculateTotalLeaveDays = useCallback(() => {
    if (!dayType || !startDate) return 0;

    if (dayType === 'short') return 0.25;
    if (dayType === 'half') return 0.5;
    if (dayType === 'single') return 1;

    if (dayType === 'multiple' && endDate) {
      const start = moment(startDate).startOf('day');
      const end = moment(endDate).startOf('day');
      const diff = end.diff(start, 'days') + 1;

      // Half-day adjustments
      if (startHalf === 'second_half' && endHalf === 'first_half')
        return diff - 1;
      if (startHalf === 'second_half') return diff - 0.5;
      if (endHalf === 'first_half') return diff - 0.5;

      return diff;
    }

    return 0;
  }, [dayType, startDate, endDate, startHalf, endHalf]);

  const clubLeaveEnabled = useCallback(() => {
    if (dayType !== 'multiple') return false;
    if (!multipleDay) return false;
    if (!clubLeaveAllowed) return false;
    return calculateTotalLeaveDays() > leaveRemainingLeaves;
  }, [
    dayType,
    multipleDay,
    clubLeaveAllowed,
    calculateTotalLeaveDays,
    leaveRemainingLeaves,
  ]);

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

  const handleReasonChange = (value: string) => {
    if (value === 'other') {
      setShowOtherInput(true);
      setReason('');
    } else {
      setShowOtherInput(false);
      setReason(value);
    }
  };

  const handleOtherReasonChange = (text: string) => {
    setOtherReason(text);
  };

  const handleCancelOther = () => {
    setShowOtherInput(false);
    setOtherReason('');
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
        setMandatoryAttachment(false);
      }
    } catch (err) {
      setErrorText('File upload failed.');
    }
  };

  const handleRemoveFile = (index: number) => {
    setFileList(prev => prev.filter((_, i) => i !== index));

    if (fileList.length <= 1 && mandatoryAttachment) {
      setMandatoryAttachment(true);
    }
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    date: Date | undefined,
    type: 'single' | 'multiStart' | 'multiEnd' | 'halfShort',
  ) => {
    if (event.type === 'dismissed') {
      setActivePicker(null);
      return;
    }

    setActivePicker(null);
    if (!date) return;

    if (type === 'single' || type === 'halfShort') {
      setStartDate(date);
      clearError('startDate')
    }
    if (type === 'multiStart') {
      setStartDate(date);
      clearError('startDate');
    }
    if (type === 'multiEnd') {
      setEndDate(date);
      clearError('endDate');
    }
  };

  const handleSubmit = () => {
    const errors: Record<string, string> = {};

    if (!subject.trim()) errors.subject = 'Subject is required.';
    if (!selectedLeaveType) errors.leaveType = 'Leave Type is required.';
    if (!dayType) errors.dayType = 'Leave Duration is required.';
    if (!selectedName) errors.requestTo = 'Request To is required.';
    if (!description.trim()) errors.description = 'Description is required.';

    // --- Extra validations based on dayType ---
    if (dayType === 'single' && !startDate) {
      errors.startDate = 'Date is required for single day leave.';
    }

    if (dayType === 'multiple') {
      if (!startDate) errors.startDate = 'Start date is required.';
      if (!endDate) errors.endDate = 'End date is required.';
      if (!startHalf) errors.startHalf = 'Start half is required.';
      if (!endHalf) errors.endHalf = 'End half is required.';

      if (startDate && endDate && moment(endDate).isBefore(moment(startDate))) {
        errors.endDate = 'End date cannot be before start date.';
      }
    }

    if ((dayType === 'half' || dayType === 'short') && !startDate) {
      errors.startDate = 'Date is required for half/short leave.';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      const matched = userLeaveQuotaList?.leave_config?.filter(
        (item: any) => item?.leave_type === selectedLeaveType,
      );
      const short_code = matched?.[0]?.leave_code || '';

      const payload = {
        subject,
        leave_type: selectedLeaveType,
        short_code,

        // Dates
        start_date: startDate ? moment(startDate).format('YYYY-MM-DD') : null,
        end_date:
          dayType === 'multiple' && endDate
            ? moment(endDate).format('YYYY-MM-DD')
            : moment(startDate).format('YYYY-MM-DD'),

        // Halves
        start_half: startHalf || 'first_half',
        end_half: endHalf || 'second_half',

        // Clubbing
        clubing: clubing || '',
        is_clubing: !!isClubChecked,

        // Duration type
        day_type: dayType,

        // Reason
        reason: reason === 'other' ? otherReason : reason,

        description,
        request_to: selectedName,
      };

      dispatch(createLeave({ payload, files: fileList }))
        .unwrap()
        .then(res => {
          setSubject('');
          setSelectedLeaveType('');
          setDayType('');
          setSelectedName('');
          setDescription('');
          setFileList([]);
          setStartDate(null);
          setEndDate(null);
          setStartHalf('');
          setEndHalf('');
          const payload = { current: 1, pageSize: 500, request_type: 'Admin' };
          dispatch(fetchLeaves(payload) as any);
          setLeaveModalVisible(false);
        })
        .catch(err => {
          setSnackbar({
            visible: true,
            message: err || 'Something went wrong',
          });
        });
    }
  };

  const openWithdrawalModal = (id: number | string) => {
    setSelectedLeaveId(id);
    setWithdrawModalVisible(true);
  };

  const handleWithdraw = () => {
    if (!selectedLeaveId) return;
    dispatch(withdrawLeave({ leave_request_id: selectedLeaveId }))
      .unwrap()
      .then(res => {
        if (res.success) {
          console.log('Leave withdrawn successfully');
        }
        setWithdrawModalVisible(false);
        const payload = { current: 1, pageSize: 500, request_type: 'Admin' };
        dispatch(fetchLeaves(payload) as any);
        dispatch(fetchUserLeaveQuotaList({ user_id: userData.user_id }))
      })
      .catch(err => {
        console.error('Withdraw failed', err);
        setWithdrawModalVisible(false);
      });
  };

  const closeLeaveModal = () => {
    setLeaveModalVisible(false);
    setSubject('');
    setSelectedLeaveType('');
    setDayType('');
    setSelectedName('');
    setDescription('');
    setFileList([]);
    setStartDate(null);
    setEndDate(null);
    setStartHalf('');
    setEndHalf('');
    setAllowBeyondQuota(false);
    setLeaveRemainingLeaves(0);

    setFormErrors({});
  }

  const clearError = (field: string) => {
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  useEffect(() => {
    const payload = { current: 1, pageSize: 500, request_type: 'Admin' };
    dispatch(fetchLeaves(payload) as any);
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchUserData());
  }, [dispatch]);

  useEffect(() => {
    if (userData?.user_id) {
      dispatch(fetchUserLeaveQuotaList({ user_id: userData.user_id }));
    }
  }, [userData?.user_id, dispatch]);

  useEffect(() => {
    if (route.params?.openModal) {
      setLeaveModalVisible(true);
      dispatch(fetchUserNamesList({}));
    }
  }, [route.params?.openModal, dispatch]);

  const leaveListOptions: string[] = useMemo(() => {
    if (!userLeaveQuotaList) return [];
    const userGender = userData?.gender?.toLowerCase();
    const userMaritalStatus = userData?.marital_status?.toLowerCase();

    return (userLeaveQuotaList?.leave_config || [])
      .filter((item: any) => {
        const genderMatch =
          !item.gender?.length ||
          item.gender.map((g: string) => g.toLowerCase()).includes(userGender);

        const maritalMatch =
          !item.marital_status?.length ||
          item.marital_status
            .map((m: string) => m.toLowerCase())
            .includes(userMaritalStatus);

        return (
          genderMatch &&
          maritalMatch &&
          item.status?.toLowerCase() !== 'inactive'
        );
      })
      .map((item: any) => item.leave_type as string)
      .filter((type: string) => type.toLowerCase() !== 'lop');
  }, [userLeaveQuotaList, userData?.gender, userData?.marital_status]);

  const reloadLeaves = async () => {
    const payload = { current: 1, pageSize: 500, request_type: 'Admin' };
    await dispatch(fetchLeaves(payload) as any);
    await dispatch(fetchUserLeaveQuotaList({ user_id: userData.user_id }));
  };


  return (
    <>
      <AppModal visible={leaveModalVisible} onClose={() => closeLeaveModal()}>
        <View>
          <ScrollView
            style={{ maxHeight: 500 }}
            showsVerticalScrollIndicator={true}
          >
            {/* Header */}
            <Text style={styles.modalTitle}>Apply Leave</Text>
            <Text style={styles.modalSubtitle}>
              Fill in the details below to request leave from your manager.
            </Text>

            {/* Subject */}
            <Text style={styles.label}>
              Subject <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TextInput
              placeholder="Enter Subject"
              style={styles.input}
              value={subject}
              onChangeText={text => {
                setSubject(text);
                clearError('subject');
              }}
            />
            {formErrors.subject && (
              <Text style={styles.errorText}>{formErrors.subject}</Text>
            )}

            {/* Leave Type */}
            <View style={styles.leaveContainer}>
              <Text style={styles.label}>
                Leave Type <Text style={{ color: 'red' }}>*</Text>
              </Text>
              {Platform.OS === 'ios' ? (
                <View style={{ position: 'relative' }}>
                  {/* Input */}
                  <TouchableOpacity
                    style={[styles.leaveInputWrapper, { height: 42 }]}
                    onPress={() => setIsLeaveTypeOpen(prev => !prev)}
                    activeOpacity={0.7}
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

                  {/* Floating Dropdown */}
                  {isLeaveTypeOpen && (
                    <View style={styles.leaveDropdown}>
                      <ScrollView style={{ maxHeight: 200 }}>
                        {leaveListOptions.map(lt => (
                          <TouchableOpacity
                            key={lt}
                            style={styles.leaveOption}
                            onPress={() => {
                              setIsLeaveTypeOpen(false);
                              handleLeaveChange(lt, 'leave_duration');
                              clearError('leaveType');
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
                <RNPickerSelect
                  onValueChange={value => {
                    handleLeaveChange(value, 'leave_duration');
                    clearError('leaveType');
                  }}
                  items={leaveListOptions.map(lt => ({
                    label: lt,
                    value: lt,
                  }))}
                  placeholder={{ label: 'Select Leave Type', value: null }}
                  value={selectedLeaveType}
                  style={pickerSelectStyles}
                  useNativeAndroidPickerStyle={false}
                />
              )}
              {formErrors.leaveType && (
                <Text style={styles.errorText}>{formErrors.leaveType}</Text>
              )}
              {!allowBeyondQuota &&
                leaveRemainingLeaves === 0 &&
                selectedLeaveType != '' && (
                  <Text style={styles.errorText}>
                    Oops! You've used all your leaves for this leave type.
                  </Text>
                )}
              {allowBeyondQuota &&
                leaveRemainingLeaves === 0 &&
                selectedLeaveType != '' && (
                  <Text style={styles.errorText}>
                    Request raised beyond quota will be marked as LOP/Negative
                    balance.
                  </Text>
                )}
              {clubLeaveEnabled() ? (
                <Text style={styles.errorText}>
                  Your {selectedLeaveType} balance is insufficient for this
                  request. Select Club Leave and choose another leave type to
                  cover the remaining days.
                </Text>
              ) : (
                ''
              )}
            </View>

            {/* Leave Duration */}
            <View style={styles.leaveContainer}>
              <Text style={styles.label}>
                Leave Duration (Day or Days){' '}
                <Text style={{ color: 'red' }}>*</Text>
              </Text>
              {/* <RNPickerSelect
                onValueChange={(value: string | null, _index: number) => {
                  handleDay(value);
                  clearError('dayType');
                }}
                items={[
                  ...(allowedShortHalfday?.allow_short_leave
                    ? [{ label: 'Short Day Leave', value: 'short' }]
                    : []),
                  ...(allowedShortHalfday?.allow_half_day_leave
                    ? [{ label: 'Half Day Leave', value: 'half' }]
                    : []),
                  { label: 'Single Day Leave', value: 'single' },
                  { label: 'Multiple Day Leave', value: 'multiple' },
                ]}
                placeholder={{ label: 'Select Day Type', value: '' }}
                value={dayType}
                style={{
                  ...pickerSelectStyles,
                  inputAndroid: {
                    ...pickerSelectStyles.inputAndroid,
                    backgroundColor: !selectedLeaveType ? '#aaaaaa2e' : 'white',
                  },
                  inputIOS: {
                    ...pickerSelectStyles.inputIOS,
                    backgroundColor: !selectedLeaveType ? '#aaaaaa2e' : 'white',
                  },
                  placeholder: {
                    ...pickerSelectStyles.placeholder,
                    color: !selectedLeaveType ? '#bbb' : '#000',
                  },
                }}
                useNativeAndroidPickerStyle={false}
                disabled={!selectedLeaveType}
              /> */}
              {Platform.OS === 'ios' ? (
                // ------------ iOS: custom input + dropdown ------------
                <View style={{ position: 'relative' }}>
                  <TouchableOpacity
                    style={[
                      styles.leaveInputWrapper,
                      {
                        height: 42,
                        backgroundColor: !selectedLeaveType ? '#aaaaaa2e' : 'white',
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (!selectedLeaveType) return; // respect disabled
                      setIsDayTypeOpen(prev => !prev);
                    }}
                    disabled={!selectedLeaveType}
                  >
                    <Text
                      style={
                        dayType
                          ? styles.leaveValueText
                          : styles.leavePlaceholderText
                      }
                    >
                      {dayType
                        ? selectedDayTypeLabel
                        : 'Select Day Type'}
                    </Text>

                    <Text style={styles.leaveArrow}>▾</Text>
                  </TouchableOpacity>

                  {isDayTypeOpen && (
                    <View style={styles.leaveDropdown}>
                      <ScrollView style={{ maxHeight: 200 }}>
                        {dayTypeItems.map(item => (
                          <TouchableOpacity
                            key={item.value}
                            style={styles.leaveOption}
                            onPress={() => {
                              setIsDayTypeOpen(false);
                              handleDay(item.value);      // same handler
                              clearError('dayType');
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
                // ------------ Android: keep RNPickerSelect ------------
                <RNPickerSelect
                  onValueChange={(value) => {
                    handleDay(value);
                    clearError('dayType');
                  }}
                  items={dayTypeItems}
                  placeholder={{ label: 'Select Day Type', value: '' }}
                  value={dayType}
                  style={{
                    ...pickerSelectStyles,
                    inputAndroid: {
                      ...pickerSelectStyles.inputAndroid,
                      backgroundColor: !selectedLeaveType ? '#aaaaaa2e' : 'white',
                    },
                    inputIOS: {
                      ...pickerSelectStyles.inputIOS,
                      backgroundColor: !selectedLeaveType ? '#aaaaaa2e' : 'white',
                    },
                    placeholder: {
                      ...pickerSelectStyles.placeholder,
                      color: !selectedLeaveType ? '#bbb' : '#000',
                    },
                  }}
                  useNativeAndroidPickerStyle={false}
                  disabled={!selectedLeaveType}
                />
              )}

              {formErrors.dayType && (
                <Text style={styles.errorText}>{formErrors.dayType}</Text>
              )}
            </View>

            <>
              {dayType === 'single' && (
                <View style={styles.field}>
                  <Text style={styles.label}>
                    On <Text style={{ color: 'red' }}>*</Text>
                  </Text>
                  {renderFakeInput(
                    'Select Date',
                    startDate,
                    () => setActivePicker('single'),
                    'startDate',
                  )}
                  {formErrors.startDate && (
                    <Text style={styles.errorText}>{formErrors.startDate}</Text>
                  )}
                </View>
              )}

              {/* Multiple Days */}
              {dayType === 'multiple' && (
                <View style={styles.multipleBlock}>
                  {/* From */}
                  <View style={styles.fieldHalf}>
                    <Text style={styles.label}>
                      From <Text style={{ color: 'red' }}>*</Text>
                    </Text>
                    {renderFakeInput(
                      'Select Start Date',
                      startDate,
                      () => setActivePicker('multiStart'),
                      'startDate',
                    )}
                    {formErrors.startDate && (
                      <Text style={styles.errorText}>
                        {formErrors.startDate}
                      </Text>
                    )}
                  </View>

                  {/* Start Half */}
                  <View style={styles.fieldHalf}>
                    <Text style={styles.label}>
                      Select Half <Text style={{ color: 'red' }}>*</Text>
                    </Text>
                    {Platform.OS === 'ios' ? (
                      // ------------ iOS: custom dropdown ------------
                      <View style={{ position: 'relative' }}>
                        <TouchableOpacity
                          style={[
                            styles.leaveInputWrapper,
                            {
                              height: 42,
                              backgroundColor: !selectedLeaveType ? '#aaaaaa2e' : 'white',
                            },
                          ]}
                          activeOpacity={0.7}
                          onPress={() => {
                            if (!selectedLeaveType) return;
                            setIsStartHalfOpen(prev => !prev);
                          }}
                          disabled={!selectedLeaveType}
                        >
                          <Text
                            style={
                              startHalf
                                ? styles.leaveValueText
                                : styles.leavePlaceholderText
                            }
                          >
                            {startHalf
                              ? startHalf === 'first_half'
                                ? 'First Half'
                                : 'Second Half'
                              : 'Choose...'}
                          </Text>

                          <Text style={styles.leaveArrow}>▾</Text>
                        </TouchableOpacity>

                        {isStartHalfOpen && (
                          <View style={styles.leaveDropdown}>
                            <ScrollView style={{ maxHeight: 200 }}>
                              {[
                                { label: 'First Half', value: 'first_half' },
                                { label: 'Second Half', value: 'second_half' },
                              ].map(item => (
                                <TouchableOpacity
                                  key={item.value}
                                  style={styles.leaveOption}
                                  onPress={() => {
                                    setIsStartHalfOpen(false);
                                    setStartHalf(item.value);
                                    clearError('startHalf');
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
                      // ------------ Android: RNPickerSelect ------------
                      <RNPickerSelect
                        onValueChange={val => {
                          setStartHalf(val);
                          clearError('startHalf');
                        }}
                        items={[
                          { label: 'First Half', value: 'first_half' },
                          { label: 'Second Half', value: 'second_half' },
                        ]}
                        value={startHalf}
                        style={{
                          ...pickerSelectStyles,
                          inputAndroid: {
                            ...pickerSelectStyles.inputAndroid,
                            backgroundColor: !selectedLeaveType ? '#aaaaaa2e' : 'white',
                          },
                          placeholder: {
                            ...pickerSelectStyles.placeholder,
                            color: !selectedLeaveType ? '#bbb' : '#000',
                          },
                        }}
                        placeholder={{ label: 'Choose...', value: '' }}
                        useNativeAndroidPickerStyle={false}
                        disabled={!selectedLeaveType}
                      />
                    )}

                    {formErrors.startHalf && (
                      <Text style={styles.errorText}>
                        {formErrors.startHalf}
                      </Text>
                    )}
                  </View>

                  {/* To */}
                  <View style={styles.fieldHalf}>
                    <Text style={styles.label}>
                      To <Text style={{ color: 'red' }}>*</Text>
                    </Text>
                    {renderFakeInput(
                      'Select End Date',
                      endDate,
                      () => setActivePicker('multiEnd'),
                      'endDate',
                    )}
                    {formErrors.endDate && (
                      <Text style={styles.errorText}>{formErrors.endDate}</Text>
                    )}
                  </View>

                  {/* End Half */}
                  <View style={styles.fieldHalf}>
                    <Text style={styles.label}>
                      Select Half <Text style={{ color: 'red' }}>*</Text>
                    </Text>
                    {Platform.OS === 'ios' ? (
                      // ------------ iOS: custom input + dropdown ------------
                      <View style={{ position: 'relative' }}>
                        <TouchableOpacity
                          style={[
                            styles.leaveInputWrapper,
                            {
                              height: 42,
                              backgroundColor: !selectedLeaveType ? '#aaaaaa2e' : 'white',
                            },
                          ]}
                          activeOpacity={0.7}
                          onPress={() => {
                            if (!selectedLeaveType) return;
                            setIsEndHalfOpen(prev => !prev);
                          }}
                          disabled={!selectedLeaveType}
                        >
                          <Text
                            style={
                              endHalf
                                ? styles.leaveValueText
                                : styles.leavePlaceholderText
                            }
                          >
                            {endHalf
                              ? endHalf === 'first_half'
                                ? 'First Half'
                                : 'Second Half'
                              : 'Choose...'}
                          </Text>

                          <Text style={styles.leaveArrow}>▾</Text>
                        </TouchableOpacity>

                        {isEndHalfOpen && (
                          <View style={styles.leaveDropdown}>
                            <ScrollView style={{ maxHeight: 200 }}>
                              {[
                                { label: 'First Half', value: 'first_half' },
                                { label: 'Second Half', value: 'second_half' },
                              ].map(item => (
                                <TouchableOpacity
                                  key={item.value}
                                  style={styles.leaveOption}
                                  onPress={() => {
                                    setIsEndHalfOpen(false);
                                    setEndHalf(item.value);
                                    clearError('endHalf');
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
                      // ------------ Android: keep RNPickerSelect ------------
                      <RNPickerSelect
                        onValueChange={val => {
                          setEndHalf(val);
                          clearError('endHalf');
                        }}
                        items={[
                          { label: 'First Half', value: 'first_half' },
                          { label: 'Second Half', value: 'second_half' },
                        ]}
                        value={endHalf}
                        style={{
                          ...pickerSelectStyles,
                          inputAndroid: {
                            ...pickerSelectStyles.inputAndroid,
                            backgroundColor: !selectedLeaveType ? '#aaaaaa2e' : 'white',
                          },
                          placeholder: {
                            ...pickerSelectStyles.placeholder,
                            color: !selectedLeaveType ? '#bbb' : '#000',
                          },
                        }}
                        placeholder={{ label: 'Choose...', value: '' }}
                        useNativeAndroidPickerStyle={false}
                        disabled={!selectedLeaveType}
                      />
                    )}

                    {formErrors.endHalf && (
                      <Text style={styles.errorText}>{formErrors.endHalf}</Text>
                    )}
                  </View>
                </View>
              )}

              {/* Half/Short */}
              {(dayType === 'half' || dayType === 'short') && (
                <View style={styles.field}>
                  <Text style={styles.label}>
                    On <Text style={{ color: 'red' }}>*</Text>
                  </Text>
                  {renderFakeInput(
                    'Select Date',
                    startDate,
                    () => setActivePicker('halfShort'),
                    'startDate',
                  )}
                  {formErrors.startDate && (
                    <Text style={styles.errorText}>{formErrors.startDate}</Text>
                  )}
                </View>
              )}
            </>

            {dayType !== '' && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.totalLeaveText}>
                  Total Requested Leave -{' '}
                  <Text style={{ fontWeight: 'bold' }}>
                    {calculateTotalLeaveDays()} day(s)
                  </Text>
                </Text>
              </View>
            )}

            {clubLeaveEnabled() && (
              <View style={styles.clubContainer}>
                {/* Label */}
                <Text style={styles.label}>Club Leave</Text>

                {/* Radio Buttons */}
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

                {/* Dropdown if Yes */}
                {isClubChecked && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.label}>Club Leave Type *</Text>
                    <RNPickerSelect
                      onValueChange={val => setClubing(val)}
                      items={leaveListOptions
                        .filter(
                          (item: string) =>
                            !leaveClubedNotAllowed.includes(item),
                        )
                        .map((lt: string) => ({
                          label: lt,
                          value: lt,
                        }))}
                      value={clubing}
                      placeholder={{ label: 'Select Leave Type', value: '' }}
                      style={pickerSelectStyles}
                      useNativeAndroidPickerStyle={false}
                    />
                  </View>
                )}
              </View>
            )}

            {/* Request To */}
            {/* <Text style={styles.label}>Request To</Text>
            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>Riya Rawat</Text>
            </TouchableOpacity> */}
            <View style={styles.leaveContainer}>
              <Text style={styles.label}>
                Request To <Text style={{ color: 'red' }}>*</Text>
              </Text>

              {Platform.OS === 'ios' ? (
                // ------------ iOS: custom dropdown ------------
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
                    onPress={() => {
                      setIsNameOpen(prev => !prev);
                    }}
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
                          (item) => item.value === selectedName
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
                              clearError('requestTo');
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
                // ------------ Android: RNPickerSelect ------------
                <RNPickerSelect
                  onValueChange={(val) => {
                    setSelectedName(val);
                    clearError('requestTo');
                  }}
                  items={renderUserOptions(userData, names)}
                  value={selectedName}
                  placeholder={{
                    label: 'Select Reporting Manager/HR',
                    value: '',
                  }}
                  style={{
                    ...pickerSelectStyles,
                    inputAndroid: {
                      ...pickerSelectStyles.inputAndroid,
                      backgroundColor: 'white',
                    },
                    placeholder: {
                      ...pickerSelectStyles.placeholder,
                      color: '#888',
                    },
                  }}
                  useNativeAndroidPickerStyle={false}
                />
              )}

              {/* Error Handling */}
              {showErrors && !selectedName && (
                <Text style={styles.errorText}>
                  {userData?.reporting_manager || userData?.reporting_hr
                    ? 'Request to is required.'
                    : "You don't have a Reporting Manager/HR assigned. Please check with HR to update!"}
                </Text>
              )}
              {formErrors.requestTo && (
                <Text style={styles.errorText}>{formErrors.requestTo}</Text>
              )}
            </View>

            {/* Reason */}
            <View style={styles.leaveContainer}>
              <Text style={styles.label}>Reason</Text>

              {showOtherInput ? (
                <View style={styles.otherReasonWrapper}>
                  <TextInput
                    placeholder="Enter Custom Reason"
                    style={styles.input}
                    value={otherReason}
                    onChangeText={handleOtherReasonChange}
                  />
                  <TouchableOpacity
                    style={styles.cancelIcon}
                    onPress={handleCancelOther}
                  >
                    <Text style={{ fontSize: 16, color: '#999' }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                Platform.OS === 'ios' ? (
                  // ---------------- iOS: custom dropdown ----------------
                  <View style={{ position: 'relative' }}>
                    <TouchableOpacity
                      style={[
                        styles.leaveInputWrapper,
                        {
                          height: 42,
                          backgroundColor:
                            reasonList?.length === 0 ? '#aaaaaa2e' : 'white',
                        },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (reasonList?.length === 0) return;
                        setIsReasonOpen(prev => !prev);
                      }}
                      disabled={reasonList?.length === 0}
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
                            ...(reasonList?.map(r => ({ label: r, value: r })) || []),
                            { label: 'Other', value: 'other' },
                          ].map(item => (
                            <TouchableOpacity
                              key={item.value}
                              style={styles.leaveOption}
                              onPress={() => {
                                setIsReasonOpen(false);
                                handleReasonChange(item.value);
                                clearError('reason');
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
                      clearError('reason');
                    }}
                    items={[
                      ...(reasonList?.map(r => ({ label: r, value: r })) || []),
                      { label: 'Other', value: 'other' },
                    ]}
                    placeholder={{ label: 'Select Reason', value: '' }}
                    value={reason}
                    style={{
                      ...pickerSelectStyles,
                      inputAndroid: {
                        ...pickerSelectStyles.inputAndroid,
                        backgroundColor:
                          reasonList?.length === 0 ? '#aaaaaa2e' : 'white',
                      },
                      placeholder: {
                        ...pickerSelectStyles.placeholder,
                        color: reasonList?.length === 0 ? '#bbb' : '#000',
                      },
                    }}
                    useNativeAndroidPickerStyle={false}
                    disabled={reasonList?.length === 0}
                  />
                )
              )}

              {showErrors && !reason && !otherReason && (
                <Text style={styles.errorText}>Reason is required.</Text>
              )}
            </View>

            {/* Description */}
            <Text style={styles.label}>
              Description <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TextInput
              placeholder="Enter Description"
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              multiline
              value={description}
              onChangeText={text => {
                setDescription(text);
                clearError('description');
              }}
            />
            {formErrors.description && (
              <Text style={styles.errorText}>{formErrors.description}</Text>
            )}

            {/* Upload */}
            <View style={styles.leaveContainer}>
              <Text style={styles.label}>Upload</Text>

              <View style={styles.previewRow}>
                {/* Previews */}
                {fileList.map((file, index) => (
                  <View key={index} style={styles.previewWrapper}>
                    <TouchableOpacity onPress={() => setPreviewUri(file.uri)}>
                      <Image
                        source={{ uri: file.uri }}
                        style={styles.previewImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>

                    {/* Delete button */}
                    <TouchableOpacity
                      style={styles.deleteIcon}
                      onPress={() => handleRemoveFile(index)}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                        ✕
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Upload box */}
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

              {/* Info */}
              <Text style={styles.infoText}>*Allowed jpg, png, jpeg, pdf</Text>
              <Text style={styles.infoText}>*Max size: 15MB</Text>

              {/* Validation */}
              {errorText ? (
                <Text style={styles.errorText}>⚠️ {errorText}</Text>
              ) : null}
              {mandatoryAttachment && (
                <Text style={styles.errorText}>
                  ⚠️ Attachment is mandatory.
                </Text>
              )}

              {activePicker && (
                <DateTimePicker
                  value={
                    activePicker === 'multiEnd'
                      ? endDate ?? new Date()
                      : startDate ?? new Date()
                  }
                  mode="date"
                  display="calendar"
                  onChange={(event, date) =>
                    handleDateChange(event, date, activePicker)
                  }
                />
              )}

              {/* Preview Modal */}
              <Modal visible={!!previewUri} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Image
                      source={{ uri: previewUri ?? '' }}
                      style={styles.modalImage}
                      resizeMode="contain"
                    />
                    <TouchableOpacity
                      style={styles.closeIcon}
                      onPress={() => setPreviewUri(null)}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                        ✕
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
          </ScrollView>

          {/* Buttons */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
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

      <ConfirmationModal
        visible={withdrawModalVisible}
        message="Are you sure you want to withdraw this leave?"
        onConfirm={handleWithdraw}
        onCancel={() => setWithdrawModalVisible(false)}
      />

      <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              placeholder="Search"
              style={styles.searchInput}
              placeholderTextColor="#888"
            // value={searchValue}
            // onChangeText={text => {
            //   setSearchValue(text);
            //   handleSearch(text);
            // }}
            />
          </View>

          {/* <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Filter size={20} color="#fff" />
        </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.iconButton}
            onPress={leaveCreationModal}
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <RefreshableList
          ListHeaderComponent={
            <View style={styles.summaryContainer}>
              {userLeaveQuotaList?.leave_config
                ?.filter(
                  (leave: any) =>
                    leaveListOptions.includes(leave.leave_type) ||
                    leave.leave_type.toLowerCase() === 'lop',
                )
                .map((leave: any, index: number) => (
                  <LeaveBalanceDonut key={index} data={leave} />
                ))}
            </View>
          }
          data={leaveRequests}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <Card style={styles.requestCard}>
              {/* Header */}
              <View style={styles.headerRow}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('LeaveRequestDetail', {
                      leave_id: item.id,
                    });
                  }}
                >
                  <Text style={styles.requestTitle}>{item?.subject}</Text>
                </TouchableOpacity>
                {item?.status !== 'Withdrawn' &&
                  item?.status !== 'Rejected' &&
                  dayjs().isSameOrBefore(dayjs(item?.start_date), 'day') && (
                    <TouchableOpacity
                      onPress={() => openWithdrawalModal(item.id)}
                    >
                      <XCircleIcon size={22} color="#0E79B6" />
                    </TouchableOpacity>
                  )}
              </View>

              {/* Rows */}
              <View style={styles.row}>
                <Text style={styles.leaveLabel}>Leave Type</Text>
                <Text style={styles.leaveValue}>
                  {item.leave_type}{' '}
                  {item.short_code ? `(${item.short_code})` : ''}
                </Text>
              </View>

              {/* <View style={styles.row}>
                <Text style={styles.leaveLabel}>Request Type</Text>
                <Text style={styles.leaveValue}>{item.request_type}</Text>
              </View> */}
              <View style={styles.row}>
                <Text style={styles.leaveLabel}>Request Type</Text>
                <Text style={styles.leaveValue}>
                  {getLeaveDurationLabel(item.no_of_days)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.leaveLabel}>Request To</Text>
                <Text style={styles.leaveValue}>
                  {item.statusUpdatedBy
                    ? `${item.statusUpdatedBy.first_name} ${item.statusUpdatedBy.last_name}`
                    : item.userRequest
                      ? `${item.userRequest.first_name} ${item.userRequest.last_name}`
                      : '-'}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.leaveLabel}>No. of Days</Text>
                <Text style={styles.leaveValue}>{item.no_of_days}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.leaveLabel}>From</Text>
                <Text style={styles.leaveValue}>
                  {moment(item.start_date).format('DD-MMM-YYYY')}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.leaveLabel}>To</Text>
                <Text style={styles.leaveValue}>
                  {moment(item.end_date).format('DD-MMM-YYYY')}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.leaveLabel}>Status</Text>
                <Text
                  style={[
                    styles.leaveValue,
                    {
                      color:
                        item.status === 'Approved'
                          ? 'green'
                          : item.status === 'Pending'
                            ? 'orange'
                            : 'red',
                    },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </Card>
          )}
          onRefreshData={reloadLeaves}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              No leave requests found
            </Text>
          }
        />
      </View>
    </>
  );
};
