import { apiError, handleApiError, json, parseJsonObject, requestId } from '@/lib/api';
import { updateAgencyLeadStatus } from '@/lib/db';
import { requireApiAgency } from '@/lib/session';
import type { LeadStatus } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const request = requestId(req);
  try {
    const auth = await requireApiAgency();
    if (auth.error) return auth.error;
    const { id } = await ctx.params;
    const body = await parseJsonObject(req, request);
    if (body instanceof Response) return body;
    const status = body.status as LeadStatus | undefined;
    if (!status || !['new', 'contacted', 'closed'].includes(status)) {
      return apiError('Status must be new, contacted, or closed.', 'INVALID_STATUS', 400, request);
    }
    const lead = await updateAgencyLeadStatus(auth.agency.id, id, status);
    if (!lead) return apiError('Lead not found.', 'NOT_FOUND', 404, request);
    return json({ lead }, {}, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
