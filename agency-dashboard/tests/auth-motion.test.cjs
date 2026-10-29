/** Auth UI regression checks that run without a browser or Supabase. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const jsxRuntime = {
  jsx: (type, props) => ({ type, props }),
  jsxs: (type, props) => ({ type, props }),
};

function loadTsx(relative, imports = {}) {
  const filename = path.join(root, relative);
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
    reportDiagnostics: true,
  });
  const errors = (compiled.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error);
  assert.equal(errors.length, 0, `TypeScript syntax error in ${relative}`);
  const module = { exports: {} };
  const getModule = (name) => {
    if (name === 'react/jsx-runtime') return jsxRuntime;
    if (name in imports) return imports[name];
    if (name === 'next/image' || name === 'next/link') return () => null;
    throw new Error(`Unexpected import in ${relative}: ${name}`);
  };
  new Function('require', 'module', 'exports', compiled.outputText)(getModule, module, module.exports);
  return module.exports;
}

test('password input keeps default border, focus treatment and show/hide padding', () => {
  const { Input, Textarea } = loadTsx('components/ui.tsx');
  const node = Input({ type: 'password', className: 'pr-12', placeholder: 'Password' });
  assert.equal(node.type, 'input');
  assert.equal(node.props.type, 'password');
  assert.match(node.props.className, /border-line/);
  assert.match(node.props.className, /rounded-xl/);
  assert.match(node.props.className, /focus:ring-4/);
  assert.match(node.props.className, /pr-12/);
  const textarea = Textarea({ className: 'custom-extra' });
  assert.match(textarea.props.className, /border-line/);
  assert.match(textarea.props.className, /custom-extra/);
});

function splashHarness(reducedMotion = false) {
  const state = [];
  const refs = [];
  let hook = 0;
  let effect;
  let now = 0;
  let nextId = 1;
  const timers = new Map();
  const storage = new Map();
  const react = {
    useState(initial) {
      const id = hook++;
      if (!(id in state)) state[id] = initial;
      return [state[id], (value) => { state[id] = typeof value === 'function' ? value(state[id]) : value; }];
    },
    useRef(initial) {
      const id = hook++;
      if (!(id in refs)) refs[id] = { current: initial };
      return refs[id];
    },
    useEffect(callback) { effect = callback; },
  };
  const previousWindow = global.window;
  const previousStorage = global.sessionStorage;
  global.window = {
    matchMedia: () => ({ matches: reducedMotion }),
    setTimeout: (callback, delay) => {
      const id = nextId++;
      timers.set(id, { callback, at: now + delay });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
  };
  global.sessionStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  };
  const { FirstVisitSplash } = loadTsx('components/first-visit-splash.tsx', { react });
  function render() { hook = 0; return FirstVisitSplash(); }
  function advance(ms) {
    const target = now + ms;
    while (true) {
      const due = [...timers.entries()].sort((a, b) => a[1].at - b[1].at)
        .find(([, timer]) => timer.at <= target);
      if (!due) break;
      now = due[1].at;
      timers.delete(due[0]);
      due[1].callback();
    }
    now = target;
    return render();
  }
  return {
    render,
    start: () => effect(),
    advance,
    getStorage: () => storage,
    cleanup: () => { global.window = previousWindow; global.sessionStorage = previousStorage; },
  };
}

test('splash fades upward over the last 750ms and is gone at 5 seconds', () => {
  const app = splashHarness();
  try {
    assert.equal(app.render(), null);
    const firstEffectCleanup = app.start();
    // Simulate React Strict Mode's development-only effect teardown / re-run.
    firstEffectCleanup();
    app.start();
    assert.ok(app.render());
    assert.ok(app.advance(4249));
    const fade = app.advance(1);
    assert.match(fade.props.className, /splash-exit/);
    assert.equal(fade.props['aria-hidden'], true);
    assert.ok(app.advance(749));
    assert.equal(app.advance(1), null);
    assert.equal(app.getStorage().get('nyumba:agency:splash:v2:seen'), '1');
  } finally { app.cleanup(); }
});

test('reduced-motion users are not forced through a five-second animation', () => {
  const app = splashHarness(true);
  try {
    app.render();
    app.start();
    assert.ok(app.render());
    assert.ok(app.advance(349));
    assert.equal(app.advance(1), null);
  } finally { app.cleanup(); }
});
