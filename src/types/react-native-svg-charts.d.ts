declare module "react-native-svg-charts" {
  import * as React from "react";
  import { StyleProp, ViewStyle } from "react-native";

  export interface ProgressCircleProps {
    style?: StyleProp<ViewStyle>;
    progress?: number;
    progressColor?: string;
    backgroundColor?: string;
    strokeWidth?: number;
    startAngle?: number;
    endAngle?: number;
    children?: React.ReactNode;
  }

  export class ProgressCircle extends React.Component<ProgressCircleProps> {}
}
