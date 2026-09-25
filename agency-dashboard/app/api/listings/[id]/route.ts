import { apiError, handleApiError, json, parseJsonObject, requestId } from '@/lib/api';
import { deleteAgencyListing, getAgencyListing, updateAgencyListing } from '@/lib/db';
import { requireApiAgency } from '@/lib/session';
import { parseListingInput } from '@/lib/validate';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const request = requestId(req);
  try {
    const auth = await requireApiAgency();
    if (auth.error) return auth.error;
    const { id } = await ctx.params;
    const listing = await getAgencyListing(auth.agency.id, id);
    if (!listing) return apiError('Listing not found.', 'NOT_FOUND', 404, request);
    return json({ listing }, {}, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  const request = requestId(req);
  try {
    const auth = await requireApiAgency();
    if (auth.error) return auth.error;
    const { id } = await ctx.params;
    const body = await parseJsonObject(req, request);
    if (body instanceof Response) return body;
    const existing = await getAgencyListing(auth.agency.id, id);
    if (!existing) return apiError('Listing not found.', 'NOT_FOUND', 404, request);
    const parsed = parseListingInput(body, auth.agency.id, existing);
    if (parsed.error || !parsed.listing) return apiError(parsed.error ?? 'Invalid listing.', 'INVALID_LISTING', 400, request);
    const listing = await updateAgencyListing({ ...parsed.listing, id: existing.id });
    return json({ listing }, {}, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  const request = requestId(req);
  try {
    const auth = await requireApiAgency();
    if (auth.error) return auth.error;
    const { id } = await ctx.params;
    const found = await deleteAgencyListing(auth.agency.id, id);
    if (!found) return apiError('Listing not found.', 'NOT_FOUND', 404, request);
    return json({ ok: true }, {}, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
