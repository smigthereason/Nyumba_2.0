import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

const base = (__ENV.API_BASE_URL || '').replace(/\/$/, '');
if (!base) throw new Error('Set API_BASE_URL');

export default function () {
  const health = http.get(`${base}/api/health`);
  check(health, {
    'health 200': (r) => r.status === 200,
    'production database mode': (r) => {
      try { return JSON.parse(r.body).mode === 'supabase'; } catch { return false; }
    },
  });
  sleep(1);
}
