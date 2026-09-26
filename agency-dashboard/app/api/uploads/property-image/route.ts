import { randomUUID } from 'crypto';

import { apiError, handleApiError, json, requestId } from '@/lib/api';
import { DataStoreError } from '@/lib/db';
import { requireApiAgency } from '@/lib/session';

export const runtime = 'nodejs';

const BUCKET = 'property-images';
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function storageConfig() {
  const url = (process.env.SUPABASE_URL ?? '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || key.length < 20) {
    throw new DataStoreError('Supabase storage is not configured.', 'BACKEND_NOT_CONFIGURED');
  }
  return { url, key };
}

function encodedPath(path: string) {
  return path.split('/').map(encodeURIComponent).join('/');
}

export async function POST(req: Request) {
  const id = requestId(req);
  try {
    const auth = await requireApiAgency();
    if (auth.error) return auth.error;

    const contentLength = Number(req.headers.get('content-length') ?? 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_FILE_BYTES + 1024 * 1024) {
      return apiError('Image is too large. Maximum size is 8 MB.', 'IMAGE_TOO_LARGE', 413, id);
    }

    const contentType = req.headers.get('content-type')?.toLowerCase() ?? '';
    if (!contentType.includes('multipart/form-data')) {
      return apiError('Upload must use multipart/form-data.', 'UNSUPPORTED_MEDIA_TYPE', 415, id);
    }

    const form = await req.formData();
    const value = form.get('file');
    if (!(value instanceof File)) {
      return apiError('Choose an image to upload.', 'IMAGE_REQUIRED', 400, id);
    }

    const extension = MIME_TO_EXTENSION[value.type];
    if (!extension) {
      return apiError('Only JPG, PNG, and WebP images are supported.', 'INVALID_IMAGE_TYPE', 400, id);
    }
    if (value.size <= 0 || value.size > MAX_FILE_BYTES) {
      return apiError('Image is too large. Maximum size is 8 MB.', 'IMAGE_TOO_LARGE', 413, id);
    }

    const { url, key } = storageConfig();
    const objectPath = `${auth.agency.id}/${Date.now()}-${randomUUID()}.${extension}`;
    const objectUrl = `${url}/storage/v1/object/${BUCKET}/${encodedPath(objectPath)}`;
    const bytes = Buffer.from(await value.arrayBuffer());

    const upload = await fetch(objectUrl, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': value.type,
        'x-upsert': 'false',
      },
      body: bytes,
      cache: 'no-store',
    });

    if (!upload.ok) {
      const detail = await upload.text().catch(() => '');
      console.error('[nyumba-upload]', { requestId: id, status: upload.status, detail: detail.slice(0, 500) });
      throw new DataStoreError('Image storage is temporarily unavailable.', 'BACKEND_UNAVAILABLE');
    }

    const publicUrl = `${url}/storage/v1/object/public/${BUCKET}/${encodedPath(objectPath)}`;
    return json({ url: publicUrl, path: objectPath }, { status: 201 }, id);
  } catch (error) {
    return handleApiError(error, id);
  }
}
