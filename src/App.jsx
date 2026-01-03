import AppRoutes from './routes/AppRoutes';
import AuthProvider from './context/AuthContext';
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ClerkProvider>
  );
}

export default App;