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
    height: 200,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    marginTop: 6,
  },
  halfImage: {
    width: '50%',
    height: 200,
    borderRadius: 8,
  },
  leftLarge: {
    width: '50%',
    height: 200,
    borderRadius: 8,
    marginRight: 2,
  },
  rightColumn: {
    width: '50%',
    justifyContent: 'space-between',
  },
  quarterImage: {
    width: '100%',
    height: 98,
    borderRadius: 8,
    marginBottom: 2,
  },

  moreContainer: {
    position: 'relative',
    width: '100%',
    height: 98,
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
    fontSize: 16,
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
    justifyContent: 'space-around',
    borderTopWidth: 0.5,
    borderTopColor: '#ddd',
    paddingTop: 6,
  },
  actionText: {
    fontWeight: '600',
    fontSize: 13,
    color: '#555',
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
