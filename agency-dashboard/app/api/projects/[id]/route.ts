import { apiError, handleApiError, json, parseJsonObject, requestId } from '@/lib/api';
import { deleteAgencyProject, getAgencyProject, updateAgencyProject } from '@/lib/db';
import { requireApiAgency } from '@/lib/session';
import { parseProjectInput } from '@/lib/validate';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const request = requestId(req);
  try {
    const auth = await requireApiAgency();
    if (auth.error) return auth.error;
    const { id } = await ctx.params;
    const body = await parseJsonObject(req, request);
    if (body instanceof Response) return body;
    const existing = await getAgencyProject(auth.agency.id, id);
    if (!existing) return apiError('Project not found.', 'NOT_FOUND', 404, request);
    const parsed = parseProjectInput(body, auth.agency.id, existing);
    if (parsed.error || !parsed.project) return apiError(parsed.error ?? 'Invalid project.', 'INVALID_PROJECT', 400, request);
    const project = await updateAgencyProject({ ...parsed.project, id: existing.id });
    return json({ project }, {}, request);
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
    const found = await deleteAgencyProject(auth.agency.id, id);
    if (!found) return apiError('Project not found.', 'NOT_FOUND', 404, request);
    return json({ ok: true }, {}, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
