import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  //   progressCircle: { height: 120, marginBottom: 10, width: 100 },
  total: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  meta: { fontSize: 12, color: '#666', marginBottom: 2 },
  bold: { fontWeight: '600' },
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },

  progressWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },

  progressCircle: {
    height: 120,
    width: 120,
  },

  progressTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressLabel: {
    fontSize: 12,
    color: '#666',
  },

  progressValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },

  metaText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },

  boldText: {
    fontWeight: '600',
  },

  requestRow: { fontSize: 13, marginBottom: 4 },
  status: { fontWeight: '600' },
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
  requestCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  requestTitle: {
    fontWeight: '600',
    fontSize: 15,
    color: '#007bff',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  leaveLabel: {
    fontSize: 13,
    color: '#555',
  },

  leaveValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  // input: {
  //   borderWidth: 1,
  //   borderColor: '#ddd',
  //   borderRadius: 8,
  //   padding: 10,
  //   marginBottom: 12,
  //   fontSize: 14,
  // },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  // cancelText: {
  //   color: '#333',
  //   fontWeight: 'bold',
  // },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    // marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 14,
    color: '#888',
  },
  leaveTypeDropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    height: 45,
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 8, // prevent text clipping
  },
  picker: {
    flex: 1, // 👈 let it stretch properly
    color: '#000',
  },
  pickerItem: {
    fontSize: 14, // 👈 this controls dropdown text
  },
  submitBtn: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  cancelText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 15,
  },
  leaveContainer: {
    marginBottom: 0,
  },
  field: {
    marginBottom: 5,
  },
  totalLeaveText: {
    fontSize: 14,
    color: '#333',
    marginTop: 6,
  },
  clubContainer: {
    marginTop: 16,
    paddingVertical: 8,
  },

  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },

  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },

  radioCircle: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 6,
  },

  radioSelected: {
    backgroundColor: '#007AFF',
  },

  radioLabel: {
    fontSize: 14,
    color: '#333',
  },
  errorText: {
    color: '#E02D3C',
    fontSize: 12,
    marginTop: 4,
  },
  otherReasonWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  cancelIcon: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
  uploadBox: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    // marginLeft: 10,
  },
  uploadText: { marginTop: 5, fontSize: 12, color: '#666' },
  infoText: { fontSize: 12, color: '#999', marginTop: 4 },
  removeBtn: { marginTop: 6 },
  previewRow: {
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  marginVertical: 8,
},
previewWrapper: {
  position: "relative",
  marginRight: 8,
  marginBottom: 8,
},
previewImage: {
  width: 70,
  height: 70,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: "#ccc",
},
deleteIcon: {
  position: "absolute",
  top: -6,
  right: -6,
  backgroundColor: "rgba(0,0,0,0.6)",
  borderRadius: 12,
  width: 24,
  height: 24,
  justifyContent: "center",
  alignItems: "center",
},
modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.7)",
  justifyContent: "center",
  alignItems: "center",
},
modalContent: {
  width: "90%",
  height: "80%",
  backgroundColor: "#000",
  borderRadius: 8,
  overflow: "hidden",
},
modalImage: {
  flex: 1,
  width: "100%",
},
closeIcon: {
  position: "absolute",
  top: 10,
  right: 10,
  backgroundColor: "rgba(0,0,0,0.6)",
  borderRadius: 15,
  width: 30,
  height: 30,
  justifyContent: "center",
  alignItems: "center",
},

});

export const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    height: 42,
    fontSize: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    color: '#000',
    paddingRight: 30,
  },
  inputAndroid: {
    height: 42,
    fontSize: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    color: '#000',
    paddingRight: 30,
  },
  placeholder: {
    color: '#888',
  },
});
