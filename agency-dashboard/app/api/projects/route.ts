import { apiError, handleApiError, json, parseJsonObject, requestId } from '@/lib/api';
import { createAgencyProject, listAgencyProjects } from '@/lib/db';
import { uid } from '@/lib/format';
import { requireApiAgency } from '@/lib/session';
import { parseProjectInput } from '@/lib/validate';

export async function GET(req: Request) {
  const id = requestId(req);
  try {
    const auth = await requireApiAgency();
    if (auth.error) return auth.error;
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get('limit') ?? 50);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    return json({ projects: await listAgencyProjects(auth.agency.id, limit, offset) }, {}, id);
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
    const parsed = parseProjectInput(body, auth.agency.id);
    if (parsed.error || !parsed.project) return apiError(parsed.error ?? 'Invalid project.', 'INVALID_PROJECT', 400, id);
    const project = await createAgencyProject({ ...parsed.project, id: uid('project') });
    return json({ project }, { status: 201 }, id);
  } catch (error) {
    return handleApiError(error, id);
  }
}
