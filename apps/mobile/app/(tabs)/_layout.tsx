import { Tabs } from 'expo-router';
import { Home, Search, MessageCircle, User, Heart } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Esplora',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerTitle: 'rooMate',
          headerTitleStyle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#0ea5e9',
          },
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Cerca',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
          headerTitle: 'Cerca stanze',
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Preferiti',
          tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
          headerTitle: 'I tuoi preferiti',
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messaggi',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
          headerTitle: 'Messaggi',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profilo',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          headerTitle: 'Il tuo profilo',
        }}
      />
    </Tabs>
  );
}
