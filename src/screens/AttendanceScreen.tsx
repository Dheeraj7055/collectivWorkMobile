// src/screens/AttendanceScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import {
  Edit2,
  Calendar as CalendarIcon,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react-native';
import { AppDispatch, RootState } from '@/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAttendance,
  fetchAttendanceByDate,
  fetchAttendanceRange,
  fetchHolidayList,
  MonthlyAttendanceRecord,
  punchIn,
  punchOut,
} from '@/redux/slices/attendanceSlice';
import { Header } from '@/components/Header';
import moment from 'moment';
import { StatusTag } from '@/components/StatusTag';
import {
  convertSecondsToHoursMinutes,
  convertToFormattedTime,
} from '@/common/CommonFunctions';
import { Image } from 'react-native';
import { HolidayImage } from '@/common/HolidayImage';
import AppModal from '@/common/AppModal';
import RegularizeModal from './AttendaneModal/RegularizeModal';
import { styles } from '@/styles/attendanceStyles';
import { debounce } from 'lodash';
import { fetchUserNamesList } from '@/redux/slices/userSlice';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '@/navigation/AppNavigator';
import { RefreshableScroll } from '@/common/RefreshableScroll';

type LeaveNavProp = BottomTabNavigationProp<MainTabParamList, 'Leave'>;

interface DayLog {
  punch_in: string | null;
  punch_out: string | null;
}

export const AttendanceScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<LeaveNavProp>();
  const { todayRecord, monthlyRecords, holidayList, isLoading } = useSelector(
    (state: RootState) => state.attendance,
  );
  const userData = useSelector((state: RootState) => state.user.profile);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showAndroidMenu, setShowAndroidMenu] = useState(false);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [showRegularizeModal, setShowRegularizeModal] = useState(false);


  const punchOptions = useMemo(() => {
    const options: { label: string; type: string }[] = [];
    if (
      userData?.AttendancePolicy?.enabled_ip_address ||
      userData?.AttendancePolicy?.enabled_geo_fencing
    ) {
      options.push({ label: 'Web Punch In', type: 'web' });
    }
    if (userData?.AttendancePolicy?.enabled_work_from_home) {
      options.push({ label: 'Remote Punch In', type: 'remote' });
    }
    return options;
  }, [userData]);

  const statusColors = useMemo(
    () => ({
      Present: '#4CAF50',
      Absent: '#E53935',
      Holiday: '#FB8C00',
      Leave: '#FBC02D',
      Sick: '#2196F3',
    }),
    [],
  );

  // 🔹 Fetch detail for a date
  const handleFetchDetailByDate = (dateStr: string) => {
    if (!userData?.id) return;
    dispatch(fetchAttendanceByDate({ user_id: userData.id, date: dateStr }))
      .unwrap()
      .then(data => {
        setSelectedDay(data);
      })
      .catch(err => console.error('Failed to fetch detail:', err));
  };

  // Initial load → fetch current date detail
  useEffect(() => {
    const today = moment().format('YYYY-MM-DD');
    const isFuture = moment(currentDate).isAfter(today);

    if (!isFuture) {
      handleFetchDetailByDate(currentDate);
    } else {
      // Skip API for future dates
      setSelectedDay(null);
    }
  }, [currentDate]);

  // 🔹 Fetch attendance on mount
  useEffect(() => {
    if (!todayRecord) {
      dispatch(fetchAttendance());
    }
  }, [dispatch]);

  useEffect(() => {
    if (monthlyRecords.length) {
      const year = new Date(monthlyRecords[0].date).getFullYear();
      dispatch(fetchHolidayList({ year }));
    }
  }, [monthlyRecords]);

  useEffect(() => {
    if (!todayRecord?.punch_in) {
      setIsCheckedIn(false);
      return;
    }

    const activity = todayRecord.activity || [];
    if (activity.length > 0) {
      const lastActivity = activity[activity.length - 1];
      if (
        lastActivity?.activity_type === 'Punch In' ||
        lastActivity?.activity_type === 'Regularized Punch In'
      ) {
        setIsCheckedIn(true);
      } else {
        setIsCheckedIn(false);
      }
    } else {
      setIsCheckedIn(true);
    }
  }, [todayRecord]);

  const handlePunchIn = (type: string) => {
    dispatch(punchIn({ punch_type: type }));
    dispatch(fetchAttendance());
    handleFetchDetailByDate(currentDate);
    setShowAndroidMenu(false);
  };

  // 🔹 Handle Punch Out
  const handlePunchOut = () => {
    dispatch(punchOut({ punch_type: todayRecord?.punch_type || 'remote' }));
    dispatch(fetchAttendance());
    handleFetchDetailByDate(currentDate);
  };

  // 🔹 Main button press
  const onMainPunchPress = () => {
    if (isCheckedIn) {
      handlePunchOut();
    } else {
      if (punchOptions.length === 1) {
        handlePunchIn(punchOptions[0].type); // direct
      } else if (punchOptions.length > 1) {
        setShowAndroidMenu(true); // open modal for choices
      } else {
        handlePunchIn('remote'); // fallback
      }
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sept',
      'Oct',
      'Nov',
      'Dec',
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    // Add suffix (st, nd, rd, th)
    const suffix =
      day % 10 === 1 && day !== 11
        ? 'st'
        : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
        ? 'rd'
        : 'th';

    return `${month} ${day}${suffix} ${year}`;
  };

  const handleFetchRange = useCallback(
    debounce((year: number, month: number) => {
      dispatch(fetchAttendanceRange({ year, month }));
    }, 300),
    [dispatch],
  );

  const handleRegularizeSubmit = () => {
    console.log('submit');
  };

  const openRegularizeModal = () => {
    setShowRegularizeModal(true);
    dispatch(fetchUserNamesList({}));
  }

  useEffect(() => {
    const now = new Date();
    handleFetchRange(now.getFullYear(), now.getMonth()); // load on mount
  }, []);

  const reloadAttendance = async () => {
    await dispatch(fetchAttendance());
    const now = new Date();
    await dispatch(
      fetchAttendanceRange({ year: now.getFullYear(), month: now.getMonth() }),
    );
    if (userData?.id) {
      await dispatch(
        fetchAttendanceByDate({
          user_id: userData.id,
          date: moment().format('YYYY-MM-DD'),
        }),
      );
    }
  };

  return (
    <>
      <RegularizeModal
        visible={showRegularizeModal}
        onClose={() => setShowRegularizeModal(false)}
        onSubmit={handleRegularizeSubmit}
      />
      <View style={styles.container}>
        <RefreshableScroll
          showsVerticalScrollIndicator={false}
          onRefreshData={reloadAttendance}   // pull-to-refresh
        >
          {/* 🔹 Today’s Utilization */}
          <View style={styles.timeCard}>
            <Text style={styles.sectionTitle}>Today's Time Utilization</Text>
            <Text style={styles.subText}>{formatDisplayDate(currentDate)}</Text>

            {/* 🔹 Main Punch Button */}
            <TouchableOpacity
              style={styles.punchButton}
              onPress={onMainPunchPress}
            >
              <Text style={styles.punchText}>
                {isCheckedIn
                  ? 
                  // `${
                  //     todayRecord?.punch_type === 'remote'
                  //       ? 'Remote '
                  //       : todayRecord?.punch_type === 'web'
                  //       ? 'Web '
                  //       : todayRecord?.punch_type === 'open'
                  //       ? 'Open '
                  //       : ''
                  //   }Punch Out`
                    'Punch Out'
                  : 'Punch In'}
              </Text>
            </TouchableOpacity>

            {/* 🔹 Android Dropdown Modal */}
            <Modal
              visible={showAndroidMenu}
              transparent
              animationType="fade"
              onRequestClose={() => setShowAndroidMenu(false)}
            >
              <Pressable
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => setShowAndroidMenu(false)}
              >
                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    padding: 16,
                    width: 250,
                  }}
                >
                  {punchOptions.map(opt => (
                    <TouchableOpacity
                      key={opt.type}
                      style={{ padding: 12 }}
                      onPress={() => handlePunchIn(opt.type)}
                    >
                      <Text style={{ fontSize: 16, fontWeight: '500' }}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={{ padding: 12, alignItems: 'center' }}
                    onPress={() => setShowAndroidMenu(false)}
                  >
                    <Text style={{ color: 'red' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Modal>
          </View>

          {/* 🔹 Calendar */}
          <View style={styles.card}>
            <Calendar
              current={currentDate}
              onMonthChange={monthObj => {
                handleFetchRange(monthObj.year, monthObj.month - 1);
              }}
              dayComponent={({ date, state }) => {
                if (!date) return null;

                const dateStr = date.dateString;
                const today = moment().format('YYYY-MM-DD');
                const isFuture = moment(dateStr).isAfter(today);
                const selected = currentDate;

                // find record for this date
                const record = monthlyRecords.find(
                  rec => moment(rec.date).format('YYYY-MM-DD') === dateStr,
                );

                // decide short label + color
                let label = '';
                let labelColor = '#9E9E9E';

                if (!isFuture) {
                  if (record?.holiday) {
                    label = 'HD';
                    labelColor = statusColors.Holiday;
                  } else if (record?.status === 'Absent') {
                    label = 'AB';
                    labelColor = statusColors.Absent;
                  } else if (record?.status === 'Present') {
                    label = 'P';
                    labelColor = statusColors.Present;
                  } else if (record?.status === 'Leave') {
                    label = 'L';
                    labelColor = statusColors.Leave;
                  } else if (record?.status === 'Sick Leave') {
                    label = 'SL';
                    labelColor = statusColors.Sick;
                  }
                }

                const isSelected = !isFuture && dateStr === selected;

                return (
                  <TouchableOpacity
                    disabled={isFuture} // 🔥 disable tap
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 50,
                      opacity: isFuture ? 0.35 : 1, // 🔥 make future light
                    }}
                    onPress={() => {
                      if (!isFuture) {
                        setCurrentDate(dateStr);
                        handleFetchDetailByDate(dateStr);
                      }
                    }}
                  >
                    {/* Day number */}
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelected ? '#2196F3' : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          color: isFuture
                            ? '#bdbdbd' // 🔥 gray future day text
                            : isSelected
                              ? '#fff'
                              : state === 'disabled'
                                ? '#d9d9d9'
                                : '#000',
                          fontWeight: isSelected ? '700' : '500',
                        }}
                      >
                        {date.day}
                      </Text>
                    </View>

                    {/* Status Label */}
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: 'bold',
                        color: isFuture ? 'transparent' : labelColor, // 🔥 no label for future days
                      }}
                    >
                      {isFuture ? '' : label}
                    </Text>
                  </TouchableOpacity>
                );
              }}

              theme={{
                todayTextColor: '#2196F3',
                arrowColor: '#2196F3',
                textDayFontWeight: '500',
                textMonthFontWeight: '700',
              }}
            />
          </View>

          {/* 🔹 Shift Details */}
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.dateTitle}>
                {formatDisplayDate(selectedDay?.date || currentDate)}
              </Text>
            </View>
            {/* Title + Tag */}
            <View style={styles.shiftRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.shiftTitle}>
                  {selectedDay?.shift_name || 'Shift Timing'}
                </Text>
                <Text style={styles.shiftTime}>
                  {selectedDay?.shift_timing
                    ? `${selectedDay.shift_timing.punch_in} - ${selectedDay.shift_timing.punch_out}`
                    : '--'}
                </Text>
              </View>

              <StatusTag
                holiday={selectedDay?.holiday}
                holiday_name={selectedDay?.holiday_name}
                weekOff={selectedDay?.weekOff}
                status={selectedDay?.status}
                first_half={selectedDay?.first_half}
                second_half={selectedDay?.second_half}
                is_late_entries={selectedDay?.is_late_entries}
              />
            </View>
            {/* Expected Hours */}
            <View style={styles.rowBetweenBorder}>
              <View style={styles.colBox}>
                <Text style={styles.colTitle}>Expected Gross hours</Text>
                <Text style={styles.colValue}>
                  {selectedDay?.shift_timing?.gross_hours || '--'}
                </Text>
              </View>
              <View style={styles.colBox}>
                <Text style={styles.colTitle}>Expected Effective hours</Text>
                <Text style={styles.colValue}>
                  {selectedDay?.shift_timing?.effective_hours || '--'}
                </Text>
              </View>
            </View>
            {/* Actions */}
            {!selectedDay?.holiday  && <View style={styles.rowBetweenBorder}>
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => openRegularizeModal()} // 🔹 open modal
              >
                <Edit2 size={16} color="#0E79B6" />
                <Text style={styles.link}> Regularize</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionRow}
                onPress={() => navigation.navigate('Leave', { openModal: true })}
              >
                <CalendarIcon size={16} color="#0E79B6" />
                <Text style={styles.link}> Apply Leave</Text>
              </TouchableOpacity>
            </View>}
            {/* Day Logs */}
            <Text style={styles.sectionSubTitle}>Day Logs</Text>
            {selectedDay?.day_logs?.length > 0 ? (
              selectedDay.day_logs.map((log: DayLog, idx: number) => (
                <View key={idx} style={styles.dayLogRow}>
                  <View style={styles.logTimerRow}>
                    <ArrowDownLeft size={14} color="green" />
                    <Text style={styles.logText}>
                      {log.punch_in
                        ? moment(log.punch_in).format('hh:mm:ss A')
                        : '--:--'}
                    </Text>
                  </View>
                  <View style={styles.logTimerRow}>
                    <ArrowUpRight size={14} color="red" />
                    <Text style={[styles.logText, { color: 'red' }]}>
                      {log.punch_out
                        ? moment(log.punch_out).format('hh:mm:ss A')
                        : '--:--'}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.infoText}>No logs available</Text>
            )}
            {/* Adjusted Logs */}
            {(selectedDay?.regularize_punch_in ||
              selectedDay?.regularize_punch_out) && (
              <>
                <Text style={styles.sectionSubTitle}>Adjusted Logs</Text>
                {selectedDay?.isRegularized ? (
                  <View style={styles.logRow}>
                    <Check size={14} color="green" />
                    <Text style={styles.logText}>
                      {selectedDay.regularize_punch_in
                        ? moment(selectedDay.regularize_punch_in).format(
                            'hh:mm:ss A',
                          )
                        : '--:--'}
                    </Text>
                    <ArrowUpRight size={14} color="red" />
                    <Text style={[styles.logText, { color: 'red' }]}>
                      {selectedDay.regularize_punch_out
                        ? moment(selectedDay.regularize_punch_out).format(
                            'hh:mm:ss A',
                          )
                        : '--:--'}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.infoText}>No adjustments</Text>
                )}
              </>
            )}

            {/* Footer */}
            <View
              style={[
                styles.rowBetweenBorder,
                { paddingVertical: 6, marginTop: 14 },
              ]}
            >
              <View style={styles.colBox}>
                <Text style={styles.colTitle}>Hour(s)</Text>
              </View>
              <View style={styles.colBox}>
                <Text style={styles.colTitle}>Expected</Text>
              </View>
              <View style={styles.colBox}>
                <Text style={styles.colTitle}>Actual</Text>
              </View>
            </View>
            {/* Effective */}
            <View style={[styles.rowBetweenBorder, { paddingVertical: 6 }]}>
              <View style={styles.colBox}>
                <Text style={styles.infoText}>Effective</Text>
              </View>
              <View style={styles.colBox}>
                <Text style={styles.infoText}>
                  {convertToFormattedTime(
                    selectedDay?.shift_timing?.effective_hours,
                  )}
                </Text>
              </View>
              <View style={styles.colBox}>
                <Text style={styles.infoText}>
                  {convertSecondsToHoursMinutes(
                    Number(selectedDay?.actual_effective_hrs),
                  )}
                </Text>
              </View>
            </View>
            {/* Gross */}
            <View style={[styles.rowBetweenBorder, { paddingVertical: 6 }]}>
              <View style={styles.colBox}>
                <Text style={styles.infoText}>Gross</Text>
              </View>
              <View style={styles.colBox}>
                <Text style={styles.infoText}>
                  {convertToFormattedTime(
                    selectedDay?.shift_timing?.gross_hours,
                  )}
                </Text>
              </View>
              <View style={styles.colBox}>
                <Text style={styles.infoText}>
                  {convertSecondsToHoursMinutes(
                    Number(selectedDay?.actual_gross_hrs),
                  )}
                </Text>
              </View>
            </View>
            {/* Break */}
            <View style={[styles.rowBetweenBorder, { paddingVertical: 6 }]}>
              <View style={styles.colBox}>
                <Text style={styles.infoText}>Break</Text>
              </View>
              <View style={styles.colBox}>
                <Text style={styles.infoText}>
                  {convertToFormattedTime(
                    selectedDay?.shift_timing?.break_time,
                  )}
                </Text>
              </View>
              <View style={styles.colBox}>
                <Text style={styles.infoText}>
                  {convertSecondsToHoursMinutes(
                    Number(selectedDay?.actual_break_time),
                  )}
                </Text>
              </View>
            </View>
          </View>

          {/* 🔹 Upcoming Holidays */}
          <View style={styles.holidayCard}>
            <Text style={styles.sectionTitle}>Holidays</Text>

            {holidayList && holidayList.length > 0 ? (
              holidayList.map((holiday, index) => {
                // Assign colors (like Next.js getColor)
                const colors = [
                  '#F0394C',
                  '#2FAAF0',
                  '#F57325',
                  '#FDB001',
                  '#CD5118',
                  '#1B434A',
                ];
                const barColor = colors[index % colors.length];

                return (
                  <View
                    key={holiday.id}
                    style={[
                      styles.holidayBox,
                      {
                        borderColor: barColor,
                        backgroundColor: barColor + '20',
                      },
                    ]}
                  >
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <HolidayImage
                        uri={holiday.holiday_image || ''}
                        size={35}
                        backgroundColor={barColor}
                      />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={[styles.holidayName, { color: barColor }]}>
                          {holiday.holiday_name}
                          {holiday.holiday_type === 'Restricted Holiday'
                            ? ' (RH)'
                            : ''}
                        </Text>
                        <Text style={[styles.holidayDate, { color: barColor }]}>
                          {moment(holiday.holiday_from).format('DD MMMM YYYY')}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.infoText}>No holidays found</Text>
            )}
          </View>
        </RefreshableScroll>
      </View>
    </>
  );
};
