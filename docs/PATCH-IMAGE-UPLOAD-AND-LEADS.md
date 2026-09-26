# Image upload + viewing lead patch

## What this fixes

- Agency listing photos are uploaded from the browser instead of requiring raw image URLs.
- Uploaded JPG/PNG/WebP files are stored in Supabase Storage in the public `property-images` bucket.
- Uploads are restricted to signed-in agency dashboard users and use the service-role credential only on the server.
- Files are limited to 8 MB each and a listing remains limited to 20 photos.
- The Expo consumer app has a production API fallback at `https://nyumba-2-0.vercel.app`, so guest viewing requests do not fail simply because a local `.env` omitted `EXPO_PUBLIC_API_URL`.

## Required one-time database step

Run `supabase/migrations/003_property_image_storage.sql` in the Supabase SQL Editor.

## Deploy

After applying this patch:

```bash
git add .
git commit -m "Add property image uploads and fix public viewing requests"
git push
```

Vercel will redeploy `agency-dashboard`. If automatic deployments are disabled, redeploy the latest commit manually.

## Restart the Expo app

The API fallback lives in `app.json`, so restart Metro with cache clearing:

```bash
npx expo start -c
```

## Verification

1. Sign in to the agency dashboard.
2. Create or edit a listing and choose JPG/PNG/WebP images from disk.
3. Confirm thumbnails appear, save the listing, and open it in the consumer app.
4. Confirm the image renders from a URL containing `/storage/v1/object/public/property-images/`.
5. Tap **Request viewing** in the consumer app.
6. Confirm success and verify the lead appears under **Agency Dashboard → Leads**.
