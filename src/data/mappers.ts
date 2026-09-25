import { Agency, Amenity, Property, PropertyStatus, PropertyType, TransactionType } from './types';

type AgencyRow = {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  cover_url: string;
  bio: string;
  verified: boolean;
  rating: number;
  review_count: number;
  phone: string;
  whatsapp: string;
  email: string;
  counties: string[] | null;
  years_active: number;
  response_rate: number;
  featured: boolean | null;
  listing_count?: number | string;
  bank_account?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branch: string;
    paybill?: string;
  } | null;
};

type PropertyRow = {
  id: string;
  agency_id: string;
  title: string;
  description: string;
  transaction_type: string;
  property_type: string;
  price_kes: number;
  rent_period: string | null;
  bedrooms: number;
  bathrooms: number;
  sqm: number | null;
  parking: number | null;
  county: string;
  city: string;
  estate: string;
  lat: number;
  lng: number;
  amenities: string[] | null;
  images: string[] | null;
  featured: boolean;
  status: string;
  created_at: string;
};

export function mapAgency(row: AgencyRow): Agency {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url,
    coverUrl: row.cover_url,
    bio: row.bio,
    verified: row.verified,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    listingCount: Number(row.listing_count ?? 0),
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    counties: row.counties ?? [],
    yearsActive: row.years_active,
    responseRate: row.response_rate,
    featured: row.featured ?? false,
    bankAccount: row.bank_account ?? undefined,
  };
}

export function mapProperty(row: PropertyRow): Property {
  return {
    id: row.id,
    agencyId: row.agency_id,
    title: row.title,
    description: row.description,
    transactionType: row.transaction_type as TransactionType,
    propertyType: row.property_type as PropertyType,
    priceKes: row.price_kes,
    rentPeriod: (row.rent_period as 'month' | 'year' | null) ?? undefined,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    sqm: row.sqm ?? undefined,
    parking: row.parking ?? undefined,
    county: row.county,
    city: row.city,
    estate: row.estate,
    lat: Number(row.lat),
    lng: Number(row.lng),
    amenities: (row.amenities ?? []) as Amenity[],
    images: row.images ?? [],
    featured: row.featured,
    status: row.status as PropertyStatus,
    createdAt: row.created_at,
  };
}
