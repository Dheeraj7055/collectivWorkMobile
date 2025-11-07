// screens/PostDetailScreen.tsx
import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchAnnouncements } from '@/redux/slices/announcementSlice';
import { PostCard } from '@/components/PostCard';
import { SafeAreaView } from 'react-native-safe-area-context';

type PostDetailParams =
  | { postId: number; announcement?: never }
  | { postId?: never; announcement: any };

export const PostDetailScreen = ({ route, navigation }: any) => {
  const { postId, announcement: passedAnnouncement } = route.params as PostDetailParams;
  const dispatch = useDispatch<AppDispatch>();
  const { records, isLoading, error } = useSelector((s: RootState) => s.announcements);

  // Try to resolve announcement from store (or use directly if passed)
  const announcement = useMemo(() => {
    if (passedAnnouncement) return passedAnnouncement;
    if (postId == null) return undefined;
    return records.find(r => r.id === postId);
  }, [passedAnnouncement, postId, records]);

  // If not found in store and we only have an id, load announcements (cheap fallback)
  useEffect(() => {
    if (!announcement && postId != null) {
      dispatch(fetchAnnouncements({ postName: 'all', searchParam: '' }));
    }
  }, [announcement, postId, dispatch]);

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!announcement) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {isLoading ? <ActivityIndicator size="large" color="#0a66c2" /> : <Text>Post not found</Text>}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
      <View style={{ paddingVertical: 8 }} />
      {/* detailMode is optional in your PostCard typing; pass it in case you later use it */}
      <PostCard announcement={announcement} detailMode />
    </SafeAreaView>
  );
};
