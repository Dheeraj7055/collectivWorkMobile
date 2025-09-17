import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/services/api";
import { encodeData } from "@/utils/cryptoHelpers";

interface DepartmentUser {
  id: string | number;
  first_name: string;
  last_name: string;
  email: string;
  image_url?: string;
  profile_color?: string;
}

interface DepartmentOption {
  id: number | string;
  value: string | number;
  label: string;
  userList?: DepartmentUser[];
}

interface DepartmentState {
  departmentNames: DepartmentOption[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DepartmentState = {
  departmentNames: [],
  isLoading: false,
  error: null,
};

// ✅ Fetch Department Names
export const fetchDepartmentNames = createAsyncThunk(
  "department/fetchDepartmentNames",
  async (payload: object = {}, { rejectWithValue }) => {
    try {
      const encodedPayload = encodeData(payload || {});
      const response = await apiClient.get("/api/admin/department/names", {
        params: { payload: encodedPayload },
      });

      if (response?.data && response.success) {
        return response.data.map((dept: any) => ({
          id: dept.id,
          value: dept.id,
          label: dept.department_name,
          userList: dept?.userList
        }));
      } else {
        return rejectWithValue(
          response?.message || "Failed to fetch department names"
        );
      }
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {
    clearDepartments: (state) => {
      state.departmentNames = [];
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartmentNames.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentNames.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departmentNames = action.payload;
      })
      .addCase(fetchDepartmentNames.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDepartments } = departmentSlice.actions;
export default departmentSlice.reducer;
