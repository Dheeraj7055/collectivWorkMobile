import { apiClient } from './api';
import { API_ROUTES } from '@/constants/apiRoutes';
import { encodeData } from '@/utils/cryptoHelpers';

/**
 * Handles all profile related API calls (cover/profile image upload/remove)
 */
export const profileService = {
  // 🔹 Upload Cover Image
  uploadCoverImage: async (uri: string, user_id: number) => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'cover_image.jpg',
    });

    const payload = encodeData({ user_id });
    formData.append('payload', payload);

    return await apiClient.postForm(API_ROUTES.UPLOAD_COVER_IMAGE, formData);
  },

  // 🔹 Remove Cover Image
  removeCoverImage: async (user_id: number) => {
    const payload = encodeData({ user_id });
    return await apiClient.put(API_ROUTES.REMOVE_COVER_IMAGE, { payload });
  },

  // 🔹 Upload Profile Image
  uploadProfileImage: async (uri: string, user_id: number) => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'profile_image.jpg',
    });

    const query = encodeData({ user_id });
    formData.append('query', query);

    return await apiClient.postForm(API_ROUTES.UPLOAD_PROFILE_IMAGE, formData);
  },

  // 🔹 Remove Profile Image
  removeProfileImage: async (user_id: number) => {
    const payload = encodeData({ user_id });
    return await apiClient.post(API_ROUTES.REMOVE_PROFILE_IMAGE, { payload });
  },
};
