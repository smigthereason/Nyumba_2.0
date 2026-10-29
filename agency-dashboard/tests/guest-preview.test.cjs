/** Run with `npm run test:guest` after `npm ci` inside agency-dashboard. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const loaded = new Map();
let currentCookie;


// Load server modules without Next.js so any accidental data-store access fails.
function load(file) {
  const absolute = path.resolve(file);
  if (loaded.has(absolute)) return loaded.get(absolute).exports;
  const source = fs.readFileSync(absolute, 'utf8');
  const code = ts.transpileModule(source, {
    fileName: absolute,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  const module = { exports: {} };
  loaded.set(absolute, module);
  const localRequire = (name) => {
    if (name === '@/lib/seed') {
      return { buildSeed: () => { throw new Error('Guest read used local seed'); } };
    }
    if (name === 'next/headers') {
      return { cookies: async () => ({ get: () => currentCookie ? { value: currentCookie } : undefined }) };
    }
    if (name === 'next/server') {
      return { NextResponse: { json: (body, init) => ({ body, status: init?.status ?? 200 }) } };
    }
    if (name === 'fs') {
      return { promises: { readFile: () => { throw new Error('Unexpected local DB access'); } } };
    }
    if (name.startsWith('@/')) return load(path.join(root, name.slice(2) + '.ts'));
    return require(name);
  };
  vm.runInThisContext(`(function(require, module, exports) { ${code}\n })`, { filename: absolute })(
    localRequire, module, module.exports
  );
  return module.exports;
}

// Force Supabase mode: guest reads must still avoid network/database operations.
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'fake-key-for-guest-preview-test-long-enough';
const db = load(path.join(root, 'lib/db.ts'));
const { GUEST_AGENCY_ID } = load(path.join(root, 'lib/guest-id.ts'));

test('guest reads return sample data without contacting Supabase', async () => {
  const id = GUEST_AGENCY_ID;
  const agency = await db.getAgencyById(id);
  const listings = await db.listAgencyListings(id, 100);
  const projects = await db.listAgencyProjects(id, 100);
  const leads = await db.listAgencyLeads(id, 100);
  assert.equal(agency.id, id);
  assert.equal(agency.bankAccount, undefined);
  assert.ok(listings.length > 0);
  assert.ok(projects.length > 0);
  assert.ok(leads.length > 0);
  assert.ok([...listings, ...projects, ...leads].every((item) => item.agencyId === id));
  assert.equal(await db.countNewLeads(id), 1);
  assert.equal((await db.getAgencyListing(id, listings[0].id)).id, listings[0].id);
  assert.equal(await db.getAgencyListing(id, 'unknown'), null);
  assert.equal((await db.listAgencyListings(id, 1)).length, 1);
});

test('every direct guest mutation rejects before reaching persistent storage', async () => {
  const id = GUEST_AGENCY_ID;
  const agency = await db.getAgencyById(id);
  const [listing] = await db.listAgencyListings(id);
  const [project] = await db.listAgencyProjects(id);
  const [lead] = await db.listAgencyLeads(id);
  const operations = [
    () => db.updateAgencyProfile(id, agency),
    () => db.createAgencyListing(listing),
    () => db.updateAgencyListing(listing),
    () => db.deleteAgencyListing(id, listing.id),
    () => db.createAgencyProject(project),
    () => db.updateAgencyProject(project),
    () => db.deleteAgencyProject(id, project.id),
    () => db.updateAgencyLeadStatus(id, lead.id, 'closed'),
    () => db.createPublicLead({ agencyId: id, propertyId: listing.id, message: 'sample', type: 'viewing' }),
  ];
  for (const operation of operations) {
    await assert.rejects(operation, (err) => err?.code === 'GUEST_READ_ONLY');
  }
});


test('guest uses a signed HTTP-only session and API writes return 403', async () => {
  process.env.SESSION_SECRET = 'a-long-secret-for-security-regression-tests-only';
  const auth = load(path.join(root, 'lib/auth.ts'));
  const token = auth.makeSessionToken(GUEST_AGENCY_ID);
  assert.deepEqual(auth.readSessionToken(token), { agencyId: GUEST_AGENCY_ID });
  assert.equal(auth.readSessionToken(token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a')), null);
  currentCookie = token;
  assert.equal(auth.sessionCookieOptions(token).httpOnly, true);
  const session = load(path.join(root, 'lib/session.ts'));
  assert.equal((await session.requireApiAgency()).agency.id, GUEST_AGENCY_ID);
  const denied = await session.requireWritableApiAgency();
  assert.equal(denied.error.status, 403);
  assert.equal(denied.error.body.code, 'GUEST_READ_ONLY');
  currentCookie = undefined;
});
