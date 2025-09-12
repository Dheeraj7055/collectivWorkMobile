import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import Video from "react-native-video";
import ImageViewing from "react-native-image-viewing";
import moment from "moment";
import { styles } from "@/styles/postCardStyles";
import { SvgUri } from "react-native-svg";
import { apiClient } from "@/services/api";
import { API_ROUTES } from "@/constants/apiRoutes";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnnouncements } from "@/redux/slices/announcementSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { encodeData } from "@/utils/cryptoHelpers";

const { width, height } = Dimensions.get("window");

export interface MediaItem {
  id: string | number;
  name: string;
  type: string; // "image/png", "video/mp4", "image/gif", "image/svg+xml"
  url: string;
}

export interface PostProps {
  announcement: any,
  id: string | number;
  name: string;
  date: string;
  title: string;
  content: string;
  images?: MediaItem[];
  likes?: number;
  comments?: number;
  profileImage?: string | null;
  profileColor?: string,
}

export const PostCard: React.FC<PostProps> = ({
  announcement,
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
  const [svgViewerVisible, setSvgViewerVisible] = useState(false);
  const [svgIndex, setSvgIndex] = useState(0);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
   const userData = useSelector((state: RootState) => state.user.profile);

  const reactions = [
    {
      name: "Like",
      emoji:
        "https://hr-screening.s3.ap-south-1.amazonaws.com/test%20open%20files%20upload/likedIcon.svg_1740128322035",
      code: "Like",
      emojiFont: "#0a66c2",
    },
    {
      name: "Celebrate",
      emoji:
        "https://hr-screening.s3.ap-south-1.amazonaws.com/test%20open%20files%20upload/celebrateIcon.svg_1740128322034",
      code: "celebrate",
      emojiFont: "#44712e",
    },
    {
      name: "Support",
      emoji:
        "https://hr-screening.s3.ap-south-1.amazonaws.com/test%20open%20files%20upload/supportIcon.svg_1740128322034",
      code: "support",
      emojiFont: "#715e86",
    },
    {
      name: "Love",
      emoji:
        "https://hr-screening.s3.ap-south-1.amazonaws.com/test%20open%20files%20upload/loveIcon.svg_1740128322032",
      code: "love",
      emojiFont: "#b24020",
    },
    {
      name: "Insightful",
      emoji:
        "https://hr-screening.s3.ap-south-1.amazonaws.com/test%20open%20files%20upload/insightfulIcon.svg_1740128322032",
      code: "insightful",
      emojiFont: "#915907",
    },
    {
      name: "Laugh",
      emoji:
        "https://hr-screening.s3.ap-south-1.amazonaws.com/test%20open%20files%20upload/laughIcon.svg_1740128322030",
      code: "laugh",
      emojiFont: "#1a707e",
    },
  ];

  const handleReactionSelect = async (reaction: string) => {
  try {
    setSelectedReaction(reaction);
    setShowReactions(false);

    const payload = {
      announcement_id: id,
      reaction_name: reaction,
    };
    const encodedPayload = encodeData(payload);

    const response = await apiClient.post(
      API_ROUTES.ANNOUNCEMENT_LIKE,
      { payload: encodedPayload }   // ✅ send with "payload" key
    );

    if (response?.success) {
      dispatch(fetchAnnouncements({ postName: "all", searchParam: "" }));
    } else {
      console.warn(response?.message || "Failed to like post");
    }
  } catch (err: any) {
    console.error("Error liking post:", err.response?.data || err.message);
  }
};

// const handleLikeToggle = async () => {
//   try {
//     if (selectedReaction) {
//       // remove like
//       const payload = { announcement_id: id };
//       const encodedPayload = encodeData(payload);

//       const response = await apiClient.post(
//         API_ROUTES.ANNOUNCEMENT_REMOVE_LIKE,
//         { payload: encodedPayload }
//       );

//       if (response?.success) {
//         setSelectedReaction(null);
//         dispatch(fetchAnnouncements({ postName: "all", searchParam: "" }));
//       }
//     } else {
//       // default like
//       await handleReactionSelect("Like");
//     }
//   } catch (err: any) {
//     console.error("Error toggling like:", err.response?.data || err.message);
//   }
// };

const handleLikeToggle = async () => {
  try {
    if (selectedReaction) {
      // Find the reaction entry for this user
      // const userLike = announcement?.AnnouncementLikes?.find(
      //   (item) => item.liked_by === userData?.id
      // );

      // if (!userLike) {
      //   console.warn("No like record found for this user");
      //   return;
      // }

      // remove like payload with both fields
      const payload = {
        // id: userLike.id,
        announcement_id: id,
      };
      const encodedPayload = encodeData(payload);

      const response = await apiClient.post(
        API_ROUTES.ANNOUNCEMENT_REMOVE_LIKE,
        { payload: encodedPayload }
      );

      if (response?.success) {
        setSelectedReaction(null);
        dispatch(fetchAnnouncements({ postName: "all", searchParam: "" }));
      } else {
        console.warn(response?.message || "Failed to remove like");
      }
    } else {
      // default like
      await handleReactionSelect("Like");
    }
  } catch (err: any) {
    console.error("Error toggling like:", err.response?.data || err.message);
  }
};



  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const bitmapImages = images.filter(
    (m) => m.type.startsWith("image/") && m.type !== "image/svg+xml"
  );

  const openViewer = (index: number) => {
    const item = images[index];
    if (item.type === "image/svg+xml") {
      setSvgIndex(index);
      setSvgViewerVisible(true);
    } else {
      setViewerIndex(bitmapImages.findIndex((m) => m.id === item.id));
      setViewerVisible(true);
    }
  };

  const renderMedia = (item: MediaItem, style: any, index: number) => {
    if (item.type.startsWith("image/")) {
      if (item.type === "image/svg+xml") {
        return (
          <TouchableOpacity key={item.id} onPress={() => openViewer(index)}>
            <SvgUri width="100%" height="200" uri={item.url} />
          </TouchableOpacity>
        );
      }
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
            controls
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderImageGrid = () => {
    if (!images || images.length === 0) return null;

    if (images.length === 1) {
      return renderMedia(images[0], styles.singleImage, 0);
    }

    if (images.length === 2) {
      return (
        <View style={styles.row}>
          {images.map((img, idx) => (
            <View key={img.id} style={{ flex: 1, marginHorizontal: 1 }}>
              {renderMedia(img, styles.halfImage, idx)}
            </View>
          ))}
        </View>
      );
    }

    if (images.length === 3) {
      return (
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 1 }}>
            {renderMedia(images[0], styles.leftLarge, 0)}
          </View>
          <View style={styles.rightColumn}>
            {renderMedia(images[1], styles.quarterImage, 1)}
            {renderMedia(images[2], styles.quarterImage, 2)}
          </View>
        </View>
      );
    }

    if (images.length > 3) {
      return (
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 1 }}>
            {renderMedia(images[0], styles.leftLarge, 0)}
          </View>
          <View style={styles.rightColumn}>
            {renderMedia(images[1], styles.quarterImage, 1)}
            <TouchableOpacity
              onPress={() => openViewer(2)}
              style={styles.moreContainer}
            >
              {renderMedia(images[2], styles.quarterImage, 2)}
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
        images={bitmapImages.map((img) => ({ uri: img?.url }))}
        imageIndex={viewerIndex}
        visible={isViewerVisible}
        onRequestClose={() => setViewerVisible(false)}
      />

      {/* SVG Viewer */}
      <Modal
        visible={svgViewerVisible}
        transparent={true}
        onRequestClose={() => setSvgViewerVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "black",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <SvgUri
            uri={images[svgIndex]?.url}
            width={width * 0.9}
            height={height * 0.7}
          />
          <TouchableOpacity
            style={{ position: "absolute", top: 40, right: 20 }}
            onPress={() => setSvgViewerVisible(false)}
          >
            <Text style={{ color: "white", fontSize: 20 }}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>👍 {likes} Likes</Text>
        <Text style={styles.footerText}>{comments} Comments</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {/* Like Button */}
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity
            onPress={handleLikeToggle}
            onLongPress={() => setShowReactions(true)}
            delayLongPress={150}
            style={styles.actionButton}
          >
            {selectedReaction ? (
              <SvgUri
                uri={
                  reactions.find((r) => r.name === selectedReaction)?.emoji || ""
                }
                width={20}
                height={20}
                style={{ marginRight: 6 }}
              />
            ) : (
              <Text style={{ marginRight: 6 }} />
            )}
            <Text
              style={[
                styles.actionText,
                selectedReaction
                  ? {
                      color:
                        reactions.find((r) => r.name === selectedReaction)
                          ?.emojiFont || "#555",
                    }
                  : {},
              ]}
            >
              {selectedReaction || "Like"}
            </Text>
          </TouchableOpacity>

          {showReactions && (
            <View style={styles.reactionPicker}>
              {reactions.map((reaction) => (
                <TouchableOpacity
                  key={reaction.code}
                  onPress={() => handleReactionSelect(reaction.name)}
                  style={styles.reactionIcon}
                >
                  <SvgUri uri={reaction.emoji} width={32} height={32} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Other Buttons */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Repost</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
