// // src/screens/PostScreen.tsx
// import React from 'react';
// import { FlatList, View, Text, TextInput, TouchableOpacity } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { PostCard } from '../components/PostCard';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { styles } from '../styles/postScreenStyles';
// import { Header } from '@/components/Header';


// const mockPosts = [
//   {
//     id: '1',
//     name: 'Riya Rawat',
//     date: '16 July 2024 | 02:32 PM',
//     title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
//     content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
//     images: ['https://picsum.photos/400/300', 'https://picsum.photos/401/300'],
//     likes: 37,
//     comments: 12,
//     profileImage: 'https://i.pravatar.cc/150?img=1',
//   },
//   {
//     id: '2',
//     name: 'Supriya Singh',
//     date: '16 July 2024 | 02:32 PM',
//     title: 'Lorem ipsum dolor sit amet',
//     content: 'Lorem ipsum is simply dummy text of the printing and typesetting industry.',
//     images: [],
//     likes: 36,
//     comments: 10,
//     profileImage: 'https://i.pravatar.cc/150?img=2',
//   },
// ];

// export const PostScreen = () => {
//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f2f2' }} edges={['top', 'left', 'right']}>
//         <Header title="Posts" />

//       {/* Search + Buttons */}
//       <View style={styles.searchRow}>
//         <View style={styles.searchBox}>
//           <Icon name="search" size={20} color="#666" />
//           <TextInput
//             placeholder="Search"
//             style={styles.searchInput}
//             placeholderTextColor="#888"
//           />
//         </View>
//         <TouchableOpacity style={styles.iconButton}>
//           <Icon name="filter-list" size={20} color="#fff" />
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.iconButton}>
//           <Icon name="add" size={20} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {/* Posts Feed */}
//       <FlatList
//         data={mockPosts}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => <PostCard {...item} />}
//       />
//     </SafeAreaView>
//   );
// };

// src/screens/PostScreen.tsx
import React, { useEffect } from "react";
import {
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PostCard } from "@/components/PostCard";
import Icon from "react-native-vector-icons/MaterialIcons";
import { styles } from "@/styles/postScreenStyles";
import { Header } from "@/components/Header";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { fetchAnnouncements } from "@/redux/slices/announcementSlice";

export const PostScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { records, isLoading, error } = useSelector(
    (state: RootState) => state.announcements
  );

  console.log(records);

  useEffect(() => {
    let payload = {
        postName: 'all',
        searchParam: ''
    }
    dispatch(fetchAnnouncements(payload));
  }, [dispatch]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#f2f2f2' }}
      edges={['top', 'left', 'right']}
    >
      <Header title="Posts" />

      {/* Search + Buttons */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            placeholder="Search"
            style={styles.searchInput}
            placeholderTextColor="#888"
          />
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="filter-list" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Loading state */}
      {isLoading && <ActivityIndicator size="large" color="#2196F3" />}

      {/* Error state */}
      {error && (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>
          {error}
        </Text>
      )}

      {/* Posts Feed */}
      <FlatList
        data={records}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            id={item.id}
            name={`${item.createdByUser?.first_name || ''} ${
              item.createdByUser?.last_name || ''
            }`}
            date={item.created_at}
            title={item.subject}
            content={item.description}
            images={item.document_urls || []}
            likes={item.total_likes}
            comments={item.total_comments}
            profileImage={item.createdByUser?.image_url}
            profileColor={item.createdByUser?.profile_color}
          />
        )}
      />
    </SafeAreaView>
  );
};

