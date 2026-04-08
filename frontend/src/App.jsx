import { useAuthInit } from "./hooks/useAuthInit";
import { useAuthStore } from "./store/auth.store";
import AppRoutes from "./routes/AppRoutes";

function App() {
  useAuthInit();

  const loading = useAuthStore((s) => s.isAuthLoading);

  if (loading) return ;

  return <AppRoutes />;
}

export default App;
