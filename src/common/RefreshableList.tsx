// components/common/RefreshableList.tsx
import React, { useState, useCallback } from "react";
import { FlatList, RefreshControl, FlatListProps } from "react-native";

interface RefreshableListProps<T> extends FlatListProps<T> {
  onRefreshData: () => Promise<void> | void;
}

export function RefreshableList<T>({
  onRefreshData,
  ...rest
}: RefreshableListProps<T>) {
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
    <FlatList
      {...rest}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    />
  );
}
