export type TransactionType = 'rent' | 'sale';

export type PropertyType =
  | 'apartment'
  | 'house'
  | 'maisonette'
  | 'bungalow'
  | 'bedsitter'
  | 'studio'
  | 'townhouse'
  | 'land'
  | 'commercial';

export type PropertyStatus = 'active' | 'pending' | 'sold' | 'rented';

export type Amenity =
  | 'Parking'
  | 'Generator'
  | 'Borehole'
  | 'Gated'
  | 'Fibre'
  | 'Furnished'
  | 'Balcony'
  | 'Pet-friendly'
  | 'Gym'
  | 'Pool'
  | 'CCTV'
  | 'Backup water'
  | 'Elevator'
  | 'Garden'
  | 'Staff quarters';

export interface BankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  paybill?: string;
}

export interface Agency {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  coverUrl: string;
  bio: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  listingCount: number;
  phone: string;
  whatsapp: string;
  email: string;
  counties: string[];
  yearsActive: number;
  responseRate: number;
  featured?: boolean;
  bankAccount?: BankAccount;
}

export interface UpcomingProject {
  id: string;
  agencyId: string;
  name: string;
  description: string;
  county: string;
  estate: string;
  imageUrl: string;
  priceFromKes: number;
  completionLabel: string;
  unitsLeft?: number;
  propertyType: PropertyType;
}

export interface Property {
  id: string;
  agencyId: string;
  title: string;
  description: string;
  transactionType: TransactionType;
  propertyType: PropertyType;
  priceKes: number;
  rentPeriod?: 'month' | 'year';
  bedrooms: number;
  bathrooms: number;
  sqm?: number;
  parking?: number;
  county: string;
  city: string;
  estate: string;
  lat: number;
  lng: number;
  amenities: Amenity[];
  images: string[];
  featured: boolean;
  status: PropertyStatus;
  createdAt: string;
}

export interface County {
  id: string;
  name: string;
  estates: string[];
  lat: number;
  lng: number;
}

export interface PropertyFilters {
  limit?: number;
  offset?: number;
  query?: string;
  transactionType?: TransactionType | 'all';
  propertyType?: PropertyType | 'all';
  county?: string;
  estate?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: Amenity[];
  agencyId?: string;
  featuredOnly?: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface AgencyFilters {
  limit?: number;
  offset?: number;
  query?: string;
  county?: string;
  verifiedOnly?: boolean;
  featuredOnly?: boolean;
}
