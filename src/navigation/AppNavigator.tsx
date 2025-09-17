// src/navigation/AppNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Image } from 'react-native';
import { PostScreen } from '@/screens/PostScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { AttendanceScreen } from '@/screens/AttendanceScreen';
import { LeaveScreen } from '@/screens/LeaveScreen';

// Placeholder screens
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
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<AppStackParamList>();

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
              style={{
                width: size,
                height: size,
                tintColor: color,
              }}
              resizeMode="contain"
            />
          );
        },
      })}
    >
      <Tab.Screen name="Post" component={PostScreen} options={{ tabBarLabel: 'Post' }} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} options={{ tabBarLabel: 'Attendance' }} />
      <Tab.Screen name="Leave" component={LeaveScreen} options={{ tabBarLabel: 'Leave' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarLabel: 'Chat' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
};
