import { counties } from '@/lib/mock/locations';
import {
  AMENITIES,
  PROPERTY_TYPES,
  type Amenity,
  type Property,
  type PropertyStatus,
  type PropertyType,
  type TransactionType,
  type UpcomingProject,
} from '@/lib/types';

const MAX_PRICE_KES = 1_000_000_000_000;

export function isEmail(v: string): boolean {
  return /^\S+@\S+\.\S+$/.test(v);
}

export function countyByName(name: string) {
  return counties.find((c) => c.name === name);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function finiteInteger(value: unknown, min: number, max: number): number | undefined {
  if (value == null || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  const rounded = Math.round(parsed);
  if (rounded < min || rounded > max) return undefined;
  return rounded;
}

export function parseListingInput(
  body: Record<string, unknown>,
  agencyId: string,
  existing?: Property
): { listing: Property; error?: undefined } | { listing?: undefined; error: string } {
  const title = String(body.title ?? '').trim();
  const description = String(body.description ?? '').trim();
  const transactionType = body.transactionType as TransactionType;
  const propertyType = body.propertyType as PropertyType;
  const priceKes = Number(body.priceKes);
  const county = String(body.county ?? '').trim();
  const estate = String(body.estate ?? '').trim();
  const city = String(body.city ?? county).trim() || county;
  const geo = countyByName(county);

  if (title.length < 4 || title.length > 160) {
    return { error: 'Listing title must be between 4 and 160 characters.' };
  }
  if (description.length > 5000) return { error: 'Description must be 5,000 characters or fewer.' };
  if (!['rent', 'sale'].includes(transactionType)) return { error: 'Choose Rent or Sale.' };
  if (!PROPERTY_TYPES.includes(propertyType)) return { error: 'Choose a property type.' };
  if (!Number.isFinite(priceKes) || priceKes <= 0 || priceKes > MAX_PRICE_KES) {
    return { error: 'Enter a valid price in KES.' };
  }
  if (!geo) return { error: 'Choose a county.' };
  if (!estate || estate.length > 120) return { error: 'Choose a valid estate.' };
  if (city.length > 120) return { error: 'City must be 120 characters or fewer.' };

  const images = Array.isArray(body.images)
    ? (body.images as unknown[]).map((u) => String(u).trim()).filter(Boolean)
    : String(body.images ?? '')
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean);

  if (images.length === 0) return { error: 'Upload at least one property photo.' };
  if (images.length > 20) return { error: 'A listing can contain at most 20 photos.' };
  if (images.some((image) => !isHttpUrl(image))) return { error: 'Every stored photo must have a valid http(s) URL.' };

  const amenities = Array.isArray(body.amenities)
    ? [...new Set((body.amenities as unknown[]).filter((a): a is Amenity => AMENITIES.includes(a as Amenity)))]
    : [];

  const status = (['active', 'pending', 'sold', 'rented'] as PropertyStatus[]).includes(
    body.status as PropertyStatus
  )
    ? (body.status as PropertyStatus)
    : existing?.status ?? 'active';

  const bedrooms = finiteInteger(body.bedrooms, 0, 100);
  const bathrooms = finiteInteger(body.bathrooms, 0, 100);
  const sqm = finiteInteger(body.sqm, 1, 100_000_000);
  const parking = finiteInteger(body.parking, 0, 10_000);
  if (body.bedrooms != null && body.bedrooms !== '' && bedrooms == null) return { error: 'Bedrooms must be a valid number.' };
  if (body.bathrooms != null && body.bathrooms !== '' && bathrooms == null) return { error: 'Bathrooms must be a valid number.' };
  if (body.sqm != null && body.sqm !== '' && sqm == null) return { error: 'Area must be a valid positive number.' };
  if (body.parking != null && body.parking !== '' && parking == null) return { error: 'Parking must be a valid number.' };

  const latRaw = body.lat == null || body.lat === '' ? undefined : Number(body.lat);
  const lngRaw = body.lng == null || body.lng === '' ? undefined : Number(body.lng);
  if (latRaw != null && (!Number.isFinite(latRaw) || latRaw < -90 || latRaw > 90)) return { error: 'Latitude must be between -90 and 90.' };
  if (lngRaw != null && (!Number.isFinite(lngRaw) || lngRaw < -180 || lngRaw > 180)) return { error: 'Longitude must be between -180 and 180.' };

  const listing: Property = {
    id: existing?.id ?? '',
    agencyId,
    title,
    description,
    transactionType,
    propertyType,
    priceKes: Math.round(priceKes),
    rentPeriod: transactionType === 'rent' ? (body.rentPeriod === 'year' ? 'year' : 'month') : undefined,
    bedrooms: bedrooms ?? 0,
    bathrooms: bathrooms ?? 0,
    sqm,
    parking,
    county,
    city,
    estate,
    lat: latRaw ?? geo.lat,
    lng: lngRaw ?? geo.lng,
    amenities,
    images,
    featured: Boolean(body.featured),
    status,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };

  return { listing };
}

export function parseProjectInput(
  body: Record<string, unknown>,
  agencyId: string,
  existing?: UpcomingProject
): { project: UpcomingProject; error?: undefined } | { project?: undefined; error: string } {
  const name = String(body.name ?? '').trim();
  const description = String(body.description ?? '').trim();
  const county = String(body.county ?? '').trim();
  const estate = String(body.estate ?? '').trim();
  const imageUrl = String(body.imageUrl ?? '').trim();
  const priceFromKes = Number(body.priceFromKes);
  const completionLabel = String(body.completionLabel ?? '').trim();
  const propertyType = body.propertyType as PropertyType;
  const unitsLeft = finiteInteger(body.unitsLeft, 0, 10_000_000);

  if (name.length < 3 || name.length > 160) return { error: 'Project name must be between 3 and 160 characters.' };
  if (description.length > 5000) return { error: 'Description must be 5,000 characters or fewer.' };
  if (!isHttpUrl(imageUrl)) return { error: 'Add a valid http(s) photo URL.' };
  if (!countyByName(county)) return { error: 'Choose a county.' };
  if (!estate || estate.length > 120) return { error: 'Choose a valid estate.' };
  if (!Number.isFinite(priceFromKes) || priceFromKes <= 0 || priceFromKes > MAX_PRICE_KES) {
    return { error: 'Enter a valid starting price in KES.' };
  }
  if (!PROPERTY_TYPES.includes(propertyType)) return { error: 'Choose a property type.' };
  if (!completionLabel || completionLabel.length > 120) return { error: 'Add a valid completion label (e.g. Completion Q4 2026).' };
  if (body.unitsLeft != null && body.unitsLeft !== '' && unitsLeft == null) return { error: 'Units left must be a valid number.' };

  return {
    project: {
      id: existing?.id ?? '',
      agencyId,
      name,
      description,
      county,
      estate,
      imageUrl,
      priceFromKes: Math.round(priceFromKes),
      completionLabel,
      unitsLeft,
      propertyType,
    },
  };
}
