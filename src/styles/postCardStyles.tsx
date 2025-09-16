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
    overflow: 'hidden', // ✅ prevent image overflow
  },
  halfImage: {
    flex: 1, // ✅ no width: '50%'
    height: 250,
    borderRadius: 8,
  },
  leftLarge: {
    flex: 1, // ✅ fill left side
    height: 250,
    borderRadius: 8,
    marginRight: 2,
  },
  rightColumn: {
    flex: 1, // ✅ fill right side
    justifyContent: 'space-between',
  },
  quarterImage: {
    width: '100%',
    height: 122, // ✅ 250/2 - spacing
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
});
