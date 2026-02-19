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

// ==================== Tenant Profile Types ====================

export type ContractType = 'PERMANENT' | 'TEMPORARY' | 'INTERNSHIP';
export type IncomeRange = 'UNDER_1000' | 'FROM_1000_TO_1500' | 'FROM_1500_TO_2000' | 'FROM_2000_TO_3000' | 'OVER_3000';

export interface TenantProfileCard {
  // From User model
  id: string;
  name: string;
  avatar: string | null;
  age: number | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  occupation: 'STUDENT' | 'WORKING' | 'FREELANCER' | 'UNEMPLOYED' | 'RETIRED' | null;
  verified: boolean;

  // From TenantProfile model
  budgetMin: number | null;
  budgetMax: number | null;
  moveInDate: string | null;
  contractType: ContractType | null;
  smoker: boolean;
  hasPets: boolean;
  hasGuarantor: boolean;
  incomeRange: IncomeRange | null;
  languages: string[];
  referencesAvailable: boolean;
  employmentVerified: boolean;
  incomeVerified: boolean;
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
  washingMachine: boolean;
  dishwasher: boolean;
  parking: boolean;
  bikeParking: boolean;
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
  tenant: TenantProfileCard;
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
  tenantProfile: TenantProfileCard | null;
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

// ==================== Group Types ====================

export type GroupRole = 'OWNER' | 'MEMBER';
export type GroupMemberStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface GroupMember {
  id: string;
  userId: string;
  name: string;
  avatar: string | null;
  role: GroupRole;
  status: GroupMemberStatus;
  joinedAt: string | null;
  tenantProfile: TenantProfileCard | null;
}

export interface GroupSummary {
  id: string;
  name: string | null;
  description: string | null;
  maxMembers: number;
  memberCount: number;
  pendingCount: number;
  members: Pick<GroupMember, 'userId' | 'name' | 'avatar' | 'role' | 'status'>[];
  conversationId: string | null;
  createdAt: string;
}

export interface GroupDetail extends GroupSummary {
  members: GroupMember[];
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
