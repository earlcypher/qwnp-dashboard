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
const { normalizeCookiePaste, getCookieExportNames }=await import(pathToFileURL(join(out,'cookieUtils.js')).href);
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

test('extracts required authentication cookies from fully concatenated browser rows',()=>{
 const sample=[
  '*bl*uid'+'v_bl'+'chat.qwen.ai/2026-12-17T17:54:26.488Z35Medium',
  'qwen-theme'+'dark'+ 'chat.qwen.ai/2027-04-15T18:45:27.024Z14Medium',
  'refresh_token'+'synthetic.jwt.value'+'.qwen.ai/2026-11-16T18:45:25.931Z310✓✓LaxMedium',
  'ssxmod_itna'+'synthetic_cookie_value'+'.qwen.ai/Session11✓NoneMedium'
 ].join('');
 const out=normalizeCookiePaste(sample);
 assert.match(out,/\t_bl_uid\tv_bl/);assert.match(out,/\tqwen-theme\tdark/);
 assert.match(out,/\trefresh_token\tsynthetic\.jwt\.value/);assert.match(out,/\tssxmod_itna\tsynthetic_cookie_value/);
 assert.deepEqual(getCookieExportNames(sample),['_bl_uid','qwen-theme','refresh_token','ssxmod_itna']);
});
test('extracts required names across Qwen, Alibaba-domain, SameSite and flattened metadata rows',()=>{
 const names=['*bl*uid','_c_WBKFRo','_gcl_au','acw_tc','atpsida','aui','cbc','cna','cnaui','isg','qwen-locale','qwen-theme','qwen-thinking_mode','refresh_token','sca','ssxmod_itna','ssxmod_itna2','tfstk','x-ap','xlly_s'];
 const flat=names.map((name,i)=>`${name}v${i}${i===6?'.alibaba.com':i%2?'chat.qwen.ai':'.qwen.ai'}/${i%3===0?'Session':'2027-04-15T18:45:25.000Z'}${10+i}${i%4===0?'✓✓Lax':i%3===0?'✓None':''}Medium`).join('');
 const extracted=getCookieExportNames(flat);assert.equal(extracted.length,names.length);assert.ok(extracted.includes('refresh_token'));assert.ok(extracted.includes('cbc'));assert.ok(extracted.includes('xlly_s'));assert.equal(extracted[0],'_bl_uid');
});
