import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errors = new Rate('catalog_errors');
const latency = new Trend('catalog_latency', true);

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '3m', target: 500 },
    { duration: '3m', target: 1000 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    catalog_errors: ['rate<0.01'],
    catalog_latency: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const base = __ENV.SUPABASE_URL;
const anon = __ENV.SUPABASE_ANON_KEY;
if (!base || !anon) throw new Error('Set SUPABASE_URL and SUPABASE_ANON_KEY');

const headers = { apikey: anon, Authorization: `Bearer ${anon}`, 'Content-Type': 'application/json' };

export default function () {
  const agency = http.post(
    `${base}/rest/v1/rpc/agencies_with_listing_count`,
    JSON.stringify({ p_county: 'Nairobi', p_featured_only: false, p_verified_only: false, p_search: null, p_limit: 24, p_offset: 0 }),
    { headers }
  );
  latency.add(agency.timings.duration);
  errors.add(!check(agency, { 'agency catalogue 200': (r) => r.status === 200 }));

  const properties = http.get(
    `${base}/rest/v1/properties?select=id,title,price_kes,county,estate,featured&status=eq.active&county=eq.Nairobi&order=featured.desc,created_at.desc&limit=50`,
    { headers }
  );
  latency.add(properties.timings.duration);
  errors.add(!check(properties, { 'property catalogue 200': (r) => r.status === 200 }));
  sleep(1);
}
