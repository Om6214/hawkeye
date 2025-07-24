import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const startScan = createAsyncThunk(
  "scan/startScan",
  async ({ scanType, repoUrl, userId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/scan/${scanType}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repo_url: repoUrl,
            github_id: userId,
            scan_type: scanType,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error);
      }

      const data = await response.json();
      // Normalize the response structure
      return {
        scan_id: data.scan_id,
        status: "pending",
        message: data.message,
        findings_count: data.trufflehog_findings_count,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchScanResults = createAsyncThunk(
  "scan/fetchScanResults",
  async (scanId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/scan/result/${scanId}`
      );

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error);
      }

      const data = await response.json();
      console.log(data);
      // Normalize the response structure
      return {
        scan_id: data.scan_id,
        ...data,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  currentScan: null,
  results: {},
  loading: false,
  error: null,
};

const scanSlice = createSlice({
  name: "scan",
  initialState,
  reducers: {
    clearScan: (state) => {
      state.currentScan = null;
    },
    setScanLoading: (state, action) => {
      state.loading = action.payload;
    },
    updateScanStatus: (state, action) => {
      const { scan_id, status } = action.payload;
      if (state.results[scan_id]) {
        state.results[scan_id].status = status;
      }
      if (state.currentScan?.scan_id === scan_id) {
        state.currentScan.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startScan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startScan.fulfilled, (state, action) => {
        state.loading = false;
        const { scan_id, ...scanData } = action.payload;
        state.results[scan_id] = {
          ...(state.results[scan_id] || {}), // Preserve existing data if any
          ...scanData, // Merge new scan data
          scan_id, // Ensure scan_id is preserved
        };
        if (state.currentScan?.scan_id === scan_id) {
          state.currentScan = state.results[scan_id];
        }
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
        const scanData = action.payload;

        // Update existing scan data
        const existing = state.results[scanData.scan_id] || {};
        const updatedScan = {
          ...existing,
          ...scanData,
        };

        state.results[scanData.scan_id] = updatedScan;

        // Update currentScan if it's the active one
        if (state.currentScan?.scan_id === scanData.scan_id) {
          state.currentScan = updatedScan;
        }
      })
      .addCase(fetchScanResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearScan, updateScanStatus, setScanLoading } =
  scanSlice.actions;
export default scanSlice.reducer;
