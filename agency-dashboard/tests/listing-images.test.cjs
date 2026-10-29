/** Test demo property image integrity without the Next.js runtime. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
function transpile(relative, jsx = false) {
  const file = path.join(root, relative);
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      ...(jsx ? { jsx: ts.JsxEmit.ReactJSX } : {}),
    },
    reportDiagnostics: true,
  });
  assert.deepEqual(
    (compiled.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error),
    [],
    `TypeScript syntax issue in ${relative}`,
  );
  return compiled.outputText;
}

function loadProperties() {
  const module = { exports: {} };
  new Function('require', 'module', 'exports', transpile('lib/mock/properties.ts'))(
    () => { throw new Error('Unexpected runtime import from property seed'); },
    module,
    module.exports,
  );
  return module.exports.properties;
}

test('the six guest dashboard cards have six distinct lead images', () => {
  const items = loadProperties().filter((p) => p.agencyId === 'agency-1').slice(0, 6);
  assert.deepEqual(items.map((p) => p.id), [
    'prop-1', 'prop-2', 'prop-3', 'prop-4', 'prop-29', 'prop-37',
  ]);
  assert.equal(new Set(items.map((p) => p.images[0])).size, 6);
});

test('property 4 has a verified replacement and actual prop-6 has separate villa imagery', () => {
  const map = new Map(loadProperties().map((p) => [p.id, p]));
  assert.match(map.get('prop-4').images[0], /photo-1600585154340-be6161a56a0c/);
  assert.ok(!map.get('prop-4').images.some((src) => src.includes('photo-1600047509807-ba8f99d2cd00')));
  assert.notEqual(map.get('prop-2').images[0], map.get('prop-37').images[0]);
  assert.notEqual(map.get('prop-2').images[0], map.get('prop-6').images[0]);
  assert.notEqual(map.get('prop-37').images[0], map.get('prop-6').images[0]);
});

test('listing image retries photos, resets when gallery changes, and falls back locally', () => {
  let attempt;
  const react = {
    useState: (initial) => {
      attempt ??= initial;
      return [attempt, (next) => { attempt = typeof next === 'function' ? next(attempt) : next; }];
    },
  };
  const jsx = (type, props) => ({ type, props });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', transpile('components/listing-image.tsx', true))(
    (name) => {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      throw new Error(`Unexpected module: ${name}`);
    }, module, module.exports,
  );
  const render = (images = ['photo-a', 'photo-b']) =>
    module.exports.ListingImage({ images, title: 'Listing' });
  const first = render();
  assert.equal(first.props.src, 'photo-a');
  assert.equal(first.props.alt, 'Listing');
  first.props.onError();
  const second = render();
  assert.equal(second.props.src, 'photo-b');
  // A changed gallery starts at its own first photo, without any effect.
  assert.equal(render(['new-photo']).props.src, 'new-photo');
  assert.equal(render().props.src, 'photo-b');
  second.props.onError();
  const fallback = render();
  assert.equal(fallback.props.src, '/property-placeholder.svg');
  fallback.props.onError();
  assert.equal(render().props.src, '/property-placeholder.svg');
  assert.match(fs.readFileSync(path.join(root, 'public/property-placeholder.svg'), 'utf8'), /<svg/);
});

test('dashboard cards render the resilient listing image component', () => {
  const card = fs.readFileSync(path.join(root, 'components/property-card.tsx'), 'utf8');
  assert.match(card, /<ListingImage images=\{listing\.images\} title=\{listing\.title\}/);
  transpile('components/property-card.tsx', true);
});
