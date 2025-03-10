import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { api } from "./queries/api";
import Routers from "./Routes";

const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultmiddleware) =>
    getDefaultmiddleware().concat(api.middleware),
});

function App() {
  const queryClient = new QueryClient();

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Routers />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
