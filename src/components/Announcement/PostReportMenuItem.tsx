import React from 'react';
import { View, Text } from 'react-native';
import { Menu } from 'react-native-paper';
import { Flag } from 'lucide-react-native';

interface PostReportMenuItemProps {
  announcement: any;
  userData: any;
  onOpenReport: (announcement: any) => void; // 👈 lifted handler
  closeMenu: () => void;
}

export const PostReportMenuItem: React.FC<PostReportMenuItemProps> = ({
  announcement,
  userData,
  onOpenReport,
  closeMenu,
}) => {
  // Hide report option if user owns the post/repost
  const canReport =
    announcement?.reposted_by
      ? announcement?.reposted_by !== userData?.id && announcement?.repost_thought
      : announcement?.createdByUser?.id !== userData?.id;

  if (!canReport) return null;

  return (
    <Menu.Item
      onPress={() => {
        closeMenu();
        onOpenReport(announcement);
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        paddingVertical: 4,
        paddingHorizontal: 12,
      }}
      title={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Flag size={18} color="#E53935" />
          <Text style={{ fontSize: 15, color: '#E53935' }}>Report</Text>
        </View>
      }
    />
  );
};
