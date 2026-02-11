/**
 * React Query hooks for API data fetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getListings,
  getListing,
  getMyBookings,
  createBooking,
  cancelBooking,
  getConversations,
  getConversation,
  sendMessage,
  createConversation,
  getTenantProfile,
  updateTenantProfile,
  getLandlordProfile,
  updateLandlordProfile,
  expressInterest,
  withdrawInterest,
  getMyInterests,
  getWishes,
  createWish,
  deleteWish,
  getListingSlots,
  renewListing,
  ListingsParams,
} from '../lib/api';

// Query keys for cache management
export const queryKeys = {
  listings: (params?: ListingsParams) => ['listings', params] as const,
  listing: (id: string) => ['listing', id] as const,
  listingSlots: (id: string) => ['listing', id, 'slots'] as const,
  bookings: ['bookings'] as const,
  conversations: ['conversations'] as const,
  conversation: (id: string) => ['conversation', id] as const,
  tenantProfile: ['profile', 'tenant'] as const,
  landlordProfile: ['profile', 'landlord'] as const,
  interests: ['interests'] as const,
  wishes: ['wishes'] as const,
};

// ============ LISTINGS HOOKS ============

export function useListings(params?: ListingsParams) {
  return useQuery({
    queryKey: queryKeys.listings(params),
    queryFn: () => getListings(params),
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: queryKeys.listing(id),
    queryFn: () => getListing(id),
    enabled: !!id,
  });
}

export function useListingSlots(listingId: string) {
  return useQuery({
    queryKey: queryKeys.listingSlots(listingId),
    queryFn: () => getListingSlots(listingId),
    enabled: !!listingId,
  });
}

export function useRenewListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (listingId: string) => renewListing(listingId),
    onSuccess: (_, listingId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listing(listingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings() });
    },
  });
}

// ============ INTEREST HOOKS ============

export function useMyInterests() {
  return useQuery({
    queryKey: queryKeys.interests,
    queryFn: getMyInterests,
  });
}

export function useExpressInterest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (listingId: string) => expressInterest(listingId),
    onSuccess: (_, listingId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interests });
      queryClient.invalidateQueries({ queryKey: queryKeys.listing(listingId) });
    },
  });
}

export function useWithdrawInterest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (listingId: string) => withdrawInterest(listingId),
    onSuccess: (_, listingId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interests });
      queryClient.invalidateQueries({ queryKey: queryKeys.listing(listingId) });
    },
  });
}

// ============ BOOKINGS HOOKS ============

export function useMyBookings() {
  return useQuery({
    queryKey: queryKeys.bookings,
    queryFn: getMyBookings,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
}

// ============ CONVERSATIONS HOOKS ============

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: getConversations,
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: queryKeys.conversation(id),
    queryFn: () => getConversation(id),
    enabled: !!id,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) => 
      sendMessage(conversationId, content),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversation(conversationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

// ============ PROFILE HOOKS ============

export function useTenantProfile() {
  return useQuery({
    queryKey: queryKeys.tenantProfile,
    queryFn: getTenantProfile,
  });
}

export function useUpdateTenantProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateTenantProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantProfile });
    },
  });
}

export function useLandlordProfile() {
  return useQuery({
    queryKey: queryKeys.landlordProfile,
    queryFn: getLandlordProfile,
  });
}

export function useUpdateLandlordProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateLandlordProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.landlordProfile });
    },
  });
}

// ============ WISHES HOOKS ============

export function useWishes() {
  return useQuery({
    queryKey: queryKeys.wishes,
    queryFn: getWishes,
  });
}

export function useCreateWish() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createWish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishes });
    },
  });
}

export function useDeleteWish() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (wishId: string) => deleteWish(wishId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishes });
    },
  });
}
