import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import Routers from "./Routes";
import store from "./store";

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
