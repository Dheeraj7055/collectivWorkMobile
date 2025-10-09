import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  menu: {
    fontSize: 18,
    color: '#999',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e88e5',
    marginBottom: 4,
  },
  repostedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e88e5',
    marginBottom: 8,
  },
  content: {
    fontSize: 13,
    color: '#444',
    marginBottom: 6,
  },

  // Image grid
  singleImage: {
    width: '100%',
    height: 250, // bigger like LinkedIn
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    marginTop: 6,
    overflow: 'hidden', // prevent image overflow
  },
  halfImage: {
    flex: 1, // width: '50%'
    height: 250,
    borderRadius: 8,
  },
  leftLarge: {
    flex: 1, // fill left side
    height: 250,
    borderRadius: 8,
    marginRight: 2,
  },
  rightColumn: {
    flex: 1, // fill right side
    justifyContent: 'space-between',
  },
  quarterImage: {
    width: '100%',
    height: 122, // 250/2 - spacing
    borderRadius: 8,
    marginBottom: 2,
  },
  moreContainer: {
    position: 'relative',
    width: '100%',
    height: 122,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  moreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#ddd',
    paddingVertical: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
  },
  reactionPicker: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 40,
    left: 0,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  reactionIcon: {
    marginHorizontal: 4,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
  },
  playIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  flexHalf: {
    flex: 1,
    marginHorizontal: 2, // spacing between two halves
  },
  singleWrapper: {
    marginTop: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentContent: {
    marginLeft: 10,
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
  },

  commentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 2,
  },
  commentListBlock: {
    maxHeight: 200,
  },

  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  commentBody: {
    flex: 1,
    marginLeft: 10,
  },

  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  commentName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000',
  },

  commentRole: {
    fontSize: 12,
    color: '#666',
  },

  commentTime: {
    fontSize: 12,
    color: '#666',
  },

  commentText: {
    marginTop: 4,
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },

  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 12,
  },

  commentAction: {
    fontSize: 12,
    // color: '#666',
    marginRight: 8,
  },

  reactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },

  emoji: {
    fontSize: 14,
    marginRight: 2,
  },

  likeCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
    marginRight: 8,
  },

  replyCount: {
    fontSize: 12,
    color: '#666',
  },

  // Input Row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 10,
    height: 45,
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    marginHorizontal: 6,
  },
  sendButton: {
    // marginLeft: 6,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: 'center',
  },
  disabledSendButton: {
    backgroundColor: '#aaa',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    // marginBottom: 8,
  },

  // Footer Buttons
  confirmButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  cancelText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
    gap: 10,
  },
  saveBtn: {
    backgroundColor: '#0E79B6',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cancelBtn: {
    backgroundColor: '#999',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginLeft: 8,
  },

  reactionCountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  reactionCountText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#333',
    fontWeight: '500',
  },
  menuOption: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: '#333',
  },
  tabButton: {
  flexDirection: 'row',
  alignItems: 'center',
  marginRight: 10,
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
  backgroundColor: '#f2f2f2',
},
tabButtonActive: {
  backgroundColor: '#e0ebff',
},
tabText: {
  // marginLeft: 5,
  fontSize: 13,
  color: '#555',
},
imageTabText: {
  marginLeft: 5,
  fontSize: 13,
  color: '#555',
},
tabTextActive: {
  color: '#0066cc',
  fontWeight: '600',
},
profileImage: {
  width: 40,
  height: 40,
  borderRadius: 20,
},
userName: {
  fontWeight: '600',
  fontSize: 14,
  color: '#222',
},
userDesignation: {
  fontSize: 12,
  color: '#777',
},

});
