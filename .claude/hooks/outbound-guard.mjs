#!/usr/bin/env node
/*
 * PreToolUse hook on Bash: every command that leaves the machine asks for a confirmation, whatever
 * permission mode the session runs in. It answers `ask`, never `deny`: pushing or publishing is
 * allowed when the human asks for it, and never as a step nobody asked for.
 *
 * The permission rules in settings.json cover the plain forms; this covers the forms a prefix rule
 * misses (`git -C . push`, `git -c x=y push`, a command chained after `&&`).
 */

import { readFileSync } from 'node:fs';


/* --------
 * Constants Definition
 * -------- */

const OUTBOUND = [
  [ /\bgit(?:\s+(?:-C|-c)\s+\S+|\s+--?[\w-]+(?:=\S+)?)*\s+push\b/, 'git push' ],
  /* `npm@11` too: the release rules configure trusted publishing through `npx -y npm@11 trust` */
  [ /\b(?:npm|pnpm)(?:@[\w.-]+)?\s+(?:[^\s;&|]+\s+)*?(?:publish|unpublish|deprecate|dist-tag|trust|owner|access)\b/, 'npm registry' ],
  [ /\byarn\s+npm\s+publish\b/, 'yarn npm publish' ],
  [ /\blerna\s+(?:publish|version)\b/, 'lerna publish / version' ],
  [ /\brelease:(?:version|finalize|publish)\b/, 'release script' ],
  [ /\bgh\s+workflow\s+run\b/, 'GitHub workflow run' ],
  [ /\bgh\s+release\s+(?:create|edit|upload|delete)\b/, 'GitHub release' ],
  [ /\bgh\s+pr\s+(?:create|merge|edit|comment|review|close|ready)\b/, 'GitHub pull request' ],
  [ /\bgh\s+api\b(?=[^;&|]*\s(?:-X|--method)[\s=]*(?:POST|PUT|PATCH|DELETE)\b)/i, 'GitHub API write' ]
];


/* --------
 * Hook
 * -------- */

let command = '';

try {
  command = JSON.parse(readFileSync(0, 'utf8'))?.tool_input?.command ?? '';
}
catch {
  process.exit(0);
}

const hit = OUTBOUND.find(([ pattern ]) => pattern.test(command));

if (hit) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName           : 'PreToolUse',
      permissionDecision      : 'ask',
      permissionDecisionReason: `${hit[1]} leaves the machine: in this repository it runs only when explicitly asked.`
    }
  }));
}

process.exit(0);
