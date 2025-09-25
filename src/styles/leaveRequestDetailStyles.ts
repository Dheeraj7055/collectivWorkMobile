import { StyleSheet } from 'react-native';

export const leaveRequestDetailStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },

  // --- Header ---
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginTop: 18,
  },
  back: { fontSize: 15, color: '#2196F3' },
  topTitle: { fontSize: 16, fontWeight: '600' },

  // --- Card ---
  card: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#0E79B6',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10, // ✅ consistent spacing
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
  label: { fontSize: 14, fontWeight: '600', color: '#444' },
  value: { fontSize: 14, color: '#222' },
  requestTo: { flexDirection: 'row', alignItems: 'center' },
  //   avatar: { width: 28, height: 28, borderRadius: 14, marginRight: 6 },
  desc: { fontSize: 13, color: '#555', marginTop: 4, lineHeight: 18 },

  // --- Upload ---
  uploadWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  // --- Comments ---
  comments: {
    margin: 12,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  // --- Upload Row ---
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12, // ✅ keeps equal spacing between two boxes
  },
  fileBox: {
    position: 'relative',
    marginRight: 12,
  },
  userImg: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  eyeBtn: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    padding: 4,
  },

  pdfBox: {
    width: 90,
    height: 90,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  pdfIcon: { fontSize: 28 },
  pdfText: { fontSize: 12, marginTop: 4, color: '#444' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  previewImg: {
    width: '100%',
    height: '100%',
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadBox: {
    width: 90,
    height: 90,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  uploadIcon: {
    fontSize: 20,
    color: '#888',
    marginBottom: 4,
  },

  uploadText: {
    fontSize: 13,
    color: '#444',
  },
  commentsSection: {
    margin: 12,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },

  commentsTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },

  // --- Individual Comment Row ---
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20, // ✅ circle avatar
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  initials: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  commentContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
  },

  commentUser: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    color: '#222',
  },

  commentText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
  },

  commentTime: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  commentsCard: {
    margin: 12,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  saveBtn: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 6,
  },
  commentInputExpanded: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },

  addCommentBox: {
    marginBottom: 12,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelBtn: {
    backgroundColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuBox: {
    position: 'absolute',
    top: 20,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    zIndex: 100,
    elevation: 3,
  },
  menuItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 14,
  },
});
