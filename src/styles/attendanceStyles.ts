// src/styles/attendanceStyles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f2f4f7' ,
    marginTop: 12
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  timer: { fontSize: 16, fontWeight: '600', color: '#2196F3' },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },

  holidayCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },

  timeCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },

  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 6,
    marginBottom: 8,
  },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  sectionSubTitle: { fontWeight: '600', marginTop: 10, marginBottom: 4 },
  subText: { fontSize: 14, color: '#666', marginBottom: 10 },
  infoText: { fontSize: 14, color: '#444' },
  colTitle: { fontSize: 13, color: '#444', marginBottom: 2 },
  colValue: { fontSize: 14, fontWeight: '600' },
  logText: { fontSize: 13, color: '#333', marginHorizontal: 6 },

  rowBetweenBorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 8,
  },
  logRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  shiftRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  dayLogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    justifyContent: 'space-between',
  },
  logTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  colBox: { flex: 1 },

  dateTitle: { fontSize: 16, fontWeight: '700' },
  shiftTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  shiftTime: { fontSize: 14, color: '#666' },

  link: { marginLeft: 6, color: '#0E79B6', fontWeight: '600' },

  punchButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  punchText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  holidayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  holidayName: { fontSize: 15, fontWeight: '700' },
  holidayDate: { fontSize: 13, marginTop: 2 },
});
