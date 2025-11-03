// src/hooks/useNetwork.ts
import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export const useNetwork = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    const handleState = (state: NetInfoState) => {
      // state.isConnected = device has some kind of network (wifi/cell)
      // state.isInternetReachable can be null right after reconnection
      if (state.isConnected === true) {
        // as soon as we know we have a network, consider it online
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    };

    // initial fetch
    NetInfo.fetch().then(handleState);

    // subscribe
    const unsubscribe = NetInfo.addEventListener(handleState);

    return () => unsubscribe();
  }, []);

  return { isConnected };
};
