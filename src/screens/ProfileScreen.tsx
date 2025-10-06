import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { logoutUser } from '@/redux/slices/authSlice';
import Toast from 'react-native-toast-message';
import { styles } from '@/styles/ProfileScreenStyles';
import {
  getFullName,
  getInitials,
  requestCameraAndGalleryPermission,
} from '@/common/CommonFunctions';
import moment from 'moment';
import { Camera, Edit, ImageIcon, Pencil, Trash2 } from 'lucide-react-native';
import AppModal from '@/common/AppModal';
import ImageCropPicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encodeData } from '@/utils/cryptoHelpers';
import { API_BASE_URL } from '@env';
import { fetchUserData } from '@/redux/slices/userSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  removeCoverImage,
  removeProfileImage,
  uploadCoverImage,
} from '@/redux/slices/profileScreenSlice';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '@/navigation/AppNavigator';

export const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userData = useSelector((state: RootState) => state.user.profile);
  const isLoading = useSelector((state: RootState) => state.user.isLoading);
  const profileColor = userData?.user?.profile_color || '#999';
  const [coverImageModal, setCoverImageModal] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [profileImageModal, setProfileImageModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

  const handleLogout = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        Toast.show({
          type: 'success',
          text1: 'Logged out successfully',
        });
      })
      .catch(err => {
        Toast.show({
          type: 'error',
          text1: err || 'Logout failed',
        });
      });
  };

  const openCoverImageModal = () => {
    setCoverImageModal(true);
  };

  const closeCoverImageModal = () => {
    setCoverImageModal(false);
  };

  const openProfileImageModal = () => {
    setProfileImageModal(true);
  };

  const closeProfileImageModal = () => {
    setProfileImageModal(false);
  };

  const handlePickImage = async () => {
    try {
      Alert.alert(
        'Select Image',
        'Choose an image source',
        [
          // CAMERA OPTION
          {
            text: 'Camera',
            onPress: async () => {
              try {
                const image = await ImageCropPicker.openCamera({
                  cropping: true,
                  freeStyleCropEnabled: true,
                  cropperToolbarTitle: 'Adjust your cover image',
                  mediaType: 'photo',
                  compressImageQuality: 0.9,
                  includeBase64: false,
                });

                if (image?.path) {
                  setCoverImage(image.path);
                  await uploadCoverImg(image.path); // 👈 upload automatically
                }
              } catch (err) {
                console.error('Camera pick error:', err);
              }
            },
          },

          // GALLERY OPTION
          {
            text: 'Gallery',
            onPress: async () => {
              try {
                const image = await ImageCropPicker.openPicker({
                  cropping: true,
                  freeStyleCropEnabled: true,
                  cropperToolbarTitle: 'Adjust your cover image',
                  mediaType: 'photo',
                  compressImageQuality: 0.9,
                  includeBase64: false,
                });

                if (image?.path) {
                  setCoverImage(image.path);
                  await uploadCoverImg(image.path); // upload automatically
                }
              } catch (err) {
                console.error('Gallery pick error:', err);
              }
            },
          },

          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true },
      );
    } catch (error: any) {
      console.error('Image Pick Error:', error);
      Alert.alert('Error', 'Unable to pick or crop image');
    }
  };

  const handlePickProfileImage = async () => {
    const hasPermission = await requestCameraAndGalleryPermission();
    if (!hasPermission) return;
    try {
      Alert.alert(
        'Select Image',
        'Choose an image source',
        [
          // CAMERA OPTION
          {
            text: 'Camera',
            onPress: async () => {
              try {
                const image = await ImageCropPicker.openCamera({
                  cropping: true,
                  freeStyleCropEnabled: true,
                  cropperToolbarTitle: 'Adjust your profile image',
                  mediaType: 'photo',
                  compressImageQuality: 0.9,
                  includeBase64: false,
                });

                if (image?.path) {
                  setProfileImage(image.path);
                  await uploadProfileImg(image.path);
                }
              } catch (err) {
                console.error('Camera pick error:', err);
              }
            },
          },

          // GALLERY OPTION
          {
            text: 'Gallery',
            onPress: async () => {
              try {
                const image = await ImageCropPicker.openPicker({
                  cropping: true,
                  freeStyleCropEnabled: true,
                  cropperToolbarTitle: 'Adjust your cover image',
                  mediaType: 'photo',
                  compressImageQuality: 0.9,
                  includeBase64: false,
                });

                if (image?.path) {
                  setProfileImage(image.path);
                  await uploadProfileImg(image.path); // upload automatically
                }
              } catch (err) {
                console.error('Gallery pick error:', err);
              }
            },
          },

          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true },
      );
    } catch (error: any) {
      console.error('Image Pick Error:', error);
      Alert.alert('Error', 'Unable to pick or crop image');
    }
  };

  const uploadProfileImg = async (uri: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user_id = userData?.id;

      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'profile_image.jpg',
      });

      const query = { user_id };
      const encodedQuery = encodeData(query);
      formData.append('query', encodedQuery);

      const response = await fetch(`${API_BASE_URL}/api/users/image/upload`, {
        method: 'POST',
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();

      if (result?.success) {
        Toast.show({
          type: 'success',
          text1: result.message || 'Profile image updated successfully',
        });
        dispatch(fetchUserData());
        closeProfileImageModal();
      } else {
        Toast.show({
          type: 'error',
          text1: result.message || 'Image upload failed',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Something went wrong while uploading image');
    }
  };

  const uploadCoverImg = async (uri: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user_id = userData?.id;

      const formCoverData = new FormData();
      formCoverData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'cover_image.jpg',
      });

      const finalPayload = { user_id };
      const encodedPayload = encodeData(finalPayload);
      formCoverData.append('payload', encodedPayload);

      const response = await fetch(
        `${API_BASE_URL}/api/users/cover/image/upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formCoverData,
        },
      );

      const result = await response.json();

      if (result?.success) {
        Toast.show({
          type: 'success',
          text1: result.message || 'Cover image updated successfully',
        });
        dispatch(fetchUserData());
        closeCoverImageModal();
      } else {
        Toast.show({
          type: 'error',
          text1: result.message || 'Image upload failed',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Something went wrong while uploading image');
    }
  };

  const removeCoverImg = () => {
    dispatch(removeCoverImage({ user_id: userData?.id }))
      .unwrap()
      .then(res => {
        Toast.show({
          type: 'success',
          text1: res.message || 'Cover image removed successfully',
        });
        dispatch(fetchUserData());
        setCoverImage(null);
        closeCoverImageModal();
      })
      .catch(err => {
        Toast.show({
          type: 'error',
          text1: err || 'Failed to remove image',
        });
      });
  };

  const removeProfileImg = () => {
    dispatch(removeProfileImage({ user_id: userData?.id }))
      .unwrap()
      .then(res => {
        Toast.show({
          type: 'success',
          text1: res.message || 'Cover image removed successfully',
        });
        dispatch(fetchUserData());
        setProfileImage(null);
        closeProfileImageModal();
      })
      .catch(err => {
        Toast.show({
          type: 'error',
          text1: err || 'Failed to remove image',
        });
      });
  };

  return (
    <>
      <AppModal visible={coverImageModal} onClose={closeCoverImageModal}>
        <ScrollView
          style={{ maxHeight: 600 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconGeneralCircle}>
            <ImageIcon size="20" color="#0E79B6" />
          </View>

          <Text style={styles.heading}>Cover Image</Text>
          <Text style={styles.subheading}>
            Upload or remove your current cover image below.
          </Text>

          {/* Preview Current Image */}
          <View style={styles.coverPreviewWrapper}>
            {userData?.cover_image_url ? (
              <Image
                source={{
                  uri: coverImage || userData?.cover_image_url,
                }}
                style={styles.coverPreview}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require('../../assets/images/employeeCover.jpg')}
                style={styles.coverPreview}
                resizeMode="cover"
              />
            )}

            {/* Delete Button overlay */}
            {(coverImage || userData?.cover_image_url) && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeCoverImg()}
              >
                <Trash2 size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {/* Change Image Button */}
          <TouchableOpacity style={styles.submitBtn} onPress={handlePickImage}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              Change Image
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </AppModal>

      <AppModal visible={profileImageModal} onClose={closeProfileImageModal}>
        <ScrollView
          style={{ maxHeight: 600 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconGeneralCircle}>
            <ImageIcon size="20" color="#0E79B6" />
          </View>

          <Text style={styles.heading}>Profile Image</Text>
          <Text style={styles.subheading}>
            Upload or remove your current profile image below.
          </Text>

          {/* Preview Current Image */}
          <View style={styles.coverPreviewWrapper}>
            {userData?.image_url ? (
              <Image
                source={{
                  uri: profileImage || userData?.image_url,
                }}
                style={styles.coverPreview}
                resizeMode="cover"
              />
            ) : (
              <TouchableOpacity
                style={styles.uploadPlaceholder}
                onPress={handlePickProfileImage}
                activeOpacity={0.7}
              >
                <View style={styles.uploadIconWrapper}>
                  <ImageIcon size={28} color="#0E79B6" />
                </View>
                <Text style={styles.uploadText}>Upload Image</Text>
              </TouchableOpacity>
            )}

            {/* Delete Button overlay */}
            {(profileImage || userData?.image_url) && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeProfileImg()}
              >
                <Trash2 size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {/* Change Image Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handlePickProfileImage}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              Change Image
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </AppModal>

      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Cover Image */}
          <View style={styles.coverContainer}>
            {isLoading ? (
              <View
                style={{
                  width: '100%',
                  height: 140,
                  backgroundColor: '#CBD5E1',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <ActivityIndicator size="small" color="#1E3A8A" />
              </View>
            ) : (
              <>
                <View style={styles.editBlock} pointerEvents="box-none">
                  <Edit
                    onPress={openCoverImageModal}
                    size="18"
                    color="white"
                  ></Edit>
                </View>
                {userData?.cover_image_url ? (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      navigation.navigate('ImagePreviewScreen', {
                        imageUrl: userData?.cover_image_url,
                      });
                    }}
                  >
                    <Image
                      source={{
                        uri: userData?.cover_image_url,
                      }}
                      style={styles.coverImage}
                    />
                  </TouchableOpacity>
                ) : (
                  <Image
                    source={require('../../assets/images/employeeCover.jpg')}
                    style={styles.coverImage}
                    resizeMode="cover"
                  />
                )}
              </>
            )}
          </View>

          {/* Profile Card */}
          <View style={styles.card}>
            {/* Profile Header with Overlapping Image */}
            <View style={styles.headerSection}>
              <View style={styles.profileImageBlock}>
                {userData?.image_url ? (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      navigation.navigate('ImagePreviewScreen', {
                        imageUrl: userData?.image_url,
                      });
                    }}
                  >
                    <Image
                      source={{
                        uri: userData?.image_url,
                      }}
                      style={styles.profileImage}
                    />
                  </TouchableOpacity>
                ) : (
                  <View
                    style={[styles.avatar, { backgroundColor: profileColor }]}
                  >
                    <Text style={styles.avatarText}>
                      {getInitials(userData?.user)}
                    </Text>
                  </View>
                )}
                <View style={styles.editIcon} pointerEvents="box-none">
                  <Camera
                    onPress={openProfileImageModal}
                    size="18"
                    color="white"
                  ></Camera>
                </View>
              </View>
              <Text style={styles.name}>{getFullName(userData?.user)}</Text>
              <Text style={styles.email}>{userData?.email}</Text>
            </View>

            {/* Info Section */}
            <View style={styles.infoContainer}>
              <View style={styles.row}>
                <Text style={styles.label}>Date of Joining</Text>
                <Text style={styles.value}>
                  {moment(userData?.user?.joining_date).format('DD-MMM-YYYY')}
                </Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.row}>
                <Text style={styles.label}>Gender</Text>
                <Text style={styles.value}>
                  {userData?.user?.gender ? userData?.user?.gender : ''}
                </Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.row}>
                <Text style={styles.label}>Employee ID</Text>
                <Text style={styles.value}>{userData?.user?.employeeID}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.row}>
                <Text style={styles.label}>Department</Text>
                <Text style={styles.value}>
                  {userData?.userDepartment?.department_name}
                </Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.row}>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.value}>{userData?.user?.location}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.row}>
                <Text style={styles.label}>Reports To</Text>
                <Text style={[styles.value, styles.link]}>
                  {userData?.reporting_hr_name}
                </Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.row}>
                <Text style={styles.label}>HR Manager</Text>
                <Text style={[styles.value, styles.link]}>
                  {userData?.reporting_manager_name}
                </Text>
              </View>
              <View style={styles.separator} />
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
};
