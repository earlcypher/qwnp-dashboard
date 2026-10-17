import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const patterns = [/sk-(?:admin-)?[a-f0-9]{40,}/g, /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g, /sbp_[A-Za-z0-9]{25,}/g, /github_pat_[A-Za-z0-9_]{30,}/g];
let failed = false;
for (const file of new Set(files)) {
  if (/(^|\/)\.env(?:\..+)?$/.test(file) && !file.endsWith('.env.example') || /^(supabase\/(?:\.temp|audits)\/|cookies\.(?:txt|b64)$|headers\.(?:json|b64)$)/.test(file)) {
    console.error('Forbidden tracked/local publication path:', file); failed = true; continue;
  }
  if (/\.(png|jpe?g|gif|webp|ico)$/.test(file)) continue;
  const text = readFileSync(file, 'utf8');
  if (patterns.some(pattern => { pattern.lastIndex = 0; return pattern.test(text); })) {
    console.error('Credential-like literal found; value withheld:', file); failed = true;
  }
}
if (failed) process.exitCode = 1;
else console.log('Repository hygiene passed (working snapshot only; not a history audit).');
