import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; // only if you want schedule editing later
import { Modal } from 'react-native'; // or your AppModal wrapper
import { Trash } from 'lucide-react-native'; // Pencil etc.

type EditPostModalProps = {
  visible: boolean;
  onClose: () => void;
  announcement: any | null;

  // normal post
  editSubject: string;
  setEditSubject: (s: string) => void;
  editDescription: string;
  setEditDescription: (s: string) => void;

  // repost
  editRepostThought: string;
  setEditRepostThought: (s: string) => void;

  // poll
  editPollQuestion: string;
  setEditPollQuestion: (s: string) => void;
  editPollOptions: string[];
  setEditPollOptions: (opts: string[]) => void;

  editErrors: {
    subject?: string;
    description?: string;
    repostThought?: string;
    pollQuestion?: string;
    pollOption?: string;
  };

  onRemovePollOption: (idx: number) => void;
  onChangePollOption: (idx: number, txt: string) => void;
  onAddPollOption: () => void;

  onConfirmUpdate: () => void;
};

export const EditPostModal: React.FC<EditPostModalProps> = ({
  visible,
  onClose,
  announcement,

  editSubject,
  setEditSubject,
  editDescription,
  setEditDescription,

  editRepostThought,
  setEditRepostThought,

  editPollQuestion,
  setEditPollQuestion,
  editPollOptions,
  setEditPollOptions,

  editErrors,

  onRemovePollOption,
  onChangePollOption,
  onAddPollOption,

  onConfirmUpdate,
}) => {
  if (!announcement) return null;

  const isRepost = !!announcement.reposted_by;
  const isPoll = announcement.type === 'poll';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 16,
            maxHeight: '90%',
          }}
        >
          {/* Header */}
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
            Edit Post
          </Text>
          <Text style={{ color: '#666', marginBottom: 16 }}>
            Update your post details below
          </Text>

          <ScrollView style={{ maxHeight: '70%' }}>
            {/* REPOST EDIT: only "Your Thoughts" */}
            {isRepost && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontWeight: '500', marginBottom: 6 }}>
                  Share your thoughts
                  <Text style={{ color: 'red' }}> *</Text>
                </Text>

                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    minHeight: 80,
                    textAlignVertical: 'top',
                  }}
                  multiline
                  value={editRepostThought}
                  onChangeText={setEditRepostThought}
                  placeholder="Write something..."
                />

                {editErrors.repostThought ? (
                  <Text style={{ color: '#E02D3C', marginTop: 4 }}>
                    {editErrors.repostThought}
                  </Text>
                ) : null}

                {/* (Optional) preview of original post below if you want to mimic web */}
              </View>
            )}

            {/* POLL EDIT */}
            {isPoll && !isRepost && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontWeight: '500', marginBottom: 6 }}>
                  Question<Text style={{ color: 'red' }}> *</Text>
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                  }}
                  value={editPollQuestion}
                  onChangeText={setEditPollQuestion}
                  placeholder="Ask something"
                />
                {editErrors.pollQuestion ? (
                  <Text style={{ color: '#E02D3C', marginTop: 4 }}>
                    {editErrors.pollQuestion}
                  </Text>
                ) : null}

                <Text
                  style={{
                    fontWeight: '500',
                    marginTop: 16,
                    marginBottom: 6,
                  }}
                >
                  Options<Text style={{ color: 'red' }}> *</Text>
                </Text>

                {editPollOptions.map((opt, idx) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        width: 28,
                        fontWeight: '500',
                      }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </Text>

                    <TextInput
                      style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                      }}
                      placeholder="Enter option"
                      value={opt}
                      onChangeText={txt => onChangePollOption(idx, txt)}
                    />

                    {editPollOptions.length > 2 && (
                      <TouchableOpacity
                        style={{ marginLeft: 8, padding: 4 }}
                        onPress={() => onRemovePollOption(idx)}
                      >
                        <Trash size={18} color="red" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {editErrors.pollOption ? (
                  <Text style={{ color: '#E02D3C', marginBottom: 8 }}>
                    {editErrors.pollOption}
                  </Text>
                ) : null}

                <TouchableOpacity onPress={onAddPollOption}>
                  <Text style={{ color: '#0E79B6', fontWeight: '500' }}>
                    + Add new option
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* NORMAL POST EDIT */}
            {!isPoll && !isRepost && (
              <>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontWeight: '500', marginBottom: 6 }}>
                    Subject<Text style={{ color: 'red' }}> *</Text>
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                    }}
                    value={editSubject}
                    onChangeText={setEditSubject}
                    placeholder="Enter subject"
                    maxLength={200}
                  />
                  {editErrors.subject ? (
                    <Text style={{ color: '#E02D3C', marginTop: 4 }}>
                      {editErrors.subject}
                    </Text>
                  ) : null}
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontWeight: '500', marginBottom: 6 }}>
                    Description<Text style={{ color: 'red' }}> *</Text>
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      minHeight: 100,
                      textAlignVertical: 'top',
                    }}
                    value={editDescription}
                    onChangeText={setEditDescription}
                    placeholder="Enter description"
                    multiline
                  />
                  {editErrors.description ? (
                    <Text style={{ color: '#E02D3C', marginTop: 4 }}>
                      {editErrors.description}
                    </Text>
                  ) : null}
                </View>
              </>
            )}
          </ScrollView>

          {/* footer buttons */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginTop: 16,
              gap: 12,
            }}
          >
            <TouchableOpacity
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#ccc',
              }}
              onPress={onClose}
            >
              <Text style={{ color: '#333', fontWeight: '500' }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: '#0E79B6',
              }}
              onPress={onConfirmUpdate}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
