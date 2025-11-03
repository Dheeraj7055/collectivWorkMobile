// src/components/NoInternetBar.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Portal } from 'react-native-paper';
import { useNetwork } from '../hooks/useNetwork';

const NoInternetBar: React.FC = () => {
  const { isConnected } = useNetwork();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      // immediately show
      setVisible(true);
    } else {
      // wait a bit before hiding to avoid flicker while switching networks
      const t = setTimeout(() => setVisible(false), 800);
      return () => clearTimeout(t);
    }
  }, [isConnected]);

  if (!visible) return null;

  return (
    <Portal>
      <View style={styles.container}>
        <Text style={styles.text}>No internet connection</Text>
      </View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#d32f2f',
    paddingTop: 40,
    paddingBottom: 10,
    alignItems: 'center',
    zIndex: 9999,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default NoInternetBar;
