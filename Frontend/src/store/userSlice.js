// store/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  githubToken: null,
  userId: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.githubToken = action.payload.githubToken;
      state.userId = action.payload.user.id;
    },
    clearUser: (state) => {
      state.user = null;
      state.githubToken = null;
    }
  }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;