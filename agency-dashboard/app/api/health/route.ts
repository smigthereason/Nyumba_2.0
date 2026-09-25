import { handleApiError, json, requestId } from '@/lib/api';
import { checkBackendHealth } from '@/lib/db';

export async function GET(req: Request) {
  const id = requestId(req);
  try {
    const health = await checkBackendHealth();
    return json({ ok: true, ...health, timestamp: new Date().toISOString() }, {}, id);
  } catch (error) {
    return handleApiError(error, id);
  }
}
