import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import Video from "react-native-video";
import ImageViewing from "react-native-image-viewing";
import moment from "moment";
import { styles } from "@/styles/postCardStyles";

export interface MediaItem {
  id: string | number;
  name: string;
  type: string; // "image/png", "video/mp4", "image/gif", "image/svg+xml"
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

  const renderMedia = (item: MediaItem, style: any, index: number) => {
    if (item.type.startsWith("image/")) {
      return (
        <TouchableOpacity key={item.id} onPress={() => openViewer(index)}>
          <Image source={{ uri: item.url }} style={style} resizeMode="cover" />
        </TouchableOpacity>
      );
    }

    if (item.type.startsWith("video/")) {
      return (
        <TouchableOpacity key={item.id} onPress={() => openViewer(index)}>
          <Video
            source={{ uri: item.url }}
            style={style}
            resizeMode="cover"
            paused={true}
          />
          <View style={styles.videoOverlay}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderImageGrid = () => {
    if (!images || images.length === 0) return null;

    // Handle video first
    if (images[0].type.startsWith("video/")) {
      return (
        <View style={styles.singleWrapper}>
          <Video
            source={{ uri: images[0].url }}
            style={styles.singleImage}
            controls
            resizeMode="cover"
          />
        </View>
      );
    }

    // 1 image
    if (images.length === 1) {
      return (
        <TouchableOpacity onPress={() => openViewer(0)}>
          <Image source={{ uri: images[0].url }} style={styles.singleImage} />
        </TouchableOpacity>
      );
    }

    // 2 images
    if (images.length === 2) {
      return (
        <View style={styles.row}>
          {images.map((img, idx) => (
            <TouchableOpacity
              key={img.id}
              onPress={() => openViewer(idx)}
              style={{ flex: 1, marginHorizontal: 2 }}
            >
              <Image source={{ uri: img.url }} style={styles.halfImage} />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    // 3 images
    if (images.length === 3) {
      return (
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => openViewer(0)}
            style={{ flex: 1, marginRight: 2 }}
          >
            <Image source={{ uri: images[0].url }} style={styles.leftLarge} />
          </TouchableOpacity>
          <View style={styles.rightColumn}>
            <TouchableOpacity onPress={() => openViewer(1)}>
              <Image source={{ uri: images[1].url }} style={styles.quarterImage} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openViewer(2)}>
              <Image source={{ uri: images[2].url }} style={styles.quarterImage} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // 4+ images
    if (images.length > 3) {
      return (
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => openViewer(0)}
            style={{ flex: 1, marginRight: 2 }}
          >
            <Image source={{ uri: images[0].url }} style={styles.leftLarge} />
          </TouchableOpacity>
          <View style={styles.rightColumn}>
            <TouchableOpacity onPress={() => openViewer(1)}>
              <Image source={{ uri: images[1].url }} style={styles.quarterImage} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openViewer(2)}
              style={styles.moreContainer}
            >
              <Image source={{ uri: images[2].url }} style={styles.quarterImage} />
              <View style={styles.overlay}>
                <Text style={styles.moreText}>+{images.length - 3}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };

  return (
    <View key={id} style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: profileColor }]}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.date}>
            {moment(date).format("DD MMM YYYY | hh:mm A")}
          </Text>
        </View>
        <Text style={styles.menu}>⋮</Text>
      </View>

      {/* Title + Content */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>{content}</Text>

      {/* Media Grid */}
      {renderImageGrid()}

      {/* Image Viewer */}
      <ImageViewing
        images={images
          .filter((m) => m.type.startsWith("image/"))
          .map((img) => ({ uri: img.url }))}
        imageIndex={viewerIndex}
        visible={isViewerVisible}
        onRequestClose={() => setViewerVisible(false)}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>👍 {likes} Likes</Text>
        <Text style={styles.footerText}>{comments} Comments</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity>
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.actionText}>Repost</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.actionText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
