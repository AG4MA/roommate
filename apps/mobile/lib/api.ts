/**
 * API client for mobile app
 * Handles all HTTP requests to the web backend
 */

import * as SecureStore from 'expo-secure-store';
import type { ListingFilters, CreateListingData, TenantProfile, LandlordProfile } from '@roommate/shared';

// API base URL - set in environment or use localhost for development
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Token storage key
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'TENANT' | 'LANDLORD';
  verified: boolean;
  avatarUrl?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  roomType: string;
  price: number;
  deposit?: number;
  size?: number;
  availableFrom: string;
  minStay?: number;
  maxStay?: number;
  address: string;
  city: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  features: string[];
  images: string[];
  status: string;
  createdAt: string;
  expiresAt?: string;
  owner: {
    id: string;
    name: string;
    avatarUrl?: string;
    responseRate?: number;
    responseTime?: string;
  };
  interestCount?: number;
  viewCount?: number;
}

export interface Conversation {
  id: string;
  listingId?: string;
  listing?: {
    id: string;
    title: string;
    images: string[];
  };
  otherUser: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  read: boolean;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

/**
 * Get stored auth token
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Store auth token securely
 */
export async function setAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
}

/**
 * Remove auth token (logout)
 */
export async function removeAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_DATA_KEY);
}

/**
 * Get stored user data
 */
export async function getStoredUser(): Promise<User | null> {
  try {
    const data = await SecureStore.getItemAsync(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Store user data
 */
export async function setStoredUser(user: User): Promise<void> {
  await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ============ AUTH API ============

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'TENANT' | 'LANDLORD';
}

export async function login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
  const response = await apiRequest<{ user: User; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  if (response.success && response.data) {
    await setAuthToken(response.data.token);
    await setStoredUser(response.data.user);
  }

  return response;
}

export async function register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
  const response = await apiRequest<{ user: User; token: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.success && response.data) {
    await setAuthToken(response.data.token);
    await setStoredUser(response.data.user);
  }

  return response;
}

export async function logout(): Promise<void> {
  await removeAuthToken();
}

// ============ LISTINGS API ============

export interface ListingsParams {
  city?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  roomType?: string;
  features?: string[];
  page?: number;
  limit?: number;
}

export async function getListings(params: ListingsParams = {}): Promise<ApiResponse<{ listings: Listing[]; total: number; page: number; totalPages: number }>> {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else {
        searchParams.set(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return apiRequest(`/api/listings${queryString ? `?${queryString}` : ''}`);
}

export async function getListing(id: string): Promise<ApiResponse<Listing>> {
  return apiRequest(`/api/listings/${id}`);
}

export async function createListing(data: CreateListingData): Promise<ApiResponse<Listing>> {
  return apiRequest('/api/listings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateListing(id: string, data: Partial<CreateListingData>): Promise<ApiResponse<Listing>> {
  return apiRequest(`/api/listings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteListing(id: string): Promise<ApiResponse<void>> {
  return apiRequest(`/api/listings/${id}`, {
    method: 'DELETE',
  });
}

export async function renewListing(id: string): Promise<ApiResponse<Listing>> {
  return apiRequest(`/api/listings/${id}/renew`, {
    method: 'POST',
  });
}

// ============ INTEREST API ============

export interface Interest {
  id: string;
  status: 'ACTIVE' | 'WAITING' | 'WITHDRAWN' | 'EXPIRED';
  position: number;
  createdAt: string;
  listing?: Listing;
}

export async function expressInterest(listingId: string): Promise<ApiResponse<Interest>> {
  return apiRequest(`/api/listings/${listingId}/interest`, {
    method: 'POST',
  });
}

export async function withdrawInterest(listingId: string): Promise<ApiResponse<void>> {
  return apiRequest(`/api/listings/${listingId}/interest`, {
    method: 'DELETE',
  });
}

export async function getMyInterests(): Promise<ApiResponse<Interest[]>> {
  return apiRequest('/api/interests');
}

// ============ BOOKINGS API ============

export interface Booking {
  id: string;
  listingId: string;
  slotId: string;
  status: string;
  notes?: string;
  createdAt: string;
  listing?: Listing;
  slot?: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
  };
}

export interface BookingSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'INDIVIDUAL' | 'OPEN_DAY';
  maxAttendees?: number;
  currentAttendees?: number;
}

export async function getListingSlots(listingId: string): Promise<ApiResponse<BookingSlot[]>> {
  return apiRequest(`/api/listings/${listingId}/slots`);
}

export async function createBooking(data: { listingId: string; slotId: string; notes?: string }): Promise<ApiResponse<Booking>> {
  return apiRequest('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMyBookings(): Promise<ApiResponse<Booking[]>> {
  return apiRequest('/api/bookings');
}

export async function cancelBooking(id: string): Promise<ApiResponse<void>> {
  return apiRequest(`/api/bookings/${id}`, {
    method: 'DELETE',
  });
}

// ============ CONVERSATIONS API ============

export async function getConversations(): Promise<ApiResponse<Conversation[]>> {
  return apiRequest('/api/conversations');
}

export async function getConversation(id: string): Promise<ApiResponse<ConversationDetail>> {
  return apiRequest(`/api/conversations/${id}`);
}

export async function createConversation(data: { recipientId: string; listingId?: string; message?: string }): Promise<ApiResponse<Conversation>> {
  return apiRequest('/api/conversations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function sendMessage(conversationId: string, content: string): Promise<ApiResponse<Message>> {
  return apiRequest(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

// ============ PROFILE API ============

export async function getTenantProfile(): Promise<ApiResponse<TenantProfile>> {
  return apiRequest('/api/profile/tenant');
}

export async function updateTenantProfile(data: Partial<TenantProfile>): Promise<ApiResponse<TenantProfile>> {
  return apiRequest('/api/profile/tenant', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getLandlordProfile(): Promise<ApiResponse<LandlordProfile>> {
  return apiRequest('/api/profile/landlord');
}

export async function updateLandlordProfile(data: Partial<LandlordProfile>): Promise<ApiResponse<LandlordProfile>> {
  return apiRequest('/api/profile/landlord', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ============ WISHES API ============

export interface Wish {
  id: string;
  city: string;
  neighborhoods?: string[];
  minPrice?: number;
  maxPrice?: number;
  roomTypes?: string[];
  requiredFeatures?: string[];
  notifyEmail: boolean;
  notifyPush: boolean;
  active: boolean;
  createdAt: string;
}

export async function getWishes(): Promise<ApiResponse<Wish[]>> {
  return apiRequest('/api/wishes');
}

export async function createWish(data: Omit<Wish, 'id' | 'createdAt'>): Promise<ApiResponse<Wish>> {
  return apiRequest('/api/wishes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateWish(id: string, data: Partial<Wish>): Promise<ApiResponse<Wish>> {
  return apiRequest(`/api/wishes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteWish(id: string): Promise<ApiResponse<void>> {
  return apiRequest(`/api/wishes/${id}`, {
    method: 'DELETE',
  });
}
