import { apiError, handleApiError, json, parseJsonObject, requestId } from '@/lib/api';
import { createAgencyListing, listAgencyListings } from '@/lib/db';
import { uid } from '@/lib/format';
import { requireApiAgency } from '@/lib/session';
import { parseListingInput } from '@/lib/validate';

export async function GET(req: Request) {
  const id = requestId(req);
  try {
    const auth = await requireApiAgency();
    if (auth.error) return auth.error;
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get('limit') ?? 50);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    return json({ listings: await listAgencyListings(auth.agency.id, limit, offset) }, {}, id);
  } catch (error) {
    return handleApiError(error, id);
  }
}

export async function POST(req: Request) {
  const id = requestId(req);
  try {
    const auth = await requireApiAgency();
    if (auth.error) return auth.error;
    const body = await parseJsonObject(req, id);
    if (body instanceof Response) return body;

    const parsed = parseListingInput(body, auth.agency.id);
    if (parsed.error || !parsed.listing) return apiError(parsed.error ?? 'Invalid listing.', 'INVALID_LISTING', 400, id);

    const listing = await createAgencyListing({ ...parsed.listing, id: uid('prop') });
    return json({ listing }, { status: 201 }, id);
  } catch (error) {
    return handleApiError(error, id);
  }
}
