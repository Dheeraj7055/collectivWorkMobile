import { StyleSheet, Dimensions } from "react-native";
const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  summaryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 10,
  },
  card: {
    width: '100%',
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardTitle: { fontWeight: "600", fontSize: 14, marginBottom: 8, textAlign: "center" },
//   progressCircle: { height: 120, marginBottom: 10, width: 100 },
  total: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  meta: { fontSize: 12, color: "#666", marginBottom: 2 },
  bold: { fontWeight: "600" },
  progressContainer: {
  justifyContent: "center",
  alignItems: "center",
  marginVertical: 10,
},

progressWrapper: {
  justifyContent: "center",
  alignItems: "center",
  marginVertical: 10,
},

progressCircle: {
  height: 120,
  width: 120,
},

progressTextContainer: {
  position: "absolute",
  justifyContent: "center",
  alignItems: "center",
},

progressLabel: {
  fontSize: 12,
  color: "#666",
},

progressValue: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#000",
},

metaText: {
  fontSize: 13,
  color: "#666",
  marginTop: 4,
},

boldText: {
  fontWeight: "600",
},

  requestCard: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  requestTitle: { fontWeight: "600", fontSize: 15, marginBottom: 8 },
  requestRow: { fontSize: 13, marginBottom: 4 },
  status: { fontWeight: "600" },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
  },
  searchBox: {
    // flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 45,
    width: 279
  },

  searchIcon: {
    marginRight: 6,
  },

  searchInput: {
    // flex: 1,
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
});
