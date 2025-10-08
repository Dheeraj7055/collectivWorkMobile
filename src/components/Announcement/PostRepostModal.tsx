import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import moment from 'moment';
import AppModal from '@/common/AppModal';
import { styles } from '@/styles/postCardStyles';
import { getInitials } from '@/common/CommonFunctions';
import { Announcement } from '@/types/announcement';
import { PostRepostPreview } from './PostRepostPreview';

interface PostRepostModalProps {
  visible: boolean;
  onClose: () => void;
  userData: any;
  announcement: Announcement | null;
  onSubmit: (announcement: Announcement, type: 'withThoughts' | 'withoutThoughts', description?: string) => void;
}

export const PostRepostModal: React.FC<PostRepostModalProps> = ({
  visible,
  onClose,
  userData,
  announcement,
  onSubmit,
}) => {
  const [repostDescription, setRepostDescription] = useState('');
  const [error, setError] = useState('');

  if (!announcement) return null;

  const handleSubmit = (type: 'withThoughts' | 'withoutThoughts') => {
    if (type === 'withThoughts' && !repostDescription.trim()) {
      setError('Repost thought is required');
      return;
    }
    setError('');
    onSubmit(announcement, type, repostDescription.trim());
    setRepostDescription('');
  };

  return (
    <AppModal visible={visible} onClose={onClose}>
      <ScrollView>
        <Text style={[styles.modalTitle, { marginBottom: 12, color: '#0E79B6' }]}>Repost Post</Text>

        {/* User Info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          {userData?.image_url ? (
            <Image source={{ uri: userData.image_url }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: userData?.profile_color || '#ccc' },
              ]}
            >
              <Text style={styles.avatarText}>{getInitials(userData)}</Text>
            </View>
          )}
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontWeight: '600' }}>{`${userData?.first_name || ''} ${userData?.last_name || ''}`}</Text>
            <Text style={{ color: '#666', fontSize: 12 }}>
              {moment().format('DD MMM YYYY | hh:mm A')}
            </Text>
          </View>
        </View>

        {/* Input */}
        <Text style={{ fontSize: 14, marginBottom: 6 }}>Share your thoughts</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 10,
            minHeight: 80,
            textAlignVertical: 'top',
            marginBottom: 8,
          }}
          value={repostDescription}
          onChangeText={setRepostDescription}
          placeholder="Write something..."
          multiline
        />
        {error ? <Text style={{ color: 'red', fontSize: 12 }}>{error}</Text> : null}

        {/* Preview box */}
        <PostRepostPreview announcement={announcement} />

        {/* Footer buttons */}
        <View style={{ marginTop: 24, gap: 12 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#0a66c2',
              borderRadius: 6,
              paddingVertical: 10,
              alignItems: 'center',
            }}
            onPress={() => handleSubmit('withThoughts')}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Repost with your thoughts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#e5e5e5',
              borderRadius: 6,
              paddingVertical: 10,
              alignItems: 'center',
            }}
            onPress={() => handleSubmit('withoutThoughts')}
          >
            <Text style={{ color: '#000', fontWeight: '600' }}>Repost directly</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AppModal>
  );
};
