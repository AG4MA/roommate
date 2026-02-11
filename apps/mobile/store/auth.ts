/**
 * Authentication store using Zustand
 * Manages user session state across the app
 */

import { create } from 'zustand';
import { 
  User, 
  login as apiLogin, 
  register as apiRegister, 
  logout as apiLogout,
  getStoredUser,
  LoginCredentials,
  RegisterData,
} from '../lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  initialize: async () => {
    try {
      const user = await getStoredUser();
      set({ 
        user, 
        isAuthenticated: !!user, 
        isLoading: false 
      });
    } catch {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  },

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    
    const response = await apiLogin(credentials);
    
    if (response.success && response.data) {
      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return true;
    } else {
      set({ 
        error: response.error || 'Errore di accesso', 
        isLoading: false 
      });
      return false;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    
    const response = await apiRegister(data);
    
    if (response.success && response.data) {
      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return true;
    } else {
      set({ 
        error: response.error || 'Errore di registrazione', 
        isLoading: false 
      });
      return false;
    }
  },

  logout: async () => {
    await apiLogout();
    set({ 
      user: null, 
      isAuthenticated: false, 
      error: null 
    });
  },

  clearError: () => set({ error: null }),
  
  setUser: (user: User | null) => set({ 
    user, 
    isAuthenticated: !!user 
  }),
}));
