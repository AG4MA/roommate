import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#0ea5e9',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="room/[id]" 
          options={{ 
            title: 'Dettaglio stanza',
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="booking/[roomId]" 
          options={{ 
            title: 'Prenota visita',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="auth/login" 
          options={{ 
            title: 'Accedi',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="auth/register" 
          options={{ 
            title: 'Registrati',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="conversation/[id]" 
          options={{ 
            title: 'Conversazione',
            presentation: 'card',
          }} 
        />
      </Stack>
      </AuthInitializer>
    </QueryClientProvider>
  );
}
