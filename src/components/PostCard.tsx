import React, { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  TextInput,
  FlatList,
  Alert,
  ScrollView,
  Pressable,
} from 'react-native';
import Video from 'react-native-video';
import ImageViewing from 'react-native-image-viewing';
import moment from 'moment';
import { styles } from '@/styles/postCardStyles';
import Svg, { Path, Rect, SvgUri } from 'react-native-svg';
import { apiClient } from '@/services/api';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useDispatch, useSelector } from 'react-redux';
import {
  deletePostComment,
  fetchAnnouncements,
  updatePostComment,
} from '@/redux/slices/announcementSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { encodeData } from '@/utils/cryptoHelpers';
import { fetchUserData } from '@/redux/slices/userSlice';
import { Announcement, CommentItem, MediaItem } from '@/types/announcement';
import {
  Award,
  Bookmark,
  BookmarkCheck,
  Gift,
  MessageSquareText,
  Pencil,
  Repeat2,
  Star,
  ThumbsUp,
  Trash2,
} from 'lucide-react-native';
import FastImage from 'react-native-fast-image';
import PraiseTrophy from '../../assets/images/praise-trophy.svg';

import AppModal from '@/common/AppModal';
import { getFullName, getInitials } from '@/common/CommonFunctions';
import Toast from 'react-native-toast-message';
import { Menu } from 'react-native-paper';
import { useRepostHandler } from '@/hooks/useRepostHandler';
import { PostRepostModal } from './Announcement/PostRepostModal';
import { PostPinMenuItem } from './Announcement/PostPinMenuItem';
import { PostReportMenuItem } from './Announcement/PostReportMenuItem';
import { PostReportModal } from './Announcement/PostReportModal';
import EmojiPicker from 'rn-emoji-keyboard';
import { EditPostModal } from './Announcement/EditPostModal';

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
  const repost_thought = announcement?.repost_thought;
  const content = announcement.description;
  const images = announcement.document_urls || [];
  const likes = announcement.total_likes;
  const comments = announcement.total_comments;
  const profileImage = announcement.createdByUser?.image_url;
  const profileColor = announcement.createdByUser?.profile_color || '#999';

  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [postComments, setPostComments] = useState(
    announcement?.Comments || [],
  );
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>('');
  const [showReactionsFor, setShowReactionsFor] = useState<
    string | number | null
  >(null);
  const [commentPayload, setCommentPayload] = useState<any>(null);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [currentReactionAnnouncement, setCurrentReactionAnnouncement] =
    useState<any>(null);
  const [selectedReactionTab, setSelectedReactionTab] = useState<
    'all' | string
  >('all');
  const [visibleMenuId, setVisibleMenuId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editRepostThought, setEditRepostThought] = useState('');
  const [editPollQuestion, setEditPollQuestion] = useState('');
  const [editPollOptions, setEditPollOptions] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);


  // validation errors
  const [editErrors, setEditErrors] = useState<{
    subject?: string;
    description?: string;
    repostThought?: string;
    pollQuestion?: string;
    pollOption?: string;
  }>({});

  const handleEmojiSelect = (emojiObject: any) => {
    setNewComment(prev => prev + emojiObject.emoji);
  };

  const handleOpenReportModal = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setShowReportModal(true);
  };
  const { pinnedUsers } = useSelector(
    (state: RootState) => state.announcements,
  );
  const {
    showRepostModal,
    currentAnnouncement,
    openRepostModal,
    closeRepostModal,
    handleRepost,
  } = useRepostHandler();

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

      if (response?.data && response?.success) {
        const newEntry: CommentItem = {
          id: response?.data?.id,
          comment: newComment,
          created_at: response?.data?.created_at,
          updated_at: response?.data?.updated_at,
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

  const handleReactionModal = (announcement: any) => {
    if (announcement?.AnnouncementLikes?.length > 0) {
      setCurrentReactionAnnouncement(announcement);
      setShowReactionModal(true);
    }
  };

  const seedEditFormFromAnnouncement = (ann: any) => {
    // reset errors
    setEditErrors({});

    if (ann.reposted_by) {
      // repost edit (only thought)
      setEditRepostThought(ann.repost_thought ?? '');
    } else if (ann.type === 'poll') {
      setEditPollQuestion(ann.question ?? '');
      setEditPollOptions(
        ann.options && Array.isArray(ann.options) ? ann.options : [],
      );
    } else {
      // normal post
      setEditSubject(ann.subject ?? '');
      setEditDescription(ann.description ?? '');
    }
  };


  const toggleMenu = useCallback(() => {
    setMenuVisible(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  // Start editing a comment
  const handleStartEdit = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditedText(comment.comment);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedText('');
  };

  // Save edited comment
  const handleSaveEdit = async (commentId: string | number) => {
    if (!editedText.trim()) return;

    const result = await dispatch(
      updatePostComment({
        comment_id: commentId,
        comment: editedText.trim(),
      }),
    );

    if (updatePostComment.fulfilled.match(result)) {
      Toast.show({ type: 'success', text1: 'Comment updated' });
      setEditingCommentId(null);
      setEditedText('');
    } else {
      Toast.show({ type: 'error', text1: 'Failed to update comment' });
    }
  };

  const handleDeleteComment = async (comment: any) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await dispatch(
              deletePostComment({ comment_id: comment.id }),
            );

            if (deletePostComment.fulfilled.match(result)) {
              setPostComments(prev => prev.filter(c => c.id !== comment.id));
            } else {
              Toast.show({
                type: 'error',
                text1: 'Failed to delete comment',
              });
            }
          },
        },
      ],
    );
  };

  const handleCommentLikeColor = (comment: any) => {
    const myLike = comment?.CommentLikes?.find(
      (l: any) => l.liked_by === userData?.id,
    );
    if (myLike && myLike.reactions) {
      const reactionColor =
        reactions.find(
          r => r.name.toLowerCase() === myLike.reactions.toLowerCase(),
        )?.emojiFont || '#0E79B6';
      return reactionColor;
    }
    return '#00000099';
  };

  const handleCommentLike = async (commentItem: any, announcement: any) => {
    const isLiked = commentItem?.CommentLikes?.find(
      (l: any) => l.liked_by === userData?.id,
    );

    const payload = isLiked
      ? {
          announcement_id: announcement.id,
          comment_id: commentItem.id,
          reactions: '', // remove
        }
      : {
          announcement_id: announcement.id,
          comment_id: commentItem.id,
          reactions: 'Like', // add
        };

    if (
      commentPayload &&
      JSON.stringify(payload) === JSON.stringify(commentPayload)
    )
      return;

    setCommentPayload(payload);

    try {
      const encoded = encodeData(payload);
      const res = await apiClient.post(API_ROUTES.COMMENTS_LIKE, {
        payload: encoded,
      });

      if (res?.success) {
        setPostComments(prev =>
          prev.map(c => {
            if (c.id !== commentItem.id) return c;

            const updatedLikes = (c.CommentLikes || []).filter(
              l => l.liked_by !== userData?.id,
            );
            if (!isLiked) {
              updatedLikes.push({ liked_by: userData?.id, reactions: 'Like' });
            }

            // Preserve previous counts and update only your reaction
            const updatedReactionsCount = { ...(c.reactions_count || {}) };

            // If removing like
            if (isLiked) {
              const prevReaction = isLiked.reactions || 'Like';
              if (updatedReactionsCount[prevReaction] > 1)
                updatedReactionsCount[prevReaction] -= 1;
              else delete updatedReactionsCount[prevReaction];
            }
            // If adding like
            else {
              updatedReactionsCount['Like'] =
                (updatedReactionsCount['Like'] || 0) + 1;
            }

            return {
              ...c,
              CommentLikes: updatedLikes,
              reactions_count: updatedReactionsCount,
            };
          }),
        );

        setShowReactionsFor(null);
        Toast.show({ type: 'success', text1: 'Reaction updated successfully' });
      } else {
        Toast.show({
          type: 'error',
          text1: res.message || 'Failed to update reaction',
        });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Something went wrong' });
    }
  };

  const handleCommentEmojiClick = async (
    reaction: any,
    commentItem: any,
    announcement: any,
  ) => {
    const payload = {
      announcement_id: announcement.id,
      comment_id: commentItem.id,
      reactions: reaction.name,
    };

    if (
      commentPayload &&
      JSON.stringify(payload) === JSON.stringify(commentPayload)
    )
      return;

    setCommentPayload(payload);

    try {
      const encoded = encodeData(payload);
      const res = await apiClient.post(API_ROUTES.COMMENTS_LIKE, {
        payload: encoded,
      });

      if (res?.success) {
        setPostComments(prev =>
          prev.map(c => {
            if (c.id !== commentItem.id) return c;

            const updatedLikes = (c.CommentLikes || []).filter(
              l => l.liked_by !== userData?.id,
            );
            updatedLikes.push({
              liked_by: userData?.id,
              reactions: reaction.name,
            });

            // ✅ Preserve all others' counts
            const updatedReactionsCount = { ...(c.reactions_count || {}) };

            // Find previous reaction of current user
            const prevReaction = c.CommentLikes?.find(
              l => l.liked_by === userData?.id,
            )?.reactions;

            // Decrease old reaction count
            if (prevReaction && updatedReactionsCount[prevReaction]) {
              updatedReactionsCount[prevReaction] -= 1;
              if (updatedReactionsCount[prevReaction] <= 0)
                delete updatedReactionsCount[prevReaction];
            }

            // Increase new one
            updatedReactionsCount[reaction.name] =
              (updatedReactionsCount[reaction.name] || 0) + 1;

            return {
              ...c,
              CommentLikes: updatedLikes,
              reactions_count: updatedReactionsCount,
            };
          }),
        );

        setShowReactionsFor(null);
        Toast.show({ type: 'success', text1: 'Reaction updated successfully' });
      } else {
        Toast.show({
          type: 'error',
          text1: res.message || 'Failed to update reaction',
        });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Something went wrong' });
    }
  };

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

  const groupReactionsByType = (reactions: any[]) => {
    const grouped: Record<string, any[]> = {};
    reactions.forEach(r => {
      const type = r?.reaction_name || 'Like';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(r);
    });
    return grouped;
  };

  const getReactionEmoji = (type: string) => {
    const matched = reactions.find(r => r.name === type);
    return (
      matched?.emoji ||
      'https://hr-screening.s3.ap-south-1.amazonaws.com/test%20open%20files%20upload/likedIcon.svg_1740128322035'
    );
  };

  const handleBookmark = async (announcement: any) => {
    const payload = { announcement_id: announcement?.id };
    const encoded = encodeData(payload);

    try {
      const isBookmarked = announcement?.bookmarked_by_user_ids?.includes(
        userData?.id,
      );

      const endpoint = isBookmarked
        ? API_ROUTES.REMOVE_BOOKMARK_POST
        : API_ROUTES.BOOKMARK_POST;
      const res = await apiClient.put(endpoint, { payload: encoded });

      if (res?.success) {
        Toast.show({
          type: 'success',
          text1: isBookmarked ? 'Bookmark removed' : 'Post bookmarked',
        });

        dispatch(fetchAnnouncements({ postName: 'all', searchParam: '' }));

        closeMenu();
      } else {
        Toast.show({
          type: 'error',
          text1: res?.data?.message || 'Failed to update bookmark',
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error updating bookmark',
      });
    }
  };

  // Delete Post / Repost API
  const handleDelete = async () => {
    try {
      const payload = { announcement_id: announcement?.id };
      const encoded = encodeData(payload);
      const res = await apiClient.post(API_ROUTES.ANNOUNCEMENT_DELETE, {
        payload: encoded,
      });

      if (res?.success) {
        Toast.show({
          type: 'success',
          text1:
            announcement?.reposted_by === userData?.id
              ? 'Repost deleted successfully'
              : 'Post deleted successfully',
        });

        dispatch(fetchAnnouncements({ postName: 'all', searchParam: '' }));
      } else {
        Toast.show({
          type: 'error',
          text1: res?.message || 'Failed to delete post',
        });
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong while deleting',
      });
    } finally {
      setShowDeleteModal(false);
      closeMenu();
    }
  };

  const canDelete = announcement?.reposted_by
    ? announcement?.reposted_by === userData?.id
    : announcement?.createdByUser?.id === userData?.id;

  const handleEditPress = (ann: any) => {
    // grab original values and preload into edit state
    seedEditFormFromAnnouncement(ann);
    setSelectedAnnouncement(ann);
    setShowEditModal(true);
    closeMenu();
  };

  const onChangePollOption = (idx: number, txt: string) => {
    setEditPollOptions(prev => {
      const clone = [...prev];
      clone[idx] = txt;
      return clone;
    });
  };

  const onRemovePollOption = (idx: number) => {
    setEditPollOptions(prev => prev.filter((_, i) => i !== idx));
  };

  const onAddPollOption = () => {
    setEditPollOptions(prev => [...prev, '']);
  };

  const handleConfirmUpdate = async () => {
    const newErrors: any = {};

    if (selectedAnnouncement?.reposted_by) {
      // editing a repost: must have repost thought
      if (!editRepostThought || !editRepostThought.trim()) {
        newErrors.repostThought = 'Repost thought is required';
      }
    } else if (selectedAnnouncement?.type === 'poll') {
      // editing a poll: question + all options required
      if (!editPollQuestion || !editPollQuestion.trim()) {
        newErrors.pollQuestion = 'Poll question is required';
      }
      const emptyIdx = editPollOptions.findIndex(opt => !opt || !opt.trim());
      if (emptyIdx !== -1) {
        newErrors.pollOption = 'Poll options cannot be empty.';
      }
    } else {
      // normal post: subject + description
      const trimmedSubj = editSubject ? editSubject.trim() : '';
      const trimmedDesc = editDescription ? editDescription.trim() : '';

      if (!trimmedSubj) {
        newErrors.subject = 'Subject is required';
      } else if (trimmedSubj.length > 200) {
        newErrors.subject = 'Subject cannot exceed 200 characters';
      }

      if (!trimmedDesc) {
        newErrors.description = 'Description is required';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      return;
    }

    const payload = {
      announcement_id: selectedAnnouncement?.id,
      notification_level: selectedAnnouncement?.notification_level,
      schedule_announcement: selectedAnnouncement?.created_at,

      subject:
        selectedAnnouncement?.type === 'poll'
          ? null
          : editSubject?.trim() || null,

      type: selectedAnnouncement?.type,

      description:
        selectedAnnouncement?.type === 'poll'
          ? null
          : editDescription?.trim() || null,

      options: selectedAnnouncement?.type === 'poll' ? editPollOptions : null,

      question:
        selectedAnnouncement?.type === 'poll'
          ? editPollQuestion?.trim() || null
          : null,

      status: 'Active',

      repost_thought: selectedAnnouncement?.reposted_by
        ? editRepostThought?.trim() || null
        : null,

      is_edited: true,
    };

    const encoded = encodeData(payload);

    try {
      const res = await apiClient.put(API_ROUTES.UPDATE_ANNOUNCEMENT, {
        payload: encoded,
      });

      if (res?.success) {
        Toast.show({
          type: 'success',
          text1: 'Post updated',
        });

        // refresh feed
        dispatch(fetchAnnouncements({ postName: 'all', searchParam: '' }));

        setShowEditModal(false);

        setEditErrors({});
      } else {
        Toast.show({
          type: 'error',
          text1: res?.data?.message || 'Failed to update post',
        });
      }
    } catch (err: any) {
      // request failed
      Toast.show({
        type: 'error',
        text1: 'Error updating post',
      });
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
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Comments</Text>
          <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Comment List */}
        <FlatList
          data={postComments}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => {
            const isEditing = editingCommentId === item.id;
            const isUserComment = item?.User?.id === userData?.id;
            return (
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

                {/* Body */}
                <View style={styles.commentBody}>
                  {/* Header */}
                  <View
                    style={[styles.commentHeader, { alignItems: 'center' }]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.commentName}>
                        {item.User?.first_name} {item.User?.last_name}
                      </Text>
                    </View>

                    {/* Time + Edit Button */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Text style={styles.commentTime}>
                        {item.updated_at
                          ? moment(item.updated_at).fromNow()
                          : 'now'}
                      </Text>
                    </View>
                  </View>

                  {/* Comment Text or Edit Mode */}
                  {isEditing ? (
                    <>
                      <TextInput
                        style={styles.editInput}
                        value={editedText}
                        onChangeText={setEditedText}
                        placeholder="Edit your comment..."
                        placeholderTextColor="#888"
                        multiline
                      />

                      <View style={styles.editActions}>
                        <TouchableOpacity
                          style={[
                            styles.saveBtn,
                            !editedText.trim() && styles.disabledSendButton,
                          ]}
                          disabled={!editedText.trim()}
                          onPress={() => handleSaveEdit(item.id)}
                        >
                          <Text style={styles.confirmText}>Save</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={handleCancelEdit}
                        >
                          <Text style={styles.confirmText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.commentText}>{item.comment}</Text>
                  )}

                  {/* Footer */}
                  <View style={styles.commentFooter}>
                    {/* 🔹 Like Button */}
                    <TouchableOpacity
                      onPress={() => handleCommentLike(item, announcement)}
                      onLongPress={() => setShowReactionsFor(Number(item.id))}
                      delayLongPress={250}
                    >
                      <Text
                        style={[
                          styles.commentAction,
                          { color: handleCommentLikeColor(item) },
                        ]}
                      >
                        Like
                      </Text>
                    </TouchableOpacity>

                    {item.reactions_count &&
                      Object.keys(item.reactions_count).length > 0 && (
                        <View style={styles.reactionsContainer}>
                          {Object.entries(item.reactions_count).map(
                            ([emojiName, likedByCount], index) => {
                              const matchedReaction = reactions.find(
                                r =>
                                  r.name.toLowerCase() ===
                                  emojiName.toLowerCase(),
                              );
                              return (
                                <View
                                  key={index}
                                  style={styles.reactionCountItem}
                                >
                                  {matchedReaction && (
                                    <SvgUri
                                      uri={matchedReaction.emoji}
                                      width={16}
                                      height={16}
                                    />
                                  )}
                                  <Text style={styles.reactionCountText}>
                                    {likedByCount}
                                  </Text>
                                </View>
                              );
                            },
                          )}
                        </View>
                      )}

                    {/* Reaction Picker (on long press) */}
                    {showReactionsFor === item.id && (
                      <View style={styles.reactionPicker}>
                        {reactions.map(reaction => (
                          <TouchableOpacity
                            key={reaction.name}
                            onPress={() =>
                              handleCommentEmojiClick(
                                reaction,
                                item,
                                announcement,
                              )
                            }
                          >
                            <SvgUri
                              uri={reaction.emoji}
                              width={24}
                              height={24}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {/* 🔹 Edit / Delete Buttons for User’s Own Comment */}
                    {isUserComment && !isEditing && (
                      <>
                        <TouchableOpacity onPress={() => handleStartEdit(item)}>
                          <Text style={styles.commentAction}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleDeleteComment(item)}
                        >
                          <Text
                            style={[styles.commentAction, { color: 'red' }]}
                          >
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
          style={styles.commentListBlock}
        />

        {/* Comment Input Box */}
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

            {/* <TouchableOpacity onPress={() => setIsEmojiPickerOpen(true)}>
              <Text style={{ fontSize: 20, marginRight: 6 }}>😊</Text>
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Footer Button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            !newComment.trim() && styles.disabledSendButton,
          ]}
          disabled={!newComment.trim()}
          onPress={handleSendComment}
        >
          <Text style={styles.confirmText}>Comment</Text>
        </TouchableOpacity>
      </AppModal>

      <AppModal
        visible={showReactionModal}
        onClose={() => setShowReactionModal(false)}
      >
        <View>
          {/* Header */}
          <Text style={styles.modalTitle}>Reactions</Text>

          {/* Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexDirection: 'row', marginVertical: 10 }}
          >
            <TouchableOpacity
              style={[
                styles.tabButton,
                selectedReactionTab === 'all' && styles.tabButtonActive,
              ]}
              onPress={() => setSelectedReactionTab('all')}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedReactionTab === 'all' && styles.tabTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            {Object.keys(
              groupReactionsByType(
                currentReactionAnnouncement?.AnnouncementLikes || [],
              ),
            ).map(reactionType => (
              <TouchableOpacity
                key={reactionType}
                style={[
                  styles.tabButton,
                  selectedReactionTab === reactionType &&
                    styles.tabButtonActive,
                ]}
                onPress={() => setSelectedReactionTab(reactionType)}
              >
                <SvgUri
                  uri={getReactionEmoji(reactionType)}
                  width={20}
                  height={20}
                />
                <Text
                  style={[
                    styles.imageTabText,
                    selectedReactionTab === reactionType &&
                      styles.tabTextActive,
                  ]}
                >
                  {reactionType}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Reaction List */}
          <ScrollView style={{ maxHeight: 400 }}>
            {(selectedReactionTab === 'all'
              ? currentReactionAnnouncement?.AnnouncementLikes || []
              : groupReactionsByType(
                  currentReactionAnnouncement?.AnnouncementLikes || [],
                )[selectedReactionTab] || []
            ).map((reaction: any) => (
              <View
                key={reaction.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 8,
                }}
              >
                {/* Profile */}
                {reaction?.User?.image_url ? (
                  <Image
                    source={{ uri: reaction?.User?.image_url }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View
                    style={[
                      styles.avatarPlaceholder,
                      {
                        backgroundColor:
                          reaction?.User?.profile_color || '#ccc',
                      },
                    ]}
                  >
                    <Text style={styles.avatarText}>
                      {getInitials(reaction?.User)}
                    </Text>
                  </View>
                )}

                {/* Name + Designation */}
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.userName}>
                    {reaction?.User ? getFullName(reaction?.User) : '-'}
                  </Text>
                  <Text style={styles.userDesignation}>
                    {reaction?.User?.client_name
                      ? `at ${reaction.User.client_name}`
                      : ''}
                  </Text>
                </View>

                {/* Reaction Icon */}
                <SvgUri
                  uri={getReactionEmoji(reaction?.reaction_name)}
                  width={18}
                  height={18}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </AppModal>

      <AppModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      >
        <View>
          <View style={styles.iconGeneralCircle}>
            <Trash2 size="20" color="#0E79B6" />
          </View>
          <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 10 }}>
            {announcement?.reposted_by === userData?.id
              ? 'Delete Repost'
              : 'Delete Post'}
          </Text>
          <Text style={{ fontSize: 14, color: '#666' }}>
            {announcement?.reposted_by === userData?.id
              ? 'Are you sure you want to delete this repost?'
              : 'Are you sure you want to delete this post?'}
          </Text>

          <TouchableOpacity
            onPress={handleDelete}
            style={{
              backgroundColor: '#E53935',
              borderRadius: 6,
              paddingVertical: 10,
              paddingHorizontal: 24,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 16,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </AppModal>

      <EditPostModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        announcement={selectedAnnouncement}
        editSubject={editSubject}
        setEditSubject={setEditSubject}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        editRepostThought={editRepostThought}
        setEditRepostThought={setEditRepostThought}
        editPollQuestion={editPollQuestion}
        setEditPollQuestion={setEditPollQuestion}
        editPollOptions={editPollOptions}
        setEditPollOptions={setEditPollOptions}
        editErrors={editErrors}
        onRemovePollOption={onRemovePollOption}
        onChangePollOption={onChangePollOption}
        onAddPollOption={onAddPollOption}
        onConfirmUpdate={handleConfirmUpdate}
      />

      <View key={id} style={styles.card}>
        {/* Header */}
        {/* Show Reposted Header (if reposted) */}
        {announcement?.reposted_by && (
          <>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              {/* Reposted user */}
              <TouchableOpacity>
                <Text style={[styles.name, { fontSize: 13 }]}>
                  {announcement?.repostedByUser?.id === userData?.id
                    ? 'You'
                    : `${announcement?.repostedByUser?.first_name || ''} ${
                        announcement?.repostedByUser?.last_name || ''
                      }`}
                </Text>
              </TouchableOpacity>

              <Text style={{ marginLeft: 4, fontSize: 12, color: '#666' }}>
                reposted this
              </Text>
            </View>

            {/* Line separator */}
            <View
              style={{
                height: 1,
                backgroundColor: '#E0E0E0',
                marginBottom: 8,
                marginTop: 5,
              }}
            />

            {repost_thought ? (
              <Text style={styles.repostedTitle}>{repost_thought}</Text>
            ) : (
              ''
            )}
          </>
        )}

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
              {/* Case 1: Normal post */}
              <TouchableOpacity>
                <Text style={styles.name}>
                  {`${announcement?.createdByUser?.first_name || ''} ${
                    announcement?.createdByUser?.last_name || ''
                  }`}
                </Text>
              </TouchableOpacity>

              {/* Case 2: Praised user */}
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

            {/* Date + Edited Flag */}
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
          <View style={{ position: 'relative' }}>
            {/* ⋮ button */}
            <TouchableOpacity
              onPress={toggleMenu}
              style={{ padding: 4, alignSelf: 'flex-end' }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={{ fontSize: 20 }}>⋮</Text>
            </TouchableOpacity>

            {/* overlay tap area to close menu when clicking outside */}
            {menuVisible && (
              <Pressable
                onPress={closeMenu}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  // transparent overlay to capture outside taps
                  backgroundColor: 'transparent',
                }}
              />
            )}

            {/* the dropdown menu card */}
            {menuVisible && (
              <View
                style={{
                  position: 'absolute',
                  right: 8,
                  top: 28, // a bit below the ⋮ button
                  width: 180,
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  paddingVertical: 4,
                  shadowColor: '#000',
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 6,
                  zIndex: 1000,
                }}
              >
                {/* 🔹 Bookmark */}
                <TouchableOpacity
                  onPress={() => {
                    closeMenu();
                    handleBookmark(announcement);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 44,
                    paddingVertical: 4,
                    paddingHorizontal: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {announcement?.bookmarked_by_user_ids?.includes(
                      userData?.id,
                    ) ? (
                      <Bookmark size={18} color="#007AFF" />
                    ) : (
                      <BookmarkCheck size={18} color="#333" />
                    )}
                    <Text
                      style={{
                        fontSize: 15,
                        color: announcement?.bookmarked_by_user_ids?.includes(
                          userData?.id,
                        )
                          ? '#007AFF'
                          : '#333',
                      }}
                    >
                      {announcement?.bookmarked_by_user_ids?.includes(
                        userData?.id,
                      )
                        ? 'Bookmarked'
                        : 'Bookmark'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 🔹 Edit */}
                {canDelete && (
                  <TouchableOpacity
                    onPress={() => {
                      closeMenu();
                      handleEditPress(announcement);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      height: 44,
                      paddingVertical: 4,
                      paddingHorizontal: 12,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Pencil size={18} color="#333" />
                      <Text style={{ fontSize: 15, color: '#333' }}>
                        Edit Post
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* 🔹 Delete */}
                {canDelete && (
                  <TouchableOpacity
                    onPress={() => {
                      closeMenu();
                      setShowDeleteModal(true);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      height: 44,
                      paddingVertical: 4,
                      paddingHorizontal: 12,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Trash2 size={18} color="#E53935" />
                      <Text style={{ fontSize: 15, color: '#E53935' }}>
                        {announcement?.reposted_by === userData?.id
                          ? 'Delete Repost'
                          : 'Delete Post'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* 🔹 Pin / Unpin */}
                <PostPinMenuItem
                  announcement={announcement}
                  userData={userData}
                  pinnedUserList={pinnedUsers}
                  closeMenu={closeMenu}
                />

                {/* 🔹 Report */}
                <PostReportMenuItem
                  announcement={announcement}
                  userData={userData}
                  closeMenu={closeMenu}
                  onOpenReport={handleOpenReportModal}
                />
              </View>
            )}
          </View>
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
                  <Path
                    d="M26.0945 52.0416L21.0855 69.9999L14.8202 62.7222L5.69264 65.7065L10.7017 47.7481C11.0812 46.3873 11.9858 45.233 13.2165 44.5392C14.4471 43.8453 15.903 43.6688 17.2638 44.0483L22.3947 45.4795C23.7555 45.859 24.9098 46.7636 25.6037 47.9943C26.2975 49.2249 26.4741 50.6808 26.0945 52.0416Z"
                    stroke={announcement?.Badge?.color || '#F9A80A'}
                    strokeWidth={1.86438}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M43.8241 47.7423L48.8346 65.7002L39.7068 62.7168L33.4421 69.995L28.4316 52.0371C28.0519 50.6763 28.2283 49.2204 28.9221 47.9897C29.6158 46.759 30.77 45.8543 32.1308 45.4747L37.2617 44.0431C38.6224 43.6634 40.0783 43.8398 41.309 44.5336C42.5397 45.2273 43.4444 46.3815 43.8241 47.7423Z"
                    stroke={announcement?.Badge?.color || '#F9A80A'}
                    strokeWidth={1.86438}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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
                <TouchableOpacity
                  onPress={() => handleReactionModal(announcement)}
                >
                  <Text style={styles.footerText}>
                    {announcement?.AnnouncementLikes?.find(
                      item => item.liked_by === userData?.id,
                    )
                      ? 'You'
                      : announcement?.AnnouncementLikes?.[0]?.User
                          ?.first_name || 'Someone'}
                    {totalReactions === 1
                      ? ''
                      : ` and ${totalReactions - 1} ${
                          totalReactions - 1 === 1 ? 'other' : 'others'
                        }`}
                  </Text>
                </TouchableOpacity>
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
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 6,
                      alignItems: 'center',
                    }}
                  >
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
            <View
              style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}
            >
              <MessageSquareText size="18" color="black" />
              <Text>Comment</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openRepostModal(announcement)}
          >
            <View
              style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}
            >
              <Repeat2 size="18" color="black" />
              <Text>Repost</Text>
            </View>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Send</Text>
          </TouchableOpacity> */}
        </View>
      </View>

      <PostRepostModal
        visible={showRepostModal}
        onClose={closeRepostModal}
        userData={userData}
        announcement={currentAnnouncement}
        onSubmit={handleRepost}
      />

      <PostReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        announcement={selectedAnnouncement}
      />

      {/* Emoji picker */}
      {isEmojiPickerOpen && (
        <View style={{ height: 280 }}>
          <EmojiPicker
            onEmojiSelected={handleEmojiSelect}
            open={isEmojiPickerOpen}
            onClose={() => setIsEmojiPickerOpen(false)}
          />
        </View>
      )}
      {/* {isEmojiPickerOpen && (
        <EmojiPicker
          onEmojiSelected={handleEmojiSelect}
          open={isEmojiPickerOpen}
          onClose={() => setIsEmojiPickerOpen(false)}
          expandable
          enableSearchBar={false}
        />
      )} */}
    </>
  );
};
