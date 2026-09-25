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

export type LeadType = 'viewing' | 'purchase';
export type LeadStatus = 'new' | 'contacted' | 'closed';

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

export type AgencyAccount = Agency & { passwordHash: string };

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

export interface Lead {
  id: string;
  propertyId: string;
  agencyId: string;
  name?: string;
  phone?: string;
  message: string;
  type: LeadType;
  status: LeadStatus;
  createdAt: string;
}

export interface Db {
  agencies: AgencyAccount[];
  properties: Property[];
  projects: UpcomingProject[];
  leads: Lead[];
}

export const PROPERTY_TYPES: PropertyType[] = [
  'apartment',
  'house',
  'maisonette',
  'bungalow',
  'bedsitter',
  'studio',
  'townhouse',
  'land',
  'commercial',
];

export const AMENITIES: Amenity[] = [
  'Parking',
  'Generator',
  'Borehole',
  'Gated',
  'Fibre',
  'Furnished',
  'Balcony',
  'Pet-friendly',
  'Gym',
  'Pool',
  'CCTV',
  'Backup water',
  'Elevator',
  'Garden',
  'Staff quarters',
];
