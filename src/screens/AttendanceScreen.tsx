// src/screens/AttendanceScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import {
  Edit2,
  Calendar as CalendarIcon,
  Check,
  ArrowUpRight,
} from "lucide-react-native";

export const AttendanceScreen: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // ⏱ Live clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-GB", { hour12: false });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 🔹 Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Attendance</Text>
          <Text style={styles.timer}>{formatTime(currentTime)}</Text>
        </View>

        {/* 🔹 Today’s Utilization */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Today's Time Utilization</Text>
          <Text style={styles.subText}>
            {currentTime.toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
          <TouchableOpacity style={styles.punchButton}>
            <Text style={styles.punchText}>Punch In</Text>
          </TouchableOpacity>
        </View>

        {/* 🔹 Calendar */}
        <View style={styles.card}>
          <Calendar
            current={currentTime.toISOString().split("T")[0]}
            markedDates={{
              [currentTime.toISOString().split("T")[0]]: {
                selected: true,
                selectedColor: "#2196F3",
              },
            }}
            theme={{
              todayTextColor: "#2196F3",
              arrowColor: "#2196F3",
              textDayFontWeight: "500",
              textMonthFontWeight: "700",
            }}
          />
        </View>

        {/* 🔹 Shift Details */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.dateTitle}>28 May 2025</Text>
          </View>

          {/* Title + Tag */}
          <View style={styles.shiftRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.shiftTitle}>TSC Shift Timings</Text>
              <Text style={styles.shiftTime}>09:30 AM - 07:30 PM</Text>
            </View>
            <View style={styles.wfhTag}>
              <Text style={styles.wfhText}>WFH</Text>
            </View>
          </View>

          {/* Expected Hours */}
          <View style={styles.rowBetweenBorder}>
            <View style={styles.colBox}>
              <Text style={styles.colTitle}>Expected Gross hours</Text>
              <Text style={styles.colValue}>10 hr</Text>
            </View>
            <View style={styles.colBox}>
              <Text style={styles.colTitle}>Expected Effective hours</Text>
              <Text style={styles.colValue}>09 hr</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.rowBetweenBorder}>
            <TouchableOpacity style={styles.actionRow}>
              <Edit2 size={16} color="#0E79B6" />
              <Text style={styles.link}> Regularize</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionRow}>
              <CalendarIcon size={16} color="#0E79B6" />
              <Text style={styles.link}> Apply Leave</Text>
            </TouchableOpacity>
          </View>

          {/* Day Logs */}
          <Text style={styles.sectionSubTitle}>Day Logs</Text>
          <View style={styles.logRow}>
            <Check size={14} color="green" />
            <Text style={styles.logText}>10:30:31 AM</Text>
            <ArrowUpRight size={14} color="red" />
            <Text style={[styles.logText, { color: "red" }]}>11:27:58 AM</Text>
          </View>
          <View style={styles.logRow}>
            <Check size={14} color="green" />
            <Text style={styles.logText}>01:02:42 PM</Text>
            <ArrowUpRight size={14} color="red" />
            <Text style={[styles.logText, { color: "red" }]}>01:58:56 PM</Text>
          </View>
          <View style={styles.logRow}>
            <Check size={14} color="green" />
            <Text style={styles.logText}>05:01:25 PM</Text>
            <ArrowUpRight size={14} color="red" />
            <Text style={[styles.logText, { color: "red" }]}>--:--</Text>
          </View>

          {/* Adjusted Logs */}
          <Text style={styles.sectionSubTitle}>Adjusted Logs</Text>
          <View style={styles.logRow}>
            <Check size={14} color="green" />
            <Text style={styles.logText}>09:30:25 AM</Text>
            <ArrowUpRight size={14} color="red" />
            <Text style={[styles.logText, { color: "red" }]}>--:--</Text>
          </View>

          {/* Footer */}
          <View style={styles.rowBetweenBorder}>
            <Text style={styles.infoText}>Actual Gross hour: --</Text>
            <Text style={styles.infoText}>Actual Effective hour: --</Text>
          </View>
          <Text style={styles.infoText}>Break Time: 40 min</Text>
        </View>

        {/* 🔹 Upcoming Holidays */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Upcoming Holidays</Text>

          {/* Holi */}
          <View style={[styles.holidayBox, { borderColor: "#E53935" }]}>
            <View>
              <Text style={[styles.holidayName, { color: "#E53935" }]}>
                Holi
              </Text>
              <Text style={styles.holidayDate}>02 October 2025</Text>
            </View>
          </View>

          {/* Republic Day */}
          <View style={[styles.holidayBox, { borderColor: "#0E79B6" }]}>
            <View>
              <Text style={[styles.holidayName, { color: "#0E79B6" }]}>
                Republic Day
              </Text>
              <Text style={styles.holidayDate}>26 January 2026</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f4f7" },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 16,
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  timer: { fontSize: 16, fontWeight: "600", color: "#2196F3" },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },

  // Section Header
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 6,
    marginBottom: 8,
  },

  // Text Styles
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  sectionSubTitle: { fontWeight: "600", marginTop: 10, marginBottom: 4 },
  subText: { fontSize: 14, color: "#666", marginBottom: 10 },
  infoText: { fontSize: 14, color: "#444" },
  colTitle: { fontSize: 13, color: "#444", marginBottom: 2 },
  colValue: { fontSize: 14, fontWeight: "600" },
  logText: { fontSize: 13, color: "#333", marginHorizontal: 6 },

  // Rows
  rowBetweenBorder: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingVertical: 8,
  },
  logRow: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
  shiftRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  actionRow: { flexDirection: "row", alignItems: "center" },

  // Fix for your error
  colBox: { flex: 1 },

  // Shift
  dateTitle: { fontSize: 16, fontWeight: "700" },
  shiftTitle: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  shiftTime: { fontSize: 14, color: "#666" },
  wfhTag: {
    backgroundColor: "#E6F4EA",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  wfhText: { color: "green", fontWeight: "700", fontSize: 12 },

  link: { marginLeft: 6, color: "#0E79B6", fontWeight: "600" },

  // Punch
  punchButton: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  punchText: { color: "#fff", fontWeight: "600" },

  // Holidays
  holidayBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  holidayName: { fontSize: 15, fontWeight: "700" },
  holidayDate: { fontSize: 13, color: "#666", marginTop: 2 },
});
