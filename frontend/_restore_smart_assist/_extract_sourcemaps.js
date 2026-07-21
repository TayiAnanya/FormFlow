/**
 * Prefer source-map sourcesContent (compiled Gemini-era code) over incomplete StrReplace chains.
 */
const fs = require('fs');
const path = require('path');

const MAP_DIR =
  String.raw`C:\Users\Admin\Documents\FormFlow\frontend\dist\test-out\3f4d6a58-33e4-44ac-80c3-d15e153e7e68`;
const OUT =
  String.raw`C:\Users\Admin\Documents\FormFlow\frontend\_restore_smart_assist\recovered`;
const LOG =
  String.raw`C:\Users\Admin\Documents\FormFlow\frontend\_restore_smart_assist\_sourcemap_log.txt`;

const INTERESTING =
  /smart-assist|environments\/|form-host|dynamic-form-renderer|app\.config|document-|ai-extraction|gemini|field-mapping|form-patch|pdf-test/i;
const EXCLUDE = /customer[-_]?profile|node_modules|primeng|@angular|angular:jit:(?!template|style)/i;

function redact(s) {
  return s
    .replace(/(geminiApiKey\s*:\s*['"])([^'"]+)(['"])/g, '$1YOUR_API_KEY_HERE$3')
    .replace(/(['"])(AIza[0-9A-Za-z\-_]{20,})(['"])/g, '$1YOUR_API_KEY_HERE$3')
    .replace(/(['"])(AQ\.[A-Za-z0-9_\-]{20,})(['"])/g, '$1YOUR_API_KEY_HERE$3');
}

const written = new Map();
const log = [];

for (const file of fs.readdirSync(MAP_DIR).filter((f) => f.endsWith('.map'))) {
  let map;
  try {
    map = JSON.parse(fs.readFileSync(path.join(MAP_DIR, file), 'utf8'));
  } catch (e) {
    log.push(`FAIL ${file}: ${e.message}`);
    continue;
  }
  if (!map.sources || !map.sourcesContent) continue;

  for (let i = 0; i < map.sources.length; i++) {
    let src = String(map.sources[i] || '').replace(/\\/g, '/');
    const content = map.sourcesContent[i];
    if (content == null) continue;

    src = src
      .replace(/^angular:jit:template:/, '')
      .replace(/^angular:jit:style:/, '');

    if (EXCLUDE.test(src) && !/smart-assist|dynamic-form-renderer|form-host|environments/.test(src)) {
      continue;
    }
    if (/customer[-_]?profile/.test(src)) continue;
    if (/node_modules|primeng/.test(src)) continue;
    if (!INTERESTING.test(src)) continue;

    // Normalize to paths under frontend/
    let rel = src;
    if (!rel.startsWith('src/')) {
      // e.g. app/features/... from some maps
      if (rel.startsWith('app/') || rel.startsWith('environments/')) {
        rel = 'src/' + rel;
      }
    }

    const text = redact(String(content).replace(/\r\n/g, '\n'));
    const prev = written.get(rel);
    if (prev && prev.length >= text.length) {
      log.push(`SKIP shorter ${rel} from ${file}`);
      continue;
    }

    const outPath = path.join(OUT, ...rel.split('/'));
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, text, 'utf8');
    written.set(rel, text);
    log.push(`WROTE ${rel} (${text.length}) from ${file}`);
  }
}

fs.writeFileSync(LOG, log.join('\n') + `\nDONE ${written.size}\n`, 'utf8');
console.log(`Extracted ${written.size} files`);
for (const k of [...written.keys()].sort()) console.log('  ' + k);
