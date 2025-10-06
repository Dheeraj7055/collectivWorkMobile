import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';

export const ImagePreviewScreen = ({ route, navigation }: any) => {
  const { imageUrl } = route.params;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <X size={26} color="white" />
      </TouchableOpacity>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
});

export default ImagePreviewScreen;
