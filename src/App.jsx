import AppRoutes from './routes/AppRoutes';
import AuthProvider from './context/AuthContext';
import { ClerkProvider } from '@clerk/clerk-react';
import NotificationHost from './components/NotificationHost';
import { Toaster } from 'react-hot-toast';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <AuthProvider>
        <NotificationHost />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { fontSize: '13px', borderRadius: '10px' },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </ClerkProvider>
  );
}

export default App;
