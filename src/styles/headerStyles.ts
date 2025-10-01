// src/styles/headerStyles.ts
import { StyleSheet } from "react-native";

export const headerStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  timer: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2196F3",
  },
   timerRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  timerBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginHorizontal: 4,

    // ✅ Shadow
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  timerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },
   punchButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  punchText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
