// store/scanSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const startScan = createAsyncThunk(
  'scan/startScan',
  async ({ scanType, repoUrl, userId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5000/api/scan/${scanType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl, github_id: userId })
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchScanResults = createAsyncThunk(
  'scan/fetchScanResults',
  async (scanId, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5000/api/scan/result/${scanId}`);
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error);
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  currentScan: null,
  results: {},
  loading: false,
  error: null
};

const scanSlice = createSlice({
  name: 'scan',
  initialState,
  reducers: {
    clearScan: (state) => {
      state.currentScan = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(startScan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startScan.fulfilled, (state, action) => {
        state.loading = false;
        state.currentScan = action.payload;
        // Cache results
        state.results[action.payload.scan_id] = action.payload;
      })
      .addCase(startScan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchScanResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScanResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results[action.payload.scan_id] = action.payload;
      })
      .addCase(fetchScanResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearScan } = scanSlice.actions;
export default scanSlice.reducer;