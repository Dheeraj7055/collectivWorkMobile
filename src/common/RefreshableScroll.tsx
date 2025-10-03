// components/common/RefreshableScroll.tsx
import React, { useState, useCallback, ReactNode } from "react";
import { ScrollView, RefreshControl, ScrollViewProps } from "react-native";

interface RefreshableScrollProps extends ScrollViewProps {
  onRefreshData: () => Promise<void> | void;
  children: ReactNode;
}

export const RefreshableScroll: React.FC<RefreshableScrollProps> = ({
  onRefreshData,
  children,
  ...rest
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await onRefreshData();
    } finally {
      setRefreshing(false);
    }
  }, [onRefreshData]);

  return (
    <ScrollView
      {...rest}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {children}
    </ScrollView>
  );
};
