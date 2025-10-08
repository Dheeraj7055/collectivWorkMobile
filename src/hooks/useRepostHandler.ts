import { useState } from 'react';
import { encodeData } from '@/utils/cryptoHelpers';
import { apiClient } from '@/services/api';
import { API_ROUTES } from '@/constants/apiRoutes';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { fetchAnnouncements } from '@/redux/slices/announcementSlice';
import { Announcement } from '@/types/announcement';

export const useRepostHandler = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [showRepostModal, setShowRepostModal] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);

  const openRepostModal = (announcement: Announcement) => {
    setCurrentAnnouncement(announcement);
    setShowRepostModal(true);
  };

  const closeRepostModal = () => {
    setShowRepostModal(false);
    setCurrentAnnouncement(null);
  };

  const handleRepost = async (
    announcement: Announcement,
    type: 'withThoughts' | 'withoutThoughts',
    description?: string,
  ) => {
    try {
      const payload =
        type === 'withoutThoughts'
          ? { announcement_id: announcement.id }
          : { announcement_id: announcement.id, repost_thought: description };

      const encoded = encodeData(payload);
      const res = await apiClient.post(API_ROUTES.REPOST_ANNOUNCEMENT, { payload: encoded });

      if (res?.success) {
        Toast.show({ type: 'success', text1: 'Post reposted successfully' });
        dispatch(fetchAnnouncements({ postName: 'all', searchParam: '' }));
      } else {
        Toast.show({ type: 'error', text1: res?.message || 'Failed to repost' });
      }
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.message || 'Error reposting' });
    } finally {
      closeRepostModal();
    }
  };

  return {
    showRepostModal,
    currentAnnouncement,
    openRepostModal,
    closeRepostModal,
    handleRepost,
  };
};
