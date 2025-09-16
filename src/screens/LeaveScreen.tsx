import React from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity } from "react-native";
import { ProgressCircle } from "react-native-svg-charts";
import { styles } from "@/styles/leaveStyles";  // ✅ external stylesheet
import { Plus, Search } from "lucide-react-native";
import { Card } from "@/components/Card";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header";

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
  status: "Pending" | "Approved" | "Rejected";
}

const leaveSummaryData: LeaveSummary[] = [
  { id: "lop", title: "Loss of Pay (LOP)", short: "LOP", consumed: 2, allocated: 10, annual: 10, color: "#2196F3" },
  { id: "el", title: "Emergency Leave (EL)", short: "EL", consumed: 2, allocated: 10, annual: 10, color: "#00BFA5" },
  { id: "cl", title: "Casual Leave (CL)", short: "CL", consumed: 2, allocated: 10, annual: 10, color: "#FF9800" },
  { id: "sl", title: "Sick Leave (SL)", short: "SL", consumed: 2, allocated: 10, annual: 10, color: "#F44336" },
];

const leaveRequests: LeaveRequest[] = [
  {
    id: "1",
    type: "Emergency Leave (EL)",
    requestType: "Single Day",
    requestTo: "Riya Rawat",
    from: "16/07/2025",
    to: "18/07/2025",
    days: 3,
    status: "Pending",
  },
  {
    id: "2",
    type: "Emergency Leave (EL)",
    requestType: "Single Day",
    requestTo: "Riya Rawat",
    from: "16/07/2025",
    to: "18/07/2025",
    days: 3,
    status: "Approved",
  },
];

export const LeaveScreen: React.FC = () => {
  return (
    <SafeAreaView
          style={{ flex: 1, backgroundColor: '#f2f2f2' }}
          edges={['top', 'left', 'right']}
        >
          <Header title="Leaves" />
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            placeholder="Search"
            style={styles.searchInput}
            placeholderTextColor="#888"
          />
        </View>

        <TouchableOpacity
          style={styles.iconButton}
        //   onPress={() => setModalVisible(true)}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        ListHeaderComponent={
          <View style={styles.summaryContainer}>
            {leaveSummaryData.map(leave => {
              const progress = leave.consumed / leave.allocated;
              return (
                <Card key={leave.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{leave.title}</Text>

                  {/* Progress with overlay text */}
                  <View style={styles.progressWrapper}>
                    <ProgressCircle
                      style={styles.progressCircle}
                      progress={progress}
                      progressColor={leave.color}
                      backgroundColor="#eee"
                      strokeWidth={14}
                    />
                    <View style={styles.progressTextContainer}>
                      <Text style={styles.progressLabel}>Total Leaves</Text>
                      <Text style={styles.progressValue}>
                        {leave.allocated}
                      </Text>
                    </View>
                  </View>

                  {/* Meta details */}
                  <Text style={styles.metaText}>
                    Consumed{' '}
                    <Text style={styles.boldText}>{leave.consumed} Days</Text>
                  </Text>
                  <Text style={styles.metaText}>
                    Annual Quota{' '}
                    <Text style={styles.boldText}>{leave.annual} Days</Text>
                  </Text>
                </Card>
              );
            })}
          </View>
        }
        data={leaveRequests}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={styles.requestCard}>
            <Text style={styles.requestTitle}>Leave Request</Text>
            <Text style={styles.requestRow}>
              Leave Type: <Text style={styles.bold}>{item.type}</Text>
            </Text>
            <Text style={styles.requestRow}>
              Request Type: <Text style={styles.bold}>{item.requestType}</Text>
            </Text>
            <Text style={styles.requestRow}>
              Request To: <Text style={styles.bold}>{item.requestTo}</Text>
            </Text>
            <Text style={styles.requestRow}>No. of Days: {item.days}</Text>
            <Text style={styles.requestRow}>
              From: {item.from} → To: {item.to}
            </Text>
            <Text style={styles.requestRow}>
              Status:
              <Text
                style={[
                  styles.status,
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
                {' '}
                {item.status}
              </Text>
            </Text>
          </Card>
        )}
      />
    </SafeAreaView>
  );
};
