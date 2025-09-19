import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { fetchBookmarks } from "@/redux/slices/announcementSlice";
import { styles } from "@/styles/postScreenStyles";
import { ArrowLeft, Bookmark, EllipsisVertical, SearchIcon } from "lucide-react-native";
import { getInitials } from "@/common/CommonFunctions";
import moment from "moment";

const BookmarkRow = ({ announcement }: any) => {
  return (
    <View style={styles.bookmarkRow}>
      {announcement?.createdByUser?.image_url ? (
        <Image
          source={{ uri: announcement?.createdByUser?.image_url }}
          style={styles.avatar}
        />
      ) : (
        <View
          style={[
            styles.avatar,
            {
              backgroundColor:
                announcement?.createdByUser?.profile_color || '#666',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <Text style={styles.avatarText}>
            {getInitials(announcement?.createdByUser)}
          </Text>
        </View>
      )}

      <View style={styles.bookmarkContent}>
        <View>
          <Text style={styles.subject}>{announcement?.subject}</Text>
          <Text style={styles.description} numberOfLines={3}>
            {announcement?.description}
          </Text>
        </View>
        <View style={styles.bookmarkBlock}>
          <Bookmark size="11" color="gray"></Bookmark>
          <Text style={styles.bookMarkText}>
            {moment(announcement?.created_at).format('DD/MM/YYYY | hh:mm A')}
          </Text>
        </View>
      </View>
    </View>
  );
};

// --- Bookmark Screen ---
export const BookmarkScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchValue, setSearchValue] = useState("");
  const { records, isLoading, error } = useSelector(
    (state: RootState) => state.announcements
  );

  useEffect(() => {
    dispatch(fetchBookmarks());
  }, [dispatch]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
      {/* <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <SearchIcon size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            placeholder="Search"
            style={styles.searchInput}
            placeholderTextColor="#888"
            value={searchValue}
            onChangeText={text => {
              setSearchValue(text);
              handleSearch(text);
            }}
          />
        </View>
      </View> */}

      <View style={styles.bookmarkHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 6 }}
        >
          <ArrowLeft size={22} color="#000" />
        </TouchableOpacity>

        <Text style={styles.bookmarkTitle}>Bookmarked Posts</Text>

        <EllipsisVertical size={22} color="gray" />
      </View>

      {isLoading && <ActivityIndicator size="large" color="#0a66c2" />}
      {error && (
        <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
      )}

      <View style={styles.bookmarkCard}>
        <FlatList
          data={records}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <BookmarkRow announcement={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </SafeAreaView>
  );
};
