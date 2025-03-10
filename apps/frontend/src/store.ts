import { configureStore } from "@reduxjs/toolkit";
import { api } from "./queries/api";

const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultmiddleware) =>
    getDefaultmiddleware().concat(api.middleware),
});

export default store;