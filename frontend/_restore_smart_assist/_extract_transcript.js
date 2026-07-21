/**
 * Extract final Smart Assist file versions from agent transcript JSONL.
 * Stops BEFORE Customer Profile cleanup deletion (line ~542).
 */
const fs = require('fs');
const path = require('path');

const TRANSCRIPT = String.raw`C:\Users\Admin\.cursor\projects\c-Users-Admin-Documents-FormFlow\agent-transcripts\e4eb6e37-2161-4aed-868c-8fff5ff5591a\e4eb6e37-2161-4aed-868c-8fff5ff5591a.jsonl`;
const OUT_DIR = String.raw`C:\Users\Admin\Documents\FormFlow\frontend\_restore_smart_assist`;
const FRONTEND = String.raw`C:\Users\Admin\Documents\FormFlow\frontend`;
const CUTOFF_LINE = 542; // user asked to remove Customer Profile; assistant deleted smart-assist after

const INTERESTING = /(smart-assist|environments[/\\]|proxy\.conf|AIExtraction|gemini|form-host|dynamic-form-renderer|app\.config\.ts|angular\.json|package\.json)/i;
const EXCLUDE = /customer[-_]?profile/i;

function normalizePath(p) {
  if (!p) return null;
  const m = p.match(/FormFlow[/\\]frontend[/\\](.+)$/i);
  if (!m) return null;
  const rel = m[1].replace(/\\/g, '/');
  if (EXCLUDE.test(rel)) return null;
  if (!INTERESTING.test(rel)) return null;
  if (rel.startsWith('_restore_smart_assist')) return null;
  if (rel.includes('node_modules')) return null;
  return rel;
}

function walk(obj, acc) {
  if (!obj) return;
  if (Array.isArray(obj)) {
    for (const item of obj) walk(item, acc);
    return;
  }
  if (typeof obj === 'object') {
    if (obj.type === 'tool_use' && ['Write', 'StrReplace', 'Delete'].includes(obj.name)) {
      acc.push(obj);
    }
    for (const v of Object.values(obj)) walk(v, acc);
  }
}

function applyStrReplace(content, oldStr, newStr, replaceAll) {
  if (!content.includes(oldStr)) return null;
  if (replaceAll) return content.split(oldStr).join(newStr);
  return content.replace(oldStr, newStr);
}

function redact(content) {
  let c = content;
  c = c.replace(/(geminiApiKey\s*:\s*['"])([^'"]+)(['"])/g, '$1YOUR_API_KEY_HERE$3');
  c = c.replace(/(apiKey\s*:\s*['"])(AIza[^'"]+)(['"])/g, '$1YOUR_API_KEY_HERE$3');
  c = c.replace(/(['"])(AIza[0-9A-Za-z\-_]{20,})(['"])/g, '$1YOUR_API_KEY_HERE$3');
  return c;
}

const files = new Map();
const history = new Map();
const writeCounts = new Map();
const strreplaceFail = [];
const deletedPaths = new Set();

const raw = fs.readFileSync(TRANSCRIPT, 'utf8');
const lines = raw.split(/\r?\n/);
console.log(`Total lines: ${lines.length}, cutoff: ${CUTOFF_LINE}`);

for (let i = 0; i < lines.length; i++) {
  const lineNo = i + 1;
  if (lineNo >= CUTOFF_LINE) break;
  const line = lines[i].trim();
  if (!line) continue;

  let rec;
  try {
    rec = JSON.parse(line);
  } catch {
    continue;
  }

  const tools = [];
  walk(rec.message && rec.message.content, tools);
  walk(rec.content, tools);

  for (const tool of tools) {
    const inp = tool.input || {};
    const rel = normalizePath(inp.path);
    if (!rel) continue;

    if (!history.has(rel)) history.set(rel, []);
    const hist = history.get(rel);

    if (tool.name === 'Write') {
      if (inp.contents == null) continue;
      files.set(rel, inp.contents);
      writeCounts.set(rel, (writeCounts.get(rel) || 0) + 1);
      hist.push({ lineNo, op: 'Write', note: `len=${inp.contents.length}` });
    } else if (tool.name === 'StrReplace') {
      let base = files.get(rel);
      if (base == null) {
        const disk = path.join(FRONTEND, ...rel.split('/'));
        if (fs.existsSync(disk)) {
          base = fs.readFileSync(disk, 'utf8');
          files.set(rel, base);
        } else {
          strreplaceFail.push(`L${lineNo}: no base for ${rel}`);
          hist.push({ lineNo, op: 'StrReplace_FAIL_NO_BASE', note: '' });
          continue;
        }
      }
      const result = applyStrReplace(base, inp.old_string || '', inp.new_string || '', !!inp.replace_all);
      if (result == null) {
        strreplaceFail.push(`L${lineNo}: old_string not found in ${rel}`);
        hist.push({ lineNo, op: 'StrReplace_FAIL', note: '' });
      } else {
        files.set(rel, result);
        hist.push({ lineNo, op: 'StrReplace_OK', note: '' });
      }
    } else if (tool.name === 'Delete') {
      files.delete(rel);
      deletedPaths.add(rel);
      hist.push({ lineNo, op: 'Delete', note: '' });
    }
  }
}

const recoveredRoot = path.join(OUT_DIR, 'recovered');
fs.mkdirSync(recoveredRoot, { recursive: true });

const inventory = [];
for (const [rel, content] of [...files.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const redacted = redact(content);
  const outPath = path.join(recoveredRoot, ...rel.split('/'));
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, redacted, 'utf8');
  const hist = history.get(rel) || [];
  const last = hist[hist.length - 1];
  inventory.push({
    path: rel,
    bytes: Buffer.byteLength(redacted, 'utf8'),
    writes: writeCounts.get(rel) || 0,
    ops: hist.length,
    last_op: last ? `L${last.lineNo} ${last.op}` : '?',
    deleted_later: deletedPaths.has(rel),
  });
}

let md = `# Smart Assist Recovery Inventory\n\n`;
md += `Cutoff: line ${CUTOFF_LINE} (before Customer Profile cleanup).\n`;
md += `Files recovered: ${inventory.length}\n`;
md += `StrReplace failures: ${strreplaceFail.length}\n\n`;
md += `## Recovered files\n\n`;
for (const item of inventory) {
  md += `- \`${item.path}\` — ${item.bytes} bytes, ${item.writes} Write(s), last=${item.last_op}\n`;
}
md += `\n## StrReplace failures\n\n`;
for (const f of strreplaceFail) md += `- ${f}\n`;
md += `\n## Operation history\n\n`;
for (const rel of [...history.keys()].sort()) {
  if (rel.includes('node_modules')) continue;
  md += `### \`${rel}\`\n`;
  for (const e of history.get(rel)) {
    md += `- L${e.lineNo}: ${e.op} ${e.note}\n`.trimEnd() + '\n';
  }
  md += '\n';
}

fs.writeFileSync(path.join(OUT_DIR, 'INVENTORY.md'), md, 'utf8');
fs.writeFileSync(
  path.join(OUT_DIR, 'inventory.json'),
  JSON.stringify({ cutoff: CUTOFF_LINE, files: inventory, strreplace_failures: strreplaceFail }, null, 2),
  'utf8',
);

console.log(`Recovered ${inventory.length} files to ${recoveredRoot}`);
for (const item of inventory) {
  console.log(`  ${item.path} (${item.bytes}b) last=${item.last_op}`);
}
if (strreplaceFail.length) {
  console.log(`\nStrReplace failures (${strreplaceFail.length}):`);
  for (const f of strreplaceFail.slice(0, 40)) console.log('  ' + f);
}
