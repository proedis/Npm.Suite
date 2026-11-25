/**
 * The text of a snippet written inside JSX, as a reader should see it: the blank lines around it
 * dropped and the indentation every line shares taken away. Shared by the build, which highlights the
 * snippets, and by the runtime fallback, so both show the same text.
 */
export function dedent(text: string): string {
  const lines = text.replace(/\t/g, '  ').split('\n');

  while (lines.length && !lines[0].trim()) {
    lines.shift();
  }

  while (lines.length && !lines[lines.length - 1].trim()) {
    lines.pop();
  }

  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.length - line.trimStart().length);

  const common = indents.length ? Math.min(...indents) : 0;

  return lines.map((line) => line.slice(common)).join('\n');
}
