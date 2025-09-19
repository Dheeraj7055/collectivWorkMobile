import React, { JSX, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  TextInput,
  FlatList,
} from 'react-native';
import Video from 'react-native-video';
import ImageViewing from 'react-native-image-viewing';
import moment from 'moment';
import { styles } from '@/styles/postCardStyles';
import Svg, { Path, Rect, SvgUri } from 'react-native-svg';
import { apiClient } from '@/services/api';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnnouncements } from '@/redux/slices/announcementSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { encodeData } from '@/utils/cryptoHelpers';
import { fetchUserData } from '@/redux/slices/userSlice';
import { Announcement, CommentItem, MediaItem } from '@/types/announcement';
import { Award, Gift, Star, ThumbsUp } from 'lucide-react-native';
import FastImage from 'react-native-fast-image';
import PraiseTrophy from '../../assets/images/praise-trophy.svg';
import AppModal from '@/common/AppModal';
import { getInitials } from '@/common/CommonFunctions';

const { width, height } = Dimensions.get('window');

interface PostProps {
  announcement: Announcement;
}

export const PostCard: React.FC<PostProps> = ({ announcement }) => {
  const [isViewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [svgViewerVisible, setSvgViewerVisible] = useState(false);
  const [svgIndex, setSvgIndex] = useState(0);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState(false);
  const [selectedPollOption, setSelectedPollOption] = useState<string | null>(
    null,
  );

  const dispatch = useDispatch<AppDispatch>();
  const userData = useSelector((state: RootState) => state.user.profile);

  const id = announcement.id;
  const name = `${announcement.createdByUser?.first_name || ''} ${
    announcement.createdByUser?.last_name || ''
  }`.trim();
  const date = announcement.created_at;
  const title = announcement.subject;
  const content = announcement.description;
  const images = announcement.document_urls || [];
  const likes = announcement.total_likes;
  const comments = announcement.total_comments;
  const profileImage = announcement.createdByUser?.image_url;
  const profileColor = announcement.createdByUser?.profile_color || '#999';

  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [postComments, setPostComments] = useState(
    announcement?.Comments || [],
  );

  // Send Comment
  const handleSendComment = async () => {
    if (!newComment.trim() || !userData?.id) return;

    try {
      const payload = {
        announcement_id: announcement?.id,
        comment: newComment.trim(),
      };

      const encodedPayload = encodeData(payload);

      const response = await apiClient.post(API_ROUTES.SEND_COMMENT, {
        payload: encodedPayload,
      });

      if (response?.data?.success) {
        const newEntry: CommentItem = {
          id: Date.now().toString(),
          comment: newComment,
          created_at: new Date().toISOString(),
          User: {
            id: userData.id,
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            email: userData.email || '',
            image_url: userData.image_url || null,
            profile_color: userData.profile_color || '#ccc',
            designation: userData.designation || '',
          },
        };

        setPostComments(prev => [...prev, newEntry]);
        setNewComment('');

        // Refresh post data from backend (to sync comments count)
        dispatch(fetchAnnouncements({ postName: 'all', searchParam: '' }));
      } else {
        console.warn(response?.data?.message || 'Failed to comment on post.');
      }
    } catch (err: any) {
      console.error(
        'Error posting comment:',
        err?.response?.data?.message || err.message,
      );
    }
  };


  const reactions = [
    {
      name: 'Like',
      emoji:
        'https://hr-screening.s3.ap-south-1.amazonaws.com/test%20open%20files%20upload/likedIcon.svg_1740128322035',
      code: 'Like',
      emojiFont: '#0a66c2',
    },
    {
      name: 'Celebrate',
      emoji:
        'https://hr-screening.s3.ap-south-1.amazonaws.com/test%20open%20files%20upload/celebrateIcon.svg_1740128322034',
      code: 'celebrate',
      emojiFont: '#44712e',
    },
    {
      name: 'Support',
      emoji:
        'https://hr-screening.s3.ap-south-1.amazonaws.com/test%20open%20files%20upload/supportIcon.svg_1740128322034',
      code: 'support',
      emojiFont: '#715e86',
    },
    {
      name: 'Love',
      emoji:
        'https://hr-screening.s3.ap-south-1.amazonaws.com/test%20open%20files%20upload/loveIcon.svg_1740128322032',
      code: 'love',
      emojiFont: '#b24020',
    },
    {
      name: 'Insightful',
      emoji:
        'https://hr-screening.s3.ap-south-1.amazonaws.com/test%20open%20files%20upload/insightfulIcon.svg_1740128322032',
      code: 'insightful',
      emojiFont: '#915907',
    },
    {
      name: 'Laugh',
      emoji:
        'https://hr-screening.s3.ap-south-1.amazonaws.com/test%20open%20files%20upload/laughIcon.svg_1740128322030',
      code: 'laugh',
      emojiFont: '#1a707e',
    },
  ];

  const totalReactions = Object.values(
    announcement.reactions_count || {},
  ).reduce((total, count) => total + (count as number), 0);

  const BadgeIcons: Record<string, JSX.Element> = {
    iconaward: <Award size={30} color="#fff" />,
    iconstar: <Star size={30} color="#fff" />,
    icongift: <Gift size={30} color="#fff" />,
  };

  const handleReactionSelect = async (reaction: string) => {
    try {
      setSelectedReaction(reaction);
      setShowReactions(false);

      const payload = {
        announcement_id: id,
        reaction_name: reaction,
      };
      const encodedPayload = encodeData(payload);

      const response = await apiClient.post(API_ROUTES.ANNOUNCEMENT_LIKE, {
        payload: encodedPayload,
      });

      if (response?.success) {
        dispatch(fetchAnnouncements({ postName: 'all', searchParam: '' }));
      } else {
        console.warn(response?.message || 'Failed to like post');
      }
    } catch (err: any) {
      console.error('Error liking post:', err.response?.data || err.message);
    }
  };

  const handleLikeToggle = async () => {
    try {
      if (selectedReaction) {
        const userLike = announcement?.AnnouncementLikes?.find(
          item => item.liked_by === userData?.id,
        );

        if (!userLike) {
          console.warn('No like record found for this user');
          return;
        }

        const payload = {
          id: userLike.id,
          announcement_id: id,
        };
        const encodedPayload = encodeData(payload);

        const response = await apiClient.post(
          API_ROUTES.ANNOUNCEMENT_REMOVE_LIKE,
          { payload: encodedPayload },
        );

        if (response?.success) {
          setSelectedReaction(null);
          dispatch(fetchAnnouncements({ postName: 'all', searchParam: '' }));
        } else {
          console.warn(response?.message || 'Failed to remove like');
        }
      } else {
        await handleReactionSelect('Like');
      }
    } catch (err: any) {
      console.error('Error toggling like:', err.response?.data || err.message);
    }
  };

  const handleVote = async (announcement: Announcement) => {
    try {
      if (!selectedPollOption) return;
      const payload = {
        announcement_id: announcement.id,
        user_id: userData?.id,
        selectedOption: selectedPollOption,
      };
      const encodedPayload = encodeData(payload);

      const response = await apiClient.post(API_ROUTES.POLL_RESPONSE, {
        payload: encodedPayload,
      });

      if (response?.success) {
        dispatch(fetchAnnouncements({ postName: 'all', searchParam: '' }));
        setSelectedPollOption(null);
      } else {
        console.warn(response?.message || 'Failed to vote');
      }
    } catch (err: any) {
      console.error('Error voting:', err.response?.data || err.message);
    }
  };

  const bitmapImages = images.filter(
    m => m.type.startsWith('image/') && m.type !== 'image/svg+xml',
  );

  const openViewer = (index: number) => {
    const item = images[index];
    if (item.type === 'image/svg+xml') {
      setSvgIndex(index);
      setSvgViewerVisible(true);
    } else {
      setViewerIndex(bitmapImages.findIndex(m => m.id === item.id));
      setViewerVisible(true);
    }
  };

  const renderMedia = (item: MediaItem, style: any, index: number) => {
    if (item.type.startsWith('image/')) {
      // Handle gif
      if (item.type === 'image/gif') {
        return (
          <TouchableOpacity key={item.id} onPress={() => openViewer(index)}>
            <FastImage
              source={{ uri: item.url, priority: FastImage.priority.normal }}
              style={style}
              resizeMode={FastImage.resizeMode.cover}
            />
          </TouchableOpacity>
        );
      }

      // Handle SVG
      if (item.type === 'image/svg+xml') {
        return (
          <TouchableOpacity key={item.id} onPress={() => openViewer(index)}>
            <SvgUri width="100%" height="200" uri={item.url} />
          </TouchableOpacity>
        );
      }

      // Normal images
      return (
        <TouchableOpacity key={item.id} onPress={() => openViewer(index)}>
          <Image source={{ uri: item.url }} style={style} resizeMode="cover" />
        </TouchableOpacity>
      );
    }

    // Video
    if (item.type.startsWith('video/')) {
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

  useEffect(() => {
    dispatch(fetchUserData());
  }, [dispatch]);

  useEffect(() => {
    if (announcement?.AnnouncementLikes && userData?.id) {
      const userLike = announcement.AnnouncementLikes.find(
        item => item.liked_by === userData.id,
      );
      if (userLike) {
        setSelectedReaction(userLike.reaction_name);
      } else {
        setSelectedReaction(null);
      }
    }
  }, [announcement?.AnnouncementLikes, userData?.id]);

  return (
    <>
      <AppModal
        visible={commentModalVisible}
        onClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Comments</Text>
          <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* <FlatList
          data={postComments}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              {item?.User?.image_url ? (
                <Image
                  source={{ uri: item.User.image_url }}
                  style={styles.avatar}
                />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: item.User?.profile_color || '#ddd' },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {`${item.User?.first_name?.[0] || ''}${
                      item.User?.last_name?.[0] || ''
                    }`}
                  </Text>
                </View>
              )}
              <View style={styles.commentContent}>
                <Text style={styles.commentName}>
                  {item.User?.first_name} {item.User?.last_name}
                </Text>
                <Text style={styles.commentText}>{item.comment}</Text>
              </View>
            </View>
          )}
          style={styles.commentListBlock}
        /> */}

        <FlatList
          data={postComments}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              {/* Avatar */}
              {item?.User?.image_url ? (
                <Image
                  source={{ uri: item.User.image_url }}
                  style={styles.avatar}
                />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: item.User?.profile_color || '#ddd' },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {`${item.User?.first_name?.[0] || ''}${
                      item.User?.last_name?.[0] || ''
                    }`}
                  </Text>
                </View>
              )}

              {/* Content */}
              <View style={styles.commentBody}>
                {/* Name + Role + Time */}
                <View style={styles.commentHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.commentName}>
                      {item.User?.first_name} {item.User?.last_name}
                    </Text>
                    {/* <Text style={styles.commentRole}>{item.User.designation}</Text> */}
                  </View>
                  <Text style={styles.commentTime}>
                    {item.updated_at ? moment(item.updated_at).fromNow() : '2d'}
                  </Text>
                </View>

                {/* Comment Text */}
                <Text style={styles.commentText}>{item.comment}</Text>

                {/* Reactions Row */}
                <View style={styles.commentFooter}>
                  <Text style={styles.commentAction}>Like.</Text>
                  <View style={styles.reactionsRow}>
                    <Text style={styles.emoji}>👍</Text>
                    <Text style={styles.emoji}>❤️</Text>
                    <Text style={styles.emoji}>👏</Text>
                    <Text style={styles.likeCount}>18</Text>
                  </View>
                  {/* <Text style={styles.commentAction}>Reply</Text>
                  <Text style={styles.replyCount}>12 Replies</Text> */}
                </View>
              </View>
            </View>
          )}
          style={styles.commentListBlock}
        />

        <View style={styles.commentBox}>
          {userData?.image_url ? (
            <Image source={{ uri: userData.image_url }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: userData?.profile_color || '#ddd' },
              ]}
            >
              <Text style={styles.avatarText}>{getInitials(userData)}</Text>
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor="#888"
              value={newComment}
              onChangeText={setNewComment}
            />

            <TouchableOpacity onPress={() => console.log('Open emoji picker')}>
              <Text style={{ fontSize: 20, marginRight: 6 }}>😊</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendButton,
                !newComment.trim() && styles.disabledSendButton,
              ]}
              disabled={!newComment.trim()}
              onPress={handleSendComment}
            >
              <Text style={{ color: '#fff' }}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Buttons */}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleSendComment}
        >
          <Text style={styles.confirmText}>Comment</Text>
        </TouchableOpacity>
      </AppModal>

      <View key={id} style={styles.card}>
        {/* Header */}

        <View style={styles.header}>
          {/* Profile Avatar */}
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: profileColor }]}>
              <Text style={styles.avatarText}>
                {getInitials(announcement.createdByUser)}
              </Text>
            </View>
          )}

          {/* Name + Subheader */}
          <View style={styles.headerText}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              {/* Normal / Reposted user */}
              <TouchableOpacity>
                <Text style={styles.name}>
                  {announcement?.reposted_by
                    ? announcement?.repostedByUser?.id === userData?.id
                      ? 'You'
                      : `${announcement?.repostedByUser?.first_name || ''} ${
                          announcement?.repostedByUser?.last_name || ''
                        }`
                    : `${announcement?.createdByUser?.first_name || ''} ${
                        announcement?.createdByUser?.last_name || ''
                      }`}
                </Text>
              </TouchableOpacity>

              {/* Reposted tag */}
              {/* {announcement?.reposted_by && (
              <Text style={{ marginLeft: 6, fontSize: 12, color: '#666' }}>
                reposted this
              </Text>
            )} */}

              {/* Praised User */}
              {announcement?.praisedUser && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginLeft: 8,
                  }}
                >
                  <PraiseTrophy
                    width={16}
                    height={16}
                    style={{ marginRight: 8 }}
                  />
                  <TouchableOpacity>
                    <Text style={[styles.name]}>
                      {`${announcement?.praisedUser?.first_name || ''} ${
                        announcement?.praisedUser?.last_name || ''
                      }`}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Date + Edited flag */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 2,
              }}
            >
              <Text style={styles.date}>
                {announcement?.reposted_by &&
                announcement?.repost_post_created_at
                  ? moment(announcement?.repost_post_created_at).format(
                      'DD MMM YYYY | hh:mm A',
                    )
                  : moment(announcement?.created_at).format(
                      'DD MMM YYYY | hh:mm A',
                    )}
              </Text>
              {announcement?.is_edited && (
                <Text style={[styles.date, { marginLeft: 4 }]}> (Edited)</Text>
              )}
            </View>
          </View>

          {/* Menu */}
          <Text style={styles.menu}>⋮</Text>
        </View>

        {/* Title + Content or Poll */}
        {announcement.type === 'poll' ? (
          announcement?.answer_response?.some(
            response => response.user_id === userData?.id,
          ) ? (
            // Already Voted → Show Results
            <View style={{ marginVertical: 8 }}>
              <Text style={styles.title}>{announcement?.question}</Text>
              {announcement?.pollResults?.map((item, index) => {
                const isUserVote = announcement?.answer_response?.find(
                  res =>
                    res.user_id === userData?.id && res.option === item?.option,
                );
                return (
                  <View key={index} style={{ marginVertical: 6 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: isUserVote ? 'bold' : 'normal',
                          color: isUserVote ? '#0a66c2' : '#333',
                        }}
                      >
                        {item?.option}
                      </Text>
                      <Text style={{ fontWeight: '600' }}>
                        {Math.round(item?.percentage)}%
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#e5e5e5',
                        overflow: 'hidden',
                        marginTop: 4,
                      }}
                    >
                      <View
                        style={{
                          width: `${item?.percentage}%`,
                          height: '100%',
                          backgroundColor: isUserVote ? '#0a66c2' : '#888',
                        }}
                      />
                    </View>
                    <Text style={{ marginTop: 2, fontSize: 12, color: '#666' }}>
                      {item?.count} {item.count === 1 ? 'Vote' : 'Votes'}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={{ marginVertical: 8 }}>
              <Text style={styles.title}>{announcement?.question}</Text>
              {announcement?.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderColor:
                      selectedPollOption === option ? '#0a66c2' : '#ccc',
                    borderRadius: 6,
                    marginVertical: 4,
                  }}
                  onPress={() => setSelectedPollOption(option)}
                >
                  <Text
                    style={{
                      color: selectedPollOption === option ? '#0a66c2' : '#333',
                    }}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={{
                  marginTop: 12,
                  backgroundColor: selectedPollOption ? '#0a66c2' : '#ccc',
                  paddingVertical: 8,
                  borderRadius: 6,
                }}
                disabled={!selectedPollOption}
                onPress={() => handleVote(announcement)}
              >
                <Text style={{ textAlign: 'center', color: 'white' }}>
                  Vote
                </Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.content}>{content}</Text>
          </>
        )}

        {announcement?.Badge?.id && (
          <View
            style={{
              marginTop: 12,
              backgroundColor: announcement?.Badge?.color,
              padding: 12,
              borderRadius: 8,
            }}
          >
            <View
              style={{
                backgroundColor: '#fff',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#000', fontWeight: 'bold' }}>
                CERTIFICATE OF APPRECIATION
              </Text>

              <View
                style={{
                  position: 'relative',
                  width: 60,
                  height: 80,
                  marginTop: 10,
                }}
              >
                <Svg
                  width={54}
                  height={71}
                  viewBox="0 0 54 71"
                  fill="none"
                  style={{ position: 'absolute', top: 0, left: 0 }}
                >
                  {/* Left Ribbon */}
                  <Path
                    d="M26.0945 52.0416L21.0855 69.9999L14.8202 62.7222L5.69264 65.7065L10.7017 47.7481C11.0812 46.3873 11.9858 45.233 13.2165 44.5392C14.4471 43.8453 15.903 43.6688 17.2638 44.0483L22.3947 45.4795C23.7555 45.859 24.9098 46.7636 25.6037 47.9943C26.2975 49.2249 26.4741 50.6808 26.0945 52.0416Z"
                    stroke={announcement?.Badge?.color || '#F9A80A'}
                    strokeWidth={1.86438}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Right Ribbon */}
                  <Path
                    d="M43.8241 47.7423L48.8346 65.7002L39.7068 62.7168L33.4421 69.995L28.4316 52.0371C28.0519 50.6763 28.2283 49.2204 28.9221 47.9897C29.6158 46.759 30.77 45.8543 32.1308 45.4747L37.2617 44.0431C38.6224 43.6634 40.0783 43.8398 41.309 44.5336C42.5397 45.2273 43.4444 46.3815 43.8241 47.7423Z"
                    stroke={announcement?.Badge?.color || '#F9A80A'}
                    strokeWidth={1.86438}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Circle */}
                  <Rect
                    x={0.367188}
                    width={53.2681}
                    height={53.2681}
                    rx={26.634}
                    fill={announcement?.Badge?.color || '#F9A80A'}
                  />
                </Svg>

                {/* Insert Icon Inside Circle */}
                <View
                  style={{
                    position: 'absolute',
                    top: '13%',
                    left: '20%',
                  }}
                >
                  {announcement?.Badge?.icon &&
                    BadgeIcons[announcement.Badge.icon.toLowerCase()]}
                </View>
              </View>
              <Text style={{ marginTop: 6, color: '#000', fontWeight: '700' }}>
                {announcement?.Badge?.name}
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  backgroundColor: '#666',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4,
                  color: '#fff',
                  fontWeight: '600',
                }}
              >
                {announcement?.praisedUser?.first_name}{' '}
                {announcement?.praisedUser?.last_name}
              </Text>
              <Text
                style={{ marginTop: 6, fontStyle: 'italic', color: '#000' }}
              >
                {announcement?.description || 'Description'}
              </Text>
              <Text style={{ marginTop: 8, color: '#000', fontSize: 12 }}>
                Praised by{' '}
                {announcement?.createdByUser?.first_name ||
                  announcement?.createdByUser?.last_name ||
                  'Someone'}{' '}
                on{' '}
                {moment(announcement?.Badge?.created_at).format('DD MMM YYYY')}
              </Text>
            </View>
          </View>
        )}

        {/* Media Grid */}
        {renderImageGrid()}

        {/* Image Viewer */}
        <ImageViewing
          images={bitmapImages.map(img => ({ uri: img?.url }))}
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
              backgroundColor: 'black',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <SvgUri
              uri={images[svgIndex]?.url}
              width={width * 0.9}
              height={height * 0.7}
            />
            <TouchableOpacity
              style={{ position: 'absolute', top: 40, right: 20 }}
              onPress={() => setSvgViewerVisible(false)}
            >
              <Text style={{ color: 'white', fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Footer */}
        <View style={styles.footer}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 6,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 3,
              }}
            >
              {Object.entries(announcement.reactions_count || {})
                .slice(0, 3)
                .map(([emoji, count], index) => {
                  const reaction = reactions.find(r => r.name === emoji);

                  return (
                    <View
                      key={index}
                      style={[
                        { marginLeft: index === 0 ? 0 : -8, zIndex: 3 + index },
                        styles.reactionIcon,
                      ]}
                    >
                      {reaction?.emoji ? (
                        <SvgUri uri={reaction.emoji} width={18} height={18} />
                      ) : (
                        <SvgUri
                          uri="https://hr-screening.s3.ap-south-1.amazonaws.com/test%20open%20files%20upload/likedIcon.svg_1740128322035"
                          width={18}
                          height={18}
                        />
                      )}
                    </View>
                  );
                })}
            </View>
            <View>
              {totalReactions > 0 && (
                <Text style={styles.footerText}>
                  {announcement?.AnnouncementLikes?.find(
                    item => item.liked_by === userData?.id,
                  )
                    ? 'You'
                    : announcement?.AnnouncementLikes?.[0]?.User?.first_name ||
                      'Someone'}

                  {totalReactions === 1
                    ? ''
                    : ` and ${totalReactions - 1} ${
                        totalReactions - 1 === 1 ? 'other' : 'others'
                      }`}
                </Text>
              )}
            </View>
          </View>

          <Text style={[styles.footerText, { marginLeft: 10 }]}>
            {comments} Comments
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity
              onPress={handleLikeToggle}
              onLongPress={() => setShowReactions(true)}
              delayLongPress={150}
              style={styles.actionButton}
            >
              {selectedReaction ? (
                <SvgUri
                  uri={
                    reactions.find(r => r.name === selectedReaction)?.emoji ||
                    ''
                  }
                  width={20}
                  height={20}
                  style={{ marginRight: 2 }}
                />
              ) : (
                <Text style={{ marginRight: 2 }} />
              )}
              <Text
                style={[
                  styles.actionText,
                  selectedReaction
                    ? {
                        color:
                          reactions.find(r => r.name === selectedReaction)
                            ?.emojiFont || '#555',
                      }
                    : {},
                ]}
              >
                {selectedReaction || (
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <ThumbsUp size="18" color="black" />
                    <Text>Like</Text>
                  </View>
                )}
              </Text>
            </TouchableOpacity>

            {showReactions && (
              <View style={styles.reactionPicker}>
                {reactions.map(reaction => (
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

          <TouchableOpacity
            onPress={() => setCommentModalVisible(true)}
            style={styles.actionButton}
          >
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
    </>
  );
};
