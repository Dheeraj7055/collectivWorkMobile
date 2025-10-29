import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Flag } from 'lucide-react-native';

interface PostReportMenuItemProps {
  announcement: any;
  userData: any;
  onOpenReport: (announcement: any) => void;
  closeMenu: () => void;
}

export const PostReportMenuItem: React.FC<PostReportMenuItemProps> = ({
  announcement,
  userData,
  onOpenReport,
  closeMenu,
}) => {
  // Hide "Report" option if it's your own post/repost
  const canReport =
    announcement?.reposted_by
      ? announcement?.reposted_by !== userData?.id && announcement?.repost_thought
      : announcement?.createdByUser?.id !== userData?.id;

  if (!canReport) return null;

  const handleReportPress = () => {
    closeMenu();
    onOpenReport(announcement);
  };

  return (
    <TouchableOpacity
      onPress={handleReportPress}
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
        <Flag size={18} color="#E53935" />
        <Text
          style={{
            fontSize: 15,
            color: '#E53935',
            fontWeight: '500',
          }}
        >
          Report
        </Text>
      </View>
    </TouchableOpacity>
  );
};

