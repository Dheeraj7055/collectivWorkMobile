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
});
