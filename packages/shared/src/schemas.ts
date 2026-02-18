import { z } from 'zod';

// ==================== User Schemas ====================

export const registerSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(8, 'Password deve essere almeno 8 caratteri'),
  name: z.string().min(2, 'Nome richiesto'),
  userType: z.enum(['tenant', 'landlord']),
});

export const loginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(1, 'Password richiesta'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  occupation: z.enum(['STUDENT', 'WORKING', 'FREELANCER', 'UNEMPLOYED', 'RETIRED']).optional(),
});

// ==================== Tenant Profile Schemas ====================

export const updateTenantProfileSchema = z.object({
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  moveInDate: z.string().optional(),
  preferredAreas: z.array(z.string()).optional(),
  contractType: z.enum(['PERMANENT', 'TEMPORARY', 'INTERNSHIP']).optional(),
  smoker: z.boolean().optional(),
  hasPets: z.boolean().optional(),
  hasGuarantor: z.boolean().optional(),
  incomeRange: z.enum(['UNDER_1000', 'FROM_1000_TO_1500', 'FROM_1500_TO_2000', 'FROM_2000_TO_3000', 'OVER_3000']).optional(),
  languages: z.array(z.string()).optional(),
  referencesAvailable: z.boolean().optional(),
});

// ==================== Listing Schemas ====================

export const createListingSchema = z.object({
  title: z.string().min(10, 'Titolo troppo corto').max(100),
  description: z.string().min(50, 'Descrizione troppo corta').max(2000),
  address: z.string().min(5, 'Indirizzo richiesto'),
  city: z.string().min(2, 'Città richiesta'),
  neighborhood: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  roomType: z.enum(['SINGLE', 'DOUBLE', 'STUDIO', 'ENTIRE_PLACE']),
  roomSize: z.number().min(5).max(100),
  totalSize: z.number().optional(),
  floor: z.number().optional(),
  hasElevator: z.boolean().default(false),
  price: z.number().min(50).max(5000),
  expenses: z.number().default(0),
  deposit: z.number().min(0),
  availableFrom: z.string(),
  minStay: z.number().default(6),
  maxStay: z.number().optional(),
});

export const listingFeaturesSchema = z.object({
  wifi: z.boolean().default(false),
  furnished: z.boolean().default(false),
  privateBath: z.boolean().default(false),
  balcony: z.boolean().default(false),
  aircon: z.boolean().default(false),
  heating: z.boolean().default(true),
  washingMachine: z.boolean().default(false),
  dishwasher: z.boolean().default(false),
  parking: z.boolean().default(false),
  garden: z.boolean().default(false),
  terrace: z.boolean().default(false),
});

export const listingRulesSchema = z.object({
  petsAllowed: z.boolean().default(false),
  smokingAllowed: z.boolean().default(false),
  couplesAllowed: z.boolean().default(false),
  guestsAllowed: z.boolean().default(true),
  cleaningSchedule: z.string().optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
});

export const listingPreferencesSchema = z.object({
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).nullable().optional(),
  ageMin: z.number().min(18).optional(),
  ageMax: z.number().max(99).optional(),
  occupation: z.array(z.enum(['STUDENT', 'WORKING', 'FREELANCER', 'UNEMPLOYED', 'RETIRED'])).optional(),
  languages: z.array(z.string()).optional(),
});

// ==================== Search Schemas ====================

export const searchListingsSchema = z.object({
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  roomType: z.enum(['SINGLE', 'DOUBLE', 'STUDIO', 'ENTIRE_PLACE']).optional(),
  availableFrom: z.string().optional(),
  features: z.object({
    wifi: z.boolean().optional(),
    furnished: z.boolean().optional(),
    privateBath: z.boolean().optional(),
    petsAllowed: z.boolean().optional(),
    smokingAllowed: z.boolean().optional(),
  }).optional(),
  preferences: z.object({
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  }).optional(),
  bounds: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number(),
  }).optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
  sortBy: z.enum(['price_asc', 'price_desc', 'date_asc', 'date_desc']).default('date_desc'),
});

// ==================== Booking Schemas ====================

export const createBookingSchema = z.object({
  slotId: z.string(),
  message: z.string().max(500).optional(),
});

export const createVisitSlotSchema = z.object({
  listingId: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  type: z.enum(['SINGLE', 'OPENDAY', 'VIRTUAL']),
  maxGuests: z.number().default(1),
});

// ==================== Message Schemas ====================

export const sendMessageSchema = z.object({
  conversationId: z.string().optional(),
  recipientId: z.string().optional(),
  listingId: z.string().optional(),
  content: z.string().min(1).max(2000),
});

// ==================== Group Schemas ====================

export const createGroupSchema = z.object({
  name: z.string().min(2, 'Il nome del gruppo deve avere almeno 2 caratteri').max(50).optional(),
  description: z.string().max(300).optional(),
  maxMembers: z.number().min(2).max(8).default(4),
});

export const updateGroupSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(300).optional(),
  maxMembers: z.number().min(2).max(8).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Email non valida'),
});

export const respondInvitationSchema = z.object({
  action: z.enum(['accept', 'decline']),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type SearchListingsInput = z.infer<typeof searchListingsSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateTenantProfileInput = z.infer<typeof updateTenantProfileSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type RespondInvitationInput = z.infer<typeof respondInvitationSchema>;
