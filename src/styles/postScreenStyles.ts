// src/styles/postScreenStyles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  timer: { fontSize: 16, fontWeight: '600', color: '#2196F3' },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  searchInput: { flex: 1, marginLeft: 6, fontSize: 14, color: '#000' },
  iconButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    marginLeft: 6,
  },
});
