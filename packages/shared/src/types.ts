// ==================== API Response Types ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== User Types ====================

export interface UserPublic {
  id: string;
  name: string;
  avatar: string | null;
  verified: boolean;
  createdAt: string;
}

export interface UserProfile extends UserPublic {
  email: string;
  phone: string | null;
  bio: string | null;
  dateOfBirth: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  occupation: 'STUDENT' | 'WORKING' | 'FREELANCER' | 'UNEMPLOYED' | 'RETIRED' | null;
}

export interface LandlordInfo extends UserPublic {
  responseRate: number;
  responseTime: number;
  totalListings: number;
  verified: boolean;
}

// ==================== Listing Types ====================

export interface ListingCard {
  id: string;
  title: string;
  address: string;
  city: string;
  neighborhood: string | null;
  price: number;
  expenses: number;
  roomType: 'SINGLE' | 'DOUBLE' | 'STUDIO' | 'ENTIRE_PLACE';
  roomSize: number;
  availableFrom: string;
  images: { url: string }[];
  features: {
    wifi: boolean;
    furnished: boolean;
    privateBath: boolean;
  };
  currentRoommates: number;
  maxRoommates: number;
  latitude: number;
  longitude: number;
}

export interface ListingDetail extends ListingCard {
  description: string;
  totalSize: number | null;
  floor: number | null;
  hasElevator: boolean;
  deposit: number;
  minStay: number;
  maxStay: number | null;
  features: ListingFeatures;
  rules: ListingRules;
  preferences: ListingPreferences;
  roommates: Roommate[];
  landlord: LandlordInfo;
  virtualTourUrl: string | null;
  views: number;
  createdAt: string;
  publishedAt: string | null;
}

export interface ListingFeatures {
  wifi: boolean;
  furnished: boolean;
  privateBath: boolean;
  balcony: boolean;
  aircon: boolean;
  heating: boolean;
  washingMachine: boolean;
  dishwasher: boolean;
  parking: boolean;
  garden: boolean;
  terrace: boolean;
}

export interface ListingRules {
  petsAllowed: boolean;
  smokingAllowed: boolean;
  couplesAllowed: boolean;
  guestsAllowed: boolean;
  cleaningSchedule: string | null;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

export interface ListingPreferences {
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  ageMin: number | null;
  ageMax: number | null;
  occupation: string[];
  languages: string[];
}

export interface Roommate {
  id: string;
  name: string;
  age: number | null;
  occupation: string | null;
  bio: string | null;
  avatar: string | null;
}

// ==================== Visit & Booking Types ====================

export interface VisitSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'SINGLE' | 'OPENDAY' | 'VIRTUAL';
  maxGuests: number;
  bookedCount: number;
  available: boolean;
}

export interface Booking {
  id: string;
  slot: VisitSlot;
  listing: ListingCard;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  message: string | null;
  createdAt: string;
  confirmedAt: string | null;
}

// ==================== Message Types ====================

export interface Conversation {
  id: string;
  listing: ListingCard | null;
  participants: UserPublic[];
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
}

// ==================== Search Types ====================

export interface SearchFilters {
  city?: string;
  neighborhood?: string;
  priceMin?: number;
  priceMax?: number;
  roomType?: 'SINGLE' | 'DOUBLE' | 'STUDIO' | 'ENTIRE_PLACE';
  availableFrom?: string;
  features?: Partial<ListingFeatures>;
  preferences?: {
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
  };
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
