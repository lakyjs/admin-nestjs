const pico = require('picocolors');
const { readFileSync } = require('fs');
const path = require('path');

const msgPath = path.resolve('.git/COMMIT_EDITMSG');
const msg = readFileSync(msgPath, 'utf-8').trim();

const commitRE = /^(revert: )?(feat|fix|docs|style|refactor|perf|test|build|ci|chore)(\(.+\))?: .{1,50}/;

if (!commitRE.test(msg)) {
  console.log();
  console.error(
    `  ${pico.white(pico.bgRed(' ERROR '))} ${pico.red(`invalid commit message format.`)}\n\n` +
      pico.red(`  Proper commit message format is required for automated changelog generation. Examples:\n\n`) +
      `    ${pico.green(`feat(compiler): add 'comments' option`)}\n` +
      `    ${pico.green(`fix(v-model): handle events on blur (close #28)`)}\n\n` +
      pico.red(`  See .github/commit-convention.md for more details.\n`)
  );
  process.exit(1);
}
