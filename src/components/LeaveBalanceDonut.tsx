// src/components/LeaveBalanceDonut.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

interface LeaveData {
  leave_type: string;
  short_code?: string;
  status?: string;
  consumed_leaves: number;
  remaining_leaves: number;
  assigned_quota: number;
  accured_leave: number;
  annual_quota: number;
  current_month_lop?: number;
  leave_category?: string;
}

interface Props {
  data: LeaveData;
}

const GRAY_LIGHT = '#e0e0e0';
const screenWidth = Dimensions.get('window').width;

const getLeaveColor = (leaveType: string): string => {
  const colorMap: Record<string, string> = {
    'Emergency Leave': '#1976D2',
    'Sick Leave': '#21B487',
    'Comp-off Leave': '#FACC15',
    'Regional Festival Leave': '#E53935',
    'Paid Leave': '#009688',
    'Casual Leave': '#9c27b0',
    'Privilege Leave': '#2196f3',
    'Paternity Leave': '#e17a7a',
    HDL: '#009688',
    SL: '#092882',
  };
  return colorMap[leaveType] || '#1976D2';
};

const LeaveBalanceDonut: React.FC<Props> = ({ data }) => {
  const color = getLeaveColor(data.leave_type);
  const statusActive = data.status;

  const consumed = Number(data.consumed_leaves || 0);
  const available = Number(data.remaining_leaves || 0);
  const totalLeave = Number(data.assigned_quota || 0);
  const accured_leave = Number(data.accured_leave || 0);
  const annual_quota = Number(data.annual_quota || 0);
  const lopMonthQuota = Number(data.current_month_lop || 0);

  const isAllZero = consumed === 0 && available === 0;
  const leaveDeduct = consumed > totalLeave;

  const pieData = isAllZero
    ? [{ value: 1, color: GRAY_LIGHT }]
    : [
        {
          value: consumed,
          color:
            statusActive === 'Inactive'
              ? `${color}30`
              : consumed === 0
              ? GRAY_LIGHT
              : `${color}30`,
        },
        {
          value: available,
          color: available === 0 ? GRAY_LIGHT : color,
        },
      ];

  return (
    <View style={styles.card}>
      {/* 🔹 Leave Type at top center */}
      <Text style={styles.cardHeader}>
        {data.leave_type}{' '}
        {data.short_code && data.short_code !== 'N/A'
          ? `(${data.short_code})`
          : ''}
      </Text>

      {/* Donut Chart */}
      <View style={styles.donutContainer}>
        <PieChart
          donut
          radius={75}
          innerRadius={50}
          data={pieData}
          centerLabelComponent={() => (
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.donutTitle}>
                {data.leave_type.toLowerCase() === 'lop'
                  ? 'Total LOP'
                  : 'Available'}
              </Text>
              <Text
                style={[
                  styles.donutValue,
                  { color: available >= 0 ? '#344054' : 'lightsalmon' },
                ]}
              >
                {data.leave_type.toLowerCase() === 'lop'
                  ? consumed.toFixed(2)
                  : available.toFixed(2)}{' '}
                Day(s)
              </Text>
            </View>
          )}
        />
      </View>

      {/* Meta Info */}
      <View style={styles.metaContainer}>
        {data.leave_category === 'CompOff' ? (
          <>
            <View style={styles.row}>
              <Text style={styles.metaLabel}>Consumed</Text>
              <Text
                style={[
                  styles.metaValue,
                  { color: leaveDeduct ? 'lightsalmon' : '#344054' },
                ]}
              >
                {consumed.toFixed(2)} Day(s)
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.metaLabel}>Accrued So Far</Text>
              <Text style={styles.metaValue}>
                {accured_leave.toFixed(2)} Day(s)
              </Text>
            </View>
          </>
        ) : (
          <>
            {data.leave_type.toLowerCase() === 'lop' ? (
              <>
                {/* <View style={styles.row}>
                  <Text style={styles.metaLabel}>This Month</Text>
                  <Text style={styles.metaValue}>
                    {accured_leave.toFixed(2)} Day(s)
                  </Text>
                </View> */}
                <View style={styles.row}>
                  <Text style={styles.metaLabel}>LOP this month</Text>
                  <Text style={styles.metaValue}>
                    {lopMonthQuota.toFixed(2)} Day(s)
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.metaLabel}>Total LOP Days</Text>
                  <Text style={styles.metaValue}>
                    {consumed.toFixed(2)} Day(s)
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.row}>
                  <Text style={styles.metaLabel}>Consumed</Text>
                  <Text style={styles.metaValue}>
                    {consumed.toFixed(2)} Day(s)
                  </Text>
                </View>

                {/* Grid Row for Allocated + Annual Quota */}
                <View style={styles.gridRow}>
                  <View style={[styles.gridItem, styles.borderRight]}>
                    <Text style={styles.metaLabel}>Allocated Quota</Text>
                    <Text style={styles.metaValue}>
                      {totalLeave.toFixed(2)} Day(s)
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.metaLabel}>Annual Quota</Text>
                    <Text style={styles.metaValue}>
                      {annual_quota.toFixed(2)} Day(s)
                    </Text>
                  </View>
                </View>
              </>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default LeaveBalanceDonut;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    alignItems: 'center',
    width: screenWidth - 22,
    alignSelf: 'center',
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#344054',
    marginBottom: 12,
    textAlign: 'center',
  },
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutTitle: { fontSize: 14, color: '#344054', fontWeight: '600' },
  donutValue: { fontSize: 14, fontWeight: '700' },
  metaContainer: {
    marginTop: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  gridRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  gridItem: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  metaLabel: {
    fontSize: 13,
    color: '#344054',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#344054',
  },
});
