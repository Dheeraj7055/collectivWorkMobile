import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Linking,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import {
  createLeaveComment,
  deleteLeaveComment,
  fetchLeaveComments,
  getLeaveUser,
  updateLeaveComment,
} from '@/redux/slices/leaveSlice'; // ✅ your thunk
import { leaveRequestDetailStyles as styles } from '@/styles/leaveRequestDetailStyles';
import { Eye, MoreVertical, Upload } from 'lucide-react-native';
import moment from 'moment';
import {
  capitalizeWords,
  getFullName,
  getInitials,
} from '@/common/CommonFunctions';

export const LeaveRequestDetailScreen = ({ route, navigation }: any) => {
  const { leave_id } = route.params;
  const userData = useSelector((state: RootState) => state.user.profile);
  console.log('userData', userData)
  const dispatch = useDispatch<AppDispatch>();

  const { leaveUser, isDetailLoading, leaveComments, isCommentsLoading } =
    useSelector((state: RootState) => state.leave);
  const [comment, setComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | number | null>(
    null,
  );
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>(
    {},
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [menuFor, setMenuFor] = useState<number | string | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  // const [commentTexts, setCommentTexts] = useState<Record<string | number, string>>({});

  useEffect(() => {
    if (leave_id) {
      dispatch(getLeaveUser({ leave_id }));
      dispatch(fetchLeaveComments({ leave_id }));
    }
  }, [leave_id]);

  if (isDetailLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!leaveUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No data found</Text>
      </View>
    );
  }

  const getActionUserHeading = (status?: string) => {
    if (!status) return 'Requested To';

    switch (status.toLowerCase()) {
      case 'pending':
        return 'Requested To';
      case 'approved':
        return 'Approved By';
      case 'rejected':
        return 'Rejected By';
      default:
        return 'Requested To';
    }
  };

  const getActionUserName = (leaveUser: any) => {
    if (!leaveUser?.status) return '-';

    switch (leaveUser.status.toLowerCase()) {
      case 'pending':
        return capitalizeWords(getFullName(leaveUser.userRequest));
      case 'approved':
      case 'rejected':
        return capitalizeWords(getFullName(leaveUser.statusUpdatedBy));
      case 'withdrawn':
        return capitalizeWords(getFullName(leaveUser.userRequest));
      default:
        return '-';
    }
  };

  const renderFilePreview = (fileUrl: string, index: number) => {
    const extension = fileUrl.split('.').pop()?.toLowerCase();

    if (!extension) return null;

    if (['jpg', 'jpeg', 'png'].includes(extension)) {
      return (
        <View key={index} style={styles.fileBox}>
          <Image source={{ uri: fileUrl }} style={styles.userImg} />

          {/* Eye button */}
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setPreviewUrl(fileUrl)}
          >
            <Eye size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      );
    }

    if (extension === 'pdf') {
      return (
        <View key={index} style={styles.pdfBox}>
          <Text style={styles.pdfIcon}>📄</Text>
          <Text style={styles.pdfText}>PDF</Text>

          {/* Eye button */}
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setPreviewUrl(fileUrl)}
          >
            <Eye size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const saveComment = (commentId?: string | number) => {
    if (!leave_id) return;

    if (commentId) {
      // update existing
      dispatch(
        updateLeaveComment({
          leave_id,
          leave_comment_id: commentId,
          comment: commentTexts[commentId],
        }),
      ).then(() => dispatch(fetchLeaveComments({ leave_id })));
    } else {
      // create new
      dispatch(createLeaveComment({ leave_id, comment })).then(() => {
        dispatch(fetchLeaveComments({ leave_id }));
        setComment('');
      });
    }

    setEditingComment(null);
  };

  const handleDeleteComment = (commentId: string | number) => {
    if (!leave_id) return;

    setDeletingId(commentId);

    dispatch(deleteLeaveComment({ leave_comment_id: commentId }))
      .then(() => {
        dispatch(fetchLeaveComments({ leave_id }));
        setDeletingId(null);
      })
      .catch(() => setDeletingId(null));

    setMenuFor(null);
  };

  return (
    <>
      <Modal visible={!!previewUrl} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close Button (Cross at Top-Right) */}
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => setPreviewUrl(null)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            {/* File Preview */}
            {previewUrl?.endsWith('.pdf') ? (
              <Text style={{ color: '#000' }}>
                PDF Preview not supported inline — opening externally...
              </Text>
            ) : (
              <Image
                source={{ uri: previewUrl ?? '' }}
                style={styles.previewImg}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>
              {'<'} {leaveUser?.subject}
            </Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>{leaveUser?.subject}</Text>
          <TouchableOpacity>
            <MoreVertical size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{leaveUser?.subject}</Text>

          {/* Each row */}
          <View style={styles.row}>
            <Text style={styles.label}>Leave Type</Text>
            <Text style={styles.value}>
              {leaveUser.leave_type}{' '}
              {leaveUser.short_code ? `(${leaveUser.short_code})` : ''}
            </Text>
          </View>
          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>Request Type</Text>
            <Text style={styles.value}>
              {leaveUser.no_of_days === 1 ? 'Single Day' : 'Multiple Days'}
            </Text>
          </View>
          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>
              {getActionUserHeading(leaveUser.status)}
            </Text>
            <View style={styles.requestTo}>
              {leaveUser.statusUpdatedBy?.image_url && (
                <Image
                  source={{ uri: leaveUser.statusUpdatedBy.image_url }}
                  style={styles.avatar}
                />
              )}
              <Text style={styles.value}>{getActionUserName(leaveUser)}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>No. of Days</Text>
            <Text style={styles.value}>{leaveUser.no_of_days}</Text>
          </View>
          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>From</Text>
            <Text style={styles.value}>
              {moment(leaveUser.start_date).format('DD-MMM-YYYY')}
            </Text>
          </View>
          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>To</Text>
            <Text style={styles.value}>
              {moment(leaveUser.end_date).format('DD-MMM-YYYY')}
            </Text>
          </View>
          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>Last Updated At</Text>
            <Text style={styles.value}>
              {moment(leaveUser.updated_at).format('DD/MM/YYYY HH:mm')}
            </Text>
          </View>
          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text
              style={[
                styles.value,
                {
                  color:
                    leaveUser.status === 'Approved'
                      ? 'green'
                      : leaveUser.status === 'Pending'
                      ? 'orange'
                      : 'red',
                },
              ]}
            >
              {leaveUser.status}
            </Text>
          </View>

          {/* Description */}
          {leaveUser.description ? (
            <>
              <Text style={[styles.label, { marginTop: 12 }]}>Description</Text>
              <Text style={styles.desc}>{leaveUser.description}</Text>
            </>
          ) : null}

          {/* Upload File UI */}
          <View style={styles.uploadRow}>
            {Array.isArray(leaveUser.file_document) &&
              leaveUser.file_document.map((file: any, index: number) =>
                renderFilePreview(
                  typeof file === 'string' ? file : file.url,
                  index,
                ),
              )}

            {/* Upload File Button */}
            <TouchableOpacity style={styles.uploadBox}>
              <Upload size={20} color="#666" />
              <Text style={styles.uploadText}>Upload File</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.commentsCard}>
          <Text style={styles.commentsTitle}>Comments</Text>

          {/* Add Comment */}
          {!isAdding ? (
            <TouchableOpacity
              onPress={() => setIsAdding(true)}
              style={[styles.commentInput, { justifyContent: 'center' }]}
            >
              <Text style={{ color: '#888' }}>Add a comment...</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addCommentBox}>
              <TextInput
                style={styles.commentInputExpanded}
                placeholder="Enter your comment"
                value={comment}
                onChangeText={setComment}
                multiline
                autoFocus
              />
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setIsAdding(false);
                    setComment('');
                  }}
                >
                  <Text style={{ color: '#000' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={() => {
                    saveComment(); // create new
                    setIsAdding(false);
                  }}
                  disabled={!comment.trim()}
                >
                  <Text style={{ color: '#fff' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Comments List */}
          {isCommentsLoading ? (
            <ActivityIndicator />
          ) : leaveComments.length === 0 ? (
            <Text style={{ color: '#666', fontSize: 13, marginTop: 8 }}>
              No comments yet
            </Text>
          ) : (
            leaveComments.map(c => (
              <View key={c.id} style={styles.commentRow}>
                {c?.leaveCommentCreatedBy?.image_url ? (
                  <Image
                    source={{ uri: c.leaveCommentCreatedBy.image_url }}
                    style={styles.avatar}
                  />
                ) : (
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor:
                          c?.leaveCommentCreatedBy?.profile_color || '#999',
                      },
                    ]}
                  >
                    <Text style={styles.initials}>
                      {getInitials(c?.leaveCommentCreatedBy)}
                    </Text>
                  </View>
                )}

                {/* Comment Content */}
                <View style={{ flex: 1 }}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentUser}>
                      {c.leaveCommentCreatedBy.first_name}{' '}
                      {c.leaveCommentCreatedBy.last_name}
                    </Text>
                    <TouchableOpacity onPress={() => setMenuFor(c.id)}>
                      <Text style={{ fontSize: 18 }}>⋮</Text>
                    </TouchableOpacity>
                  </View>

                  {editingComment === c.id ? (
                    <>
                      <TextInput
                        style={styles.commentInputExpanded}
                        value={commentTexts[c.id] || ''}
                        onChangeText={text =>
                          setCommentTexts(prev => ({ ...prev, [c.id]: text }))
                        }
                        multiline
                        autoFocus
                      />
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => setEditingComment(null)}
                        >
                          <Text style={{ color: '#000' }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.saveBtn}
                          onPress={() => saveComment(c.id)}
                          disabled={!commentTexts[c.id]?.trim()}
                        >
                          <Text style={{ color: '#fff' }}>Update</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.commentText}>{c.comment}</Text>
                      <Text style={styles.commentTime}>
                        {moment(c.created_at).format('DD MMM YYYY, hh:mm A')}
                      </Text>
                    </>
                  )}

                  {/* Menu options */}
                  {menuFor === c.id &&
                    c?.leaveCommentCreatedBy?.id === userData?.id && (
                      <View style={styles.menuBox}>
                        <TouchableOpacity
                          onPress={() => {
                            setEditingComment(c.id);
                            setCommentTexts(prev => ({
                              ...prev,
                              [c.id]: c.comment,
                            }));
                            setMenuFor(null);
                          }}
                        >
                          <Text style={styles.menuItem}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteComment(c.id)}
                        >
                          <Text style={[styles.menuItem, { color: 'red' }]}>
                            {deletingId === c.id ? 'Deleting...' : 'Delete'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
};
