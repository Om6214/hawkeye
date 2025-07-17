// store/repoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchRepos = createAsyncThunk(
  'repos/fetchRepos',
  async (githubToken, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/github/repos', {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          'Content-Type': 'application/json'
        }
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

const initialState = {
  repos: [],
  loading: false,
  error: null
};

const repoSlice = createSlice({
  name: 'repos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRepos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepos.fulfilled, (state, action) => {
        state.loading = false;
        state.repos = action.payload;
      })
      .addCase(fetchRepos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch repositories';
      });
  }
});

export default repoSlice.reducer;