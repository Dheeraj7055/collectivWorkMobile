import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Menu } from 'react-native-paper';
import { Pin, PinOff } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { encodeData } from '@/utils/cryptoHelpers';
import { apiClient } from '@/services/api';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchAnnouncements, fetchPinnedUsers } from '@/redux/slices/announcementSlice';

interface PostPinMenuItemProps {
  announcement: any;
  userData: any;
  pinnedUserList: any[];
  closeMenu: () => void;
}

export const PostPinMenuItem: React.FC<PostPinMenuItemProps> = ({
  announcement,
  userData,
  pinnedUserList,
  closeMenu,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const { pinnedUsers } = useSelector(
    (state: RootState) => state.announcements,
  );

  // Determine whose post/repost it is
  const targetUserId = announcement?.reposted_by
    ? announcement?.reposted_by
    : announcement?.createdByUser?.id;

  // Determine if user is already pinned
  const isPinned = pinnedUsers?.some(
    (u: any) => u?.pin_user_id === targetUserId,
  );

  const handlePinUser = async () => {
    setLoading(true);
    const payload = { user_id: targetUserId };
    const encoded = encodeData(payload);

    try {
      const endpoint = isPinned
        ? API_ROUTES.REMOVE_PIN_USER
        : API_ROUTES.PIN_USER;

      const res = await apiClient.post(endpoint, { payload: encoded });

      if (res?.success) {
        Toast.show({
          type: 'success',
          text1: isPinned
            ? 'User unpinned successfully'
            : 'User pinned successfully',
        });
        dispatch(fetchAnnouncements());
        dispatch(fetchPinnedUsers());
      } else {
        Toast.show({
          type: 'error',
          text1: res?.message || 'Failed to update pinned user',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong while pinning user',
      });
    } finally {
      setLoading(false);
      closeMenu();
    }
  };

  // Don’t show if current user is the same as post creator
  if (userData?.id === announcement?.createdByUser?.id) return null;

  return (
    <TouchableOpacity
      disabled={loading}
      onPress={handlePinUser}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        paddingVertical: 4,
        paddingHorizontal: 12,
        opacity: loading ? 0.5 : 1,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {isPinned ? (
          <PinOff size={18} color="#007AFF" />
        ) : (
          <Pin size={18} color="#333" />
        )}

        <Text
          style={{
            fontSize: 15,
            color: isPinned ? '#007AFF' : '#333',
            fontWeight: '500',
          }}
        >
          {isPinned ? 'Unpin User' : 'Pin User'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
