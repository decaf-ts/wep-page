// Build-time script to generate www/assets/modules.json from repo modules and workdocs (CommonJS)
const fs = require('fs');
const path = require('path');

function safeRead(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

function extractExamples(md) {
  const blocks = [];
  const re = /```[a-zA-Z0-9\-_.]*\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(md))) { blocks.push(m[1]); }
  return blocks;
}

function main() {
  const repoRoot = path.resolve(__dirname, '..', '..', '..');
  const modulesList = require(path.join(repoRoot, 'bin', 'modules.js'));
  const outDir = path.join(repoRoot, 'web-page', 'www', 'assets');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const data = modulesList
    .filter((m) => m && m !== 'web-page')
    .map((name) => {
      const base = path.join(repoRoot, name);
      const desc = safeRead(path.join(base, 'workdocs', '4-Description.md'));
      const howto = safeRead(path.join(base, 'workdocs', '5-HowToUse.md'));
      const examples = [];
      examples.push(...extractExamples(desc));
      examples.push(...extractExamples(howto));
      return {
        name,
        title: name,
        description: desc || howto,
        examples,
        base_path: name,
      };
    });

  const outFile = path.join(outDir, 'modules.json');
  fs.writeFileSync(outFile, JSON.stringify(data, null, 2));
  console.log('[build-modules-data] Wrote', outFile, 'with', data.length, 'modules');
}

if (require.main === module) main();
