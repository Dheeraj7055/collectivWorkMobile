import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchAttendance } from '@/redux/slices/attendanceSlice';
import { headerStyles } from '../styles/headerStyles';

export const Header: React.FC<{ title: string }> = ({ title }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { todayRecord } = useSelector((state: RootState) => state.attendance);

  const [currentTime, setCurrentTime] = useState('00:00:00');
  const [punch, setPunch] = useState(false); 

  // Fetch attendance initially
  useEffect(() => {
    if (!todayRecord) {
      dispatch(fetchAttendance());
    }
  }, [dispatch, todayRecord]);

  // ✅ Determine punch state from last activity
  useEffect(() => {
    if (!todayRecord?.punch_in) {
      setPunch(false);
      return;
    }

    const activity = (todayRecord as any).activity || [];
    if (activity.length > 0) {
      const lastActivity = activity[activity.length - 1];
      if (
        lastActivity?.activity_type === 'Punch In' ||
        lastActivity?.activity_type === 'Regularized Punch In'
      ) {
        setPunch(true);
      } else {
        setPunch(false); 
      }
    } else {
      setPunch(true);
    }
  }, [todayRecord]);

  // ✅ Timer logic
  useEffect(() => {
    if (!todayRecord) {
      setCurrentTime('00:00:00');
      return;
    }

    let interval: ReturnType<typeof setInterval> | null = null;

    const baseTime = todayRecord.total_time ?? 0; // in seconds
    const punchInTime = todayRecord.punch_in
      ? new Date(todayRecord.punch_in).getTime()
      : null;

    const updateElapsed = () => {
      let elapsed = baseTime;

      if (punch && punchInTime) {
        const now = Date.now();
        const liveDiff = Math.floor((now - punchInTime) / 1000);
        elapsed = Number(baseTime) + Number(liveDiff);
      }

      setCurrentTime(formatDuration(elapsed));
    };

    // 🔹 Initial call
    updateElapsed();

    // 🔹 Keep ticking if punched in
    if (punch && punchInTime) {
      interval = setInterval(updateElapsed, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [punch, todayRecord?.punch_in, todayRecord?.total_time]);

  // Split for UI
  const [hh, mm, ss] = currentTime.split(':');

  return (
    <View style={headerStyles.header}>
      {/* <Text style={headerStyles.title}>{title}</Text> */}
      <Image
        source={require('../../assets/images/logo.png')}
        style={{ width: 35, height: 35 }}
        resizeMode="contain"
      />

      {/* Timer */}
      <View style={headerStyles.timerRow}>
        <View style={headerStyles.timerBox}>
          <Text style={headerStyles.timerText}>{hh}</Text>
        </View>
        <View style={headerStyles.timerBox}>
          <Text style={headerStyles.timerText}>{mm}</Text>
        </View>
        <View style={headerStyles.timerBox}>
          <Text style={headerStyles.timerText}>{ss}</Text>
        </View>
      </View>
    </View>
  );
};

// 🔹 Format helper
const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${hours}:${minutes}:${secs}`;
};
