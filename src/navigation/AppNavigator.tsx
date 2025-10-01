import React, { useMemo } from 'react';
import {
  createStackNavigator,
  StackScreenProps,
} from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Image, View } from 'react-native';
import {
  getFocusedRouteNameFromRoute,
  RouteProp,
  useNavigationState,
} from '@react-navigation/native';

import { PostScreen } from '@/screens/PostScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { AttendanceScreen } from '@/screens/AttendanceScreen';
import { LeaveScreen } from '@/screens/LeaveScreen';
import { BookmarkScreen } from '@/screens/BookmarkScreen';
import { LeaveRequestDetailScreen } from '@/screens/LeaveRequestDetailScreen';
import { Header } from '@/components/Header';
import useLiveLocation from '@/hooks/useLiveLocation';

const ChatScreen = () => <Text>Chat Screen</Text>;

export type MainTabParamList = {
  Post: undefined;
  Chat: undefined;
  Attendance: undefined;
  Leave: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  Bookmarks: undefined;
  LeaveRequestDetail: { leave_id: string | number };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<AppStackParamList>();

// 🔹 Title map
const titleMap: Record<string, string> = {
  Post: 'Posts',
  Attendance: 'Attendance',
  Leave: 'Leave',
  Chat: 'Chat',
  Profile: 'My Profile',
  Bookmarks: 'Bookmarks',
  LeaveRequestDetail: 'Leave Details',
};

export const ScreenWithHeader = ({
  route,
  children,
}: {
  route: RouteProp<any, any>;
  children: React.ReactNode;
}) => {
  // Always recalc based on nav state
  const navState = useNavigationState((state) => state);
  let routeName: string;

  if (route.name === "MainTabs") {
    // get current tab inside MainTabs
    const focused = getFocusedRouteNameFromRoute(route) ?? "Post";

    routeName = focused;
  } else {
    routeName = route.name;
  }

  return (
    <View style={{ flex: 1 }}>
      <Header title={titleMap[routeName] || routeName} />
      {children}
    </View>
  );
};

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#757575',
        tabBarIcon: ({ color, size }) => {
          let icon;
          switch (route.name) {
            case 'Post':
              icon = require('../../assets/icons/post.png');
              break;
            case 'Attendance':
              icon = require('../../assets/icons/attendance.png');
              break;
            case 'Leave':
              icon = require('../../assets/icons/clock.png');
              break;
            case 'Chat':
              icon = require('../../assets/icons/chat.png');
              break;
            case 'Profile':
              icon = require('../../assets/icons/user.png');
              break;
            default:
              icon = require('../../assets/icons/post.png');
          }
          return (
            <Image
              source={icon}
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          );
        },
      })}
    >
      <Tab.Screen name="Post" component={PostScreen} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="Leave" component={LeaveScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  useLiveLocation();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs">
        {({ route }) => (
          <ScreenWithHeader route={route}>
            <MainTabs />
          </ScreenWithHeader>
        )}
      </Stack.Screen>

      <Stack.Screen name="Bookmarks">
        {({ route, ...props }) => (
          <ScreenWithHeader route={route}>
            <BookmarkScreen {...props} />
          </ScreenWithHeader>
        )}
      </Stack.Screen>

      <Stack.Screen name="LeaveRequestDetail">
        {(props: StackScreenProps<AppStackParamList, 'LeaveRequestDetail'>) => (
          <ScreenWithHeader route={props.route}>
            <LeaveRequestDetailScreen {...props} />
          </ScreenWithHeader>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
