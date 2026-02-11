// ==================== Formatting Utils ====================

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Adesso';
  if (diffMins < 60) return `${diffMins} min fa`;
  if (diffHours < 24) return `${diffHours} ore fa`;
  if (diffDays < 7) return `${diffDays} giorni fa`;
  
  return formatDateShort(date);
}

// ==================== Room Utils ====================

export function getRoomTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    SINGLE: 'Singola',
    DOUBLE: 'Doppia',
    STUDIO: 'Monolocale',
    ENTIRE_PLACE: 'Intero appartamento',
  };
  return labels[type] || type;
}

export function getOccupationLabel(occupation: string): string {
  const labels: Record<string, string> = {
    STUDENT: 'Studente',
    WORKING: 'Lavoratore',
    FREELANCER: 'Freelancer',
    UNEMPLOYED: 'In cerca di lavoro',
    RETIRED: 'Pensionato',
  };
  return labels[occupation] || occupation;
}

export function getGenderLabel(gender: string): string {
  const labels: Record<string, string> = {
    MALE: 'Uomo',
    FEMALE: 'Donna',
    OTHER: 'Altro',
  };
  return labels[gender] || gender;
}

// ==================== Tenant Profile Utils ====================

export function getContractTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PERMANENT: 'Indeterminato',
    TEMPORARY: 'Determinato',
    INTERNSHIP: 'Stage/Tirocinio',
  };
  return labels[type] || type;
}

export function getIncomeRangeLabel(range: string): string {
  const labels: Record<string, string> = {
    UNDER_1000: 'Meno di 1.000 \u20AC',
    FROM_1000_TO_1500: '1.000 - 1.500 \u20AC',
    FROM_1500_TO_2000: '1.500 - 2.000 \u20AC',
    FROM_2000_TO_3000: '2.000 - 3.000 \u20AC',
    OVER_3000: 'Oltre 3.000 \u20AC',
  };
  return labels[range] || range;
}

export function calculateAge(dateOfBirth: string | Date): number {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function formatBudgetRange(min: number | null, max: number | null): string {
  if (min && max) return `${formatPrice(min)} - ${formatPrice(max)}`;
  if (min) return `Da ${formatPrice(min)}`;
  if (max) return `Fino a ${formatPrice(max)}`;
  return 'Non specificato';
}

// ==================== Validation Utils ====================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// ==================== Distance Utils ====================

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

// ==================== Slug Utils ====================

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
