// src/components/StatusTag.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface StatusTagProps {
  holiday?: boolean;
  holiday_name?: string | null;
  weekOff?: boolean;
  status?: string | null;
  first_half?: boolean;
  second_half?: boolean;
  is_late_entries?: boolean;
}

export const StatusTag: React.FC<StatusTagProps> = ({
  holiday,
  holiday_name,
  weekOff,
  status,
  first_half,
  second_half,
  is_late_entries,
}) => {
  // 🔹 Holiday
  if (holiday) {
    return (
      <View style={[styles.tag, { backgroundColor: "#FB8C00" }]}>
        {/* <Text style={styles.text}>{holiday_name || "Holiday"}</Text> */}
        <Text style={styles.text}>Holiday</Text>
      </View>
    );
  }

  // 🔹 Week Off
  if (weekOff) {
    return (
      <View style={[styles.tag, { backgroundColor: "#9E9E9E" }]}>
        <Text style={styles.text}>Week Off</Text>
      </View>
    );
  }

  // 🔹 No Log
  if (status === "No Log") {
    return (
      <View style={[styles.tag, { backgroundColor: "#BDBDBD" }]}>
        <Text style={styles.text}>No Log</Text>
      </View>
    );
  }

  // 🔹 Absent
  if (status === "Absent") {
    if (!first_half && !second_half) {
      return (
        <View style={[styles.tag, { backgroundColor: "#E53935" }]}>
          <Text style={styles.text}>ABSENT</Text>
        </View>
      );
    }
    return (
      <View style={[styles.tag, { backgroundColor: "#FBC02D" }]}>
        <Text style={styles.text}>HDL</Text>
      </View>
    );
  }

  // 🔹 Leave
  if (status === "Leave") {
    if (first_half && second_half) {
      return (
        <View style={[styles.tag, { backgroundColor: "#E53935" }]}>
          <Text style={styles.text}>LEAVE</Text>
        </View>
      );
    }
    return (
      <View style={[styles.tag, { backgroundColor: "#FBC02D" }]}>
        <Text style={styles.text}>HDL</Text>
      </View>
    );
  }

  // 🔹 Half Day Leave
  if (status === "Half Day Leave") {
    return (
      <View style={[styles.tag, { backgroundColor: "#FBC02D" }]}>
        <Text style={styles.text}>HDL</Text>
      </View>
    );
  }

  // 🔹 WFH
  if (status === "WFH") {
    return (
      <View style={[styles.tag, { backgroundColor: "#0E79B6" }]}>
        <Text style={styles.text}>
          WFH {is_late_entries ? "(Late Arrival)" : ""}
        </Text>
      </View>
    );
  }

  // 🔹 Half Day
  if (status === "Half Day") {
    return (
      <View style={[styles.tag, { backgroundColor: "#FBC02D" }]}>
        <Text style={styles.text}>HALF DAY</Text>
      </View>
    );
  }

  // 🔹 Short Leave
  if (status === "Short Leave") {
    return (
      <View style={[styles.tag, { backgroundColor: "#FBC02D" }]}>
        <Text style={styles.text}>SHL</Text>
      </View>
    );
  }

  // 🔹 Present
  if (status === "Present") {
    return (
      <View style={[styles.tag, { backgroundColor: "#4CAF50" }]}>
        <Text style={styles.text}>PRESENT</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
});
