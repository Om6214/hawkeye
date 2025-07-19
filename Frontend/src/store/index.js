import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "./userSlice";
import repoReducer from "./repoSlice";
import scanReducer from "./scanSlice";
import scanReportsReducer from "./scanReportsSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // only persist user data
};

const persistedReducer = persistReducer(persistConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedReducer,
    repos: repoReducer,
    scan: scanReducer,
    scanReports: scanReportsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
        // Ignore these paths in the state
        ignoredPaths: ["items.dates"],
      },
    }),
});

export const persistor = persistStore(store);
