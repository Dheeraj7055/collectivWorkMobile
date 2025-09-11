import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import Video from "react-native-video";
import ImageViewing from "react-native-image-viewing";
import moment from "moment";

export interface MediaItem {
  id: string | number;
  name: string;
  type: string; // "image/png", "video/mp4", etc.
  url: string;
}

export interface PostProps {
  id: string | number;
  name: string;
  date: string;
  title: string;
  content: string;
  images?: MediaItem[];
  likes?: number;
  comments?: number;
  profileImage?: string | null;
  profileColor?: string;
}

export const PostCard: React.FC<PostProps> = ({
  id,
  name,
  date,
  title,
  content,
  images = [],
  likes = 0,
  comments = 0,
  profileImage,
  profileColor = "#999",
}) => {
  const [isViewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  };

  const renderMedia = (item: MediaItem, index: number, className: string) => {
    if (item.type.startsWith("image/")) {
      return (
        <TouchableOpacity key={item.id} onPress={() => openViewer(index)}>
          <Image
            source={{ uri: item.url }}
            className={`${className} rounded-lg`}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }

    if (item.type.startsWith("video/")) {
      return (
        <TouchableOpacity key={item.id} onPress={() => openViewer(index)}>
          <Video
            source={{ uri: item.url }}
            className={`${className} rounded-lg`}
            resizeMode="cover"
            paused={true}
          />
          <View className="absolute inset-0 items-center justify-center bg-black/30 rounded-lg">
            <Text className="text-white text-2xl font-bold">▶</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderImageGrid = () => {
    if (!images || images.length === 0) return null;

    // Video first
    if (images[0].type.startsWith("video/")) {
      return (
        <View className="mt-2">
          <Video
            source={{ uri: images[0].url }}
            className="w-full h-52 rounded-lg"
            controls
            resizeMode="cover"
          />
        </View>
      );
    }

    // 1 image
    if (images.length === 1) {
      return renderMedia(images[0], 0, "w-full h-52 mt-2");
    }

    // 2 images
    if (images.length === 2) {
      return (
        <View className="flex-row mt-2 space-x-1">
          {images.map((img, idx) =>
            renderMedia(img, idx, "w-1/2 h-52")
          )}
        </View>
      );
    }

    // 3 images
    if (images.length === 3) {
      return (
        <View className="flex-row mt-2 space-x-1">
          {renderMedia(images[0], 0, "w-1/2 h-52")}
          <View className="w-1/2 justify-between space-y-1">
            {renderMedia(images[1], 1, "w-full h-24")}
            {renderMedia(images[2], 2, "w-full h-24")}
          </View>
        </View>
      );
    }

    // 4+ images
    if (images.length > 3) {
      return (
        <View className="flex-row mt-2 space-x-1">
          {renderMedia(images[0], 0, "w-1/2 h-52")}
          <View className="w-1/2 justify-between space-y-1">
            {renderMedia(images[1], 1, "w-full h-24")}
            <TouchableOpacity
              onPress={() => openViewer(2)}
              className="relative w-full h-24"
            >
              <Image
                source={{ uri: images[2].url }}
                className="w-full h-full rounded-lg"
              />
              <View className="absolute inset-0 bg-black/50 rounded-lg items-center justify-center">
                <Text className="text-white font-bold text-lg">
                  +{images.length - 3}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };

  return (
    <View
      key={id}
      className="bg-white rounded-lg p-3 m-3 shadow-sm"
    >
      {/* Header */}
      <View className="flex-row items-center mb-2">
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            className="w-10 h-10 rounded-full mr-2"
          />
        ) : (
          <View
            className="w-10 h-10 rounded-full mr-2 items-center justify-center"
            style={{ backgroundColor: profileColor }}
          >
            <Text className="text-white font-bold text-sm">
              {getInitials(name)}
            </Text>
          </View>
        )}
        <View className="flex-1">
          <Text className="font-bold text-sm">{name}</Text>
          <Text className="text-xs text-gray-500">
            {moment(date).format("DD MMM YYYY | hh:mm A")}
          </Text>
        </View>
        <Text className="text-lg text-gray-400">⋮</Text>
      </View>

      {/* Title + Content */}
      <Text className="text-sm font-semibold text-blue-600 mb-1">{title}</Text>
      <Text className="text-xs text-gray-700 mb-2">{content}</Text>

      {/* Media Grid */}
      {renderImageGrid()}

      <ImageViewing
        images={images
          .filter((m) => m.type.startsWith("image/"))
          .map((img) => ({ uri: img.url }))}
        imageIndex={viewerIndex}
        visible={isViewerVisible}
        onRequestClose={() => setViewerVisible(false)}
      />

      {/* Footer */}
      <View className="flex-row justify-between mt-2 mb-1">
        <Text className="text-xs text-gray-500">👍 {likes} Likes</Text>
        <Text className="text-xs text-gray-500">{comments} Comments</Text>
      </View>

      {/* Actions */}
      <View className="flex-row justify-around border-t border-gray-200 pt-2">
        <TouchableOpacity>
          <Text className="font-semibold text-xs text-gray-600">Like</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text className="font-semibold text-xs text-gray-600">Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text className="font-semibold text-xs text-gray-600">Repost</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text className="font-semibold text-xs text-gray-600">Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
