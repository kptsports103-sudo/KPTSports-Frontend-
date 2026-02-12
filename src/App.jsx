import AppRoutes from './routes/AppRoutes';
import AuthProvider from './context/AuthContext';
import { ClerkProvider } from '@clerk/clerk-react';
import NotificationHost from './components/NotificationHost';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <AuthProvider>
        <NotificationHost />
        <AppRoutes />
      </AuthProvider>
    </ClerkProvider>
  );
}

export default App;
