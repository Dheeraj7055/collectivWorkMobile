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
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 45,
  },

  searchIcon: {
    marginRight: 6,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  addText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#444', marginBottom: 20 },

  option: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  optionSelected: {
    borderColor: '#0a66c2',
    backgroundColor: '#e8f3ff',
  },

  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  iconCircleSelected: {
    backgroundColor: '#e8f3ff',
  },
  iconText: { fontSize: 16 },

  optionTitle: { fontSize: 15, fontWeight: '600', color: '#333', flex: 1 },
  optionTitleSelected: { color: '#0a66c2' },

  optionDesc: { fontSize: 13, color: '#666', marginLeft: 36 },
  optionDescSelected: { color: '#0a66c2' },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#aaa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#0a66c2',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0a66c2',
  },

  confirmButton: {
    backgroundColor: '#0a66c2',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  confirmText: { color: '#fff', textAlign: 'center', fontWeight: '600' },

  cancelButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#eee',
  },
  cancelText: {
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '600',
    // marginTop: ,
    marginBottom: 8,
    color: '#333',
  },
  dropdown: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    // marginTop: 20
  },
  dropdownDept: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    marginTop: 20,
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#000',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    // marginBottom: 16,
  },
  iconGeneralCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  // iconText: {
  //   fontSize: 18,
  // },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#999',
  },
  checkboxChecked: {
    backgroundColor: '#0a66c2',
    borderColor: '#0a66c2',
  },
  imgIconBlock: {
    marginTop: 6,
    flexDirection: 'row',
    paddingVertical: 10,
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backText: {
    color: '#333',
    fontSize: 16,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  uploadBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
  },

  uploadText: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
  },

  uploadLink: {
    color: '#0E79B6',
    fontWeight: '600',
  },

  uploadHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2f1',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: 4,
  },
  chipText: {
    marginRight: 6,
    fontSize: 14,
  },
  removeText: {
    color: 'red',
    fontWeight: 'bold',
  },
  quesLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 8,
  },
  optionNumber: {
    width: 30,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
    height: 50,
    textAlignVertical: 'center',
  },
  addOption: {
    color: '#007BFF',
    // marginTop: 8,
    fontWeight: '600',
  },
  optionsInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    height: 40,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    paddingVertical: 4,
    minWidth: 160,
    zIndex: 1000,
  },

  dropdownItemSelected: {
    backgroundColor: '#e6f0fa',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#000',
  },
  bookmarkCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    margin: 12,
  },

  bookmarkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    // margin: 12,
    padding: 8,
  },

  bookmarkContent: {
    flex: 1,
    flexShrink: 1,
  },

  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  subject: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0a66c2',
    marginBottom: 4,
  },

  description: {
    fontSize: 13,
    color: '#444',
    flexWrap: 'wrap',
  },
  bookmarkBlock: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bookMarkText: {
    fontSize: 11,
  },
  bookmarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 10
  },

  bookmarkTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
});
