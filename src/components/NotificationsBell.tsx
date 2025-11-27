// components/NotificationsBell.tsx
import React, { useEffect } from 'react';
import { Pressable, View, Text } from 'react-native';
import { Bell as BellIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchNotificationCount } from '@/redux/slices/notificationSlice';

export const NotificationsBell: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const unread = useAppSelector(s => s.notifications.unreadCount);

  useEffect(() => {
    dispatch(fetchNotificationCount());
  }, [dispatch]);

  return (
    <Pressable
      onPress={() => navigation.navigate('MainTabs', { screen: 'Notifications' })}
      style={{ padding: 6 }}
      hitSlop={10}
    >
      <BellIcon size={22} color="#333" />
      {unread > 0 && (
        <View style={{
          position: 'absolute', right: 2, top: 2, minWidth: 16, height: 16,
          borderRadius: 8, backgroundColor: '#E53935', alignItems: 'center',
          justifyContent: 'center', paddingHorizontal: 3,
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
            {unread > 9 ? '9+' : unread}
          </Text>
        </View>
      )}
    </Pressable>
  );
};
