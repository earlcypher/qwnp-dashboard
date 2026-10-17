import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const out=mkdtempSync(join(tmpdir(),'cookie-utils-'));
writeFileSync(join(out,'package.json'),JSON.stringify({type:'module'}));
execFileSync(resolve('node_modules/.bin/tsc'),['--ignoreConfig','lib/cookieUtils.ts','--module','ESNext','--target','ES2022','--outDir',out,'--skipLibCheck'],{stdio:'pipe'});
const { normalizeCookiePaste }=await import(pathToFileURL(join(out,'cookieUtils.js')).href);
test.after(()=>rmSync(out,{recursive:true,force:true}));
test('normalizes multi-line browser cookie tables and ignores their column header',()=>{
 const out=normalizeCookiePaste('Name\tValue\tDomain\tPath\tExpires\tSize\nalpha\tone\t.qwen.ai\t/\tSession\t3\nbeta\ttwo\tchat.qwen.ai\t/\t2027-01-01T00:00:00Z\t3');
 assert.match(out,/alpha/);assert.match(out,/beta/);assert.equal(out.split('\n').filter(x=>x.includes('\t')).length,2);
});
test('normalizes flattened TSV rows separated by spaces',()=>{
 const flat='alpha\tone\t.qwen.ai\t/\tSession\t3\t\t\tNone\tMedium beta\ttwo\tchat.qwen.ai\t/\t2027-01-01T00:00:00Z\t3\t\t\tNone\tMedium';
 const out=normalizeCookiePaste(flat);assert.match(out,/alpha\tone/);assert.match(out,/beta\ttwo/);
});
test('accepts Cookie headers and preserves equals signs in values',()=>{
 const out=normalizeCookiePaste('Cookie: alpha=a=b==; beta=two');assert.match(out,/alpha\ta=b==/);assert.match(out,/beta\ttwo/);
});
