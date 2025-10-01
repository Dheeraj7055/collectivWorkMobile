declare module "react-native-remote-svg" {
  import * as React from "react";
  import { ImageProps } from "react-native";

  // RemoteSvg behaves like <Image />
  export default class RemoteSvg extends React.Component<ImageProps> {}
}