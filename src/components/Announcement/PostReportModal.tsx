import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import AppModal from '@/common/AppModal';
import { apiClient } from '@/services/api';
import { API_ROUTES } from '@/constants/apiRoutes';
import { encodeData } from '@/utils/cryptoHelpers';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { fetchAnnouncements } from '@/redux/slices/announcementSlice';

interface PostReportModalProps {
  visible: boolean;
  onClose: () => void;
  announcement: any;
}

export const PostReportModal: React.FC<PostReportModalProps> = ({
  visible,
  onClose,
  announcement,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);

  const reportOptions = [
    "I just don't like it",
    'Bullying or unwanted contact',
    'Voilance, hate or exploitation',
    'Promoting restricted items',
    'Scam, fraud or spam',
    'False information',
    'Other',
  ];

  const handleReport = async () => {
    if (!selectedOption) return;

    setLoading(true);
    const payload = {
        announcement_id: announcement?.id,
        reason: selectedOption === 'Other' ? customReason : selectedOption,
    };

    try {
      const encoded = encodeData(payload);
      const res = await apiClient.post(API_ROUTES.REPORT_ANNOUNCEMENT, { payload: encoded });

      if (res?.success) {
        Toast.show({ type: 'success', text1: 'Post reported successfully' });
        dispatch(fetchAnnouncements({ postName: 'all', searchParam: '' }));
        onClose();
      } else {
        Toast.show({ type: 'error', text1: res?.message || 'Failed to report post' });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong while reporting',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal visible={visible} onClose={onClose}>
      <View>
        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#0E79B6' }}>
            Report Post
          </Text>
          <Text style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
            Kindly specify the reason for reporting this post
          </Text>
        </View>

        {/* Options */}
        {reportOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8,
            }}
            onPress={() => setSelectedOption(option)}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: selectedOption === option ? '#0E79B6' : '#ccc',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              {selectedOption === option && (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#0E79B6',
                  }}
                />
              )}
            </View>
            <Text style={{ color: '#333', fontSize: 15 }}>{option}</Text>
          </TouchableOpacity>
        ))}

        {/* Other Reason Input */}
        {selectedOption === 'Other' && (
          <TextInput
            placeholder="Enter the reason"
            placeholderTextColor="#999"
            multiline
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 6,
              padding: 8,
              marginTop: 10,
              minHeight: 60,
              textAlignVertical: 'top',
              color: '#000',
            }}
            value={customReason}
            onChangeText={setCustomReason}
          />
        )}

        {/* Footer Buttons */}
        <View
          style={{
            // flexDirection: 'row',
            // justifyContent: 'flex-end',
            marginTop: 20,
            gap: 10,
          }}
        >

          <TouchableOpacity
            disabled={!selectedOption || (selectedOption === 'Other' && !customReason.trim())}
            onPress={handleReport}
            style={{
              backgroundColor:
                !selectedOption || (selectedOption === 'Other' && !customReason.trim())
                  ? '#ccc'
                  : '#E53935',
              borderRadius: 6,
              padding: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff' }}>
              {loading ? 'Reporting...' : 'Report'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppModal>
  );
};
