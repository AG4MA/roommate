import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
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
      </Stack>
    </QueryClientProvider>
  );
}
