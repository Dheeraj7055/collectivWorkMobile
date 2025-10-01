import React from "react";
import { View, StyleSheet } from "react-native";
import Image from "react-native-remote-svg";

interface HolidayImageProps {
  uri?: string;
  size?: number;
  backgroundColor?: string;
}

export const HolidayImage: React.FC<HolidayImageProps> = ({
  uri,
  size = 35,
  backgroundColor = "#f0f0f0",
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{
            width: 44,
            height: 44,
            borderRadius: size / 2,
          }}
          resizeMode="cover"
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
});





