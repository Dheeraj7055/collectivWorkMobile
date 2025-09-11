import React from "react";
import { View, Text } from "react-native";
import { headerStyles } from "../styles/headerStyles"; // 👈 import styles

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <View style={headerStyles.header}>
      <Text style={headerStyles.title}>{title}</Text>
      <Text style={headerStyles.timer}>01 : 30 : 48</Text>
    </View>
  );
};
