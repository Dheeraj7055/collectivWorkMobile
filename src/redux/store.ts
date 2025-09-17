// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import attendanceSlice from './slices/attendanceSlice';
import announcementReducer from './slices/announcementSlice';
import departmentReducer from './slices/departmentSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userSlice,
    attendance: attendanceSlice,
    announcements: announcementReducer,
    department: departmentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;