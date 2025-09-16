// src/redux/slices/announcementSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { announcementService } from "@/services/announcementService";
import { encodeData } from "@/utils/cryptoHelpers";
import { MediaItem } from "@/types/announcement";

export interface Announcement {
  id: string | number;
  subject: string;               
  description: string;
  created_at: string;             
  createdByUser?: {
    id: string | number;
    first_name: string;
    last_name: string;
    image_url?: string | null;
    profile_color?: string;
    email?: string;
    cover_image_url?: string | null;
    employeeID?: string;
  };
  document_urls?: MediaItem[];     
  total_likes?: number;
  total_comments?: number;
  isLiked?: boolean;           
  status?: string;
  type?: string;
}


interface AnnouncementState {
  records: Announcement[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AnnouncementState = {
  records: [],
  isLoading: false,
  error: null,
};

export const fetchAnnouncements = createAsyncThunk<
Announcement[],                      
Record<string, any> | undefined,     
{ rejectValue: string }
>("announcements/fetch", async (payload, { rejectWithValue }) => {
  try {
    const encodedPayload = payload ? encodeData(payload) : null;
    const response = await announcementService.getAll(
      encodedPayload ? { payload: encodedPayload } : {}
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to load announcements");
  }
});

const announcementSlice = createSlice({
  name: "announcements",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchAnnouncements.fulfilled,
        (state, action: PayloadAction<Announcement[]>) => {
          state.isLoading = false;
          state.records = action.payload;
        }
      )
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to load announcements";
      });
  },
});

export const { clearError } = announcementSlice.actions;
export default announcementSlice.reducer;
