import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Replace this with actual logic to pull from user state!
const selectGithubId = (state) => state.user?.user?.user_metadata?.sub;

export const fetchUserScanReports = createAsyncThunk(
  "scanReports/fetchUserScanReports",
  async (githubId, { rejectWithValue }) => {
    if (!githubId) return rejectWithValue("No GitHub ID found");
    try {
      const response = await axios.get(`http://localhost:5000/api/scan/results/user/${githubId}`);
      return response.data.results || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const scanReportsSlice = createSlice({
  name: "scanReports",
  initialState: {
    reports: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserScanReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserScanReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchUserScanReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default scanReportsSlice.reducer;
