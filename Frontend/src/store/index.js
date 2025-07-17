import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import repoReducer from './repoSlice';
import scanReducer from './scanSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    repos: repoReducer,
    scan: scanReducer,
  }
});
