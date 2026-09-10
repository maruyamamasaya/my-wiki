import fg from 'fast-glob';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildKnowledgeIndex, parseArticle, readArticle } from './indexer.js';
import { prepareImport, safeRelativeMarkdownPath } from './importer.js';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const sourceArg = args.find((arg) => !arg.startsWith('--'));
const destinationArg = args.find((arg) => arg.startsWith('--destination='))?.slice('--destination='.length) ?? 'imported';
if (!sourceArg) throw new Error('Usage: npm run import -- <source-directory> [--destination=imported] [--apply]');

const root = process.cwd();
const contentRoot = path.join(root, 'content');
const sourceRoot = path.resolve(sourceArg);
const destination = safeRelativeMarkdownPath(destinationArg).replace(/\.md$/i, '');
if (sourceRoot === contentRoot || sourceRoot.startsWith(`${contentRoot}${path.sep}`)) {
  throw new Error('The source directory must be outside content/.');
}

const dateInJapan = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());
const existingFiles = await fg('**/*.md', { cwd: contentRoot, absolute: true });
const existing = await Promise.all(existingFiles.map((file) => readArticle(file, contentRoot)));
const usedUuids = new Set(existing.map((article) => article.uuid));
const incomingFiles = await fg('**/*.{md,markdown}', { cwd: sourceRoot, absolute: true, dot: false });
if (!incomingFiles.length) throw new Error(`No Markdown files found in ${sourceRoot}`);

const planned: Array<{ source: string; target: string; markdown: string; generatedUuid: boolean; title: string }> = [];
for (const file of incomingFiles.sort()) {
  const relative = safeRelativeMarkdownPath(path.relative(sourceRoot, file));
  let target = path.join(contentRoot, destination, relative);
  let suffix = 2;
  while (true) {
    try {
      await access(target);
      const extension = path.extname(target);
      target = `${target.slice(0, -extension.length)}-${suffix++}${extension}`;
    } catch {
      if (!planned.some((item) => item.target === target)) break;
      const extension = path.extname(target);
      target = `${target.slice(0, -extension.length)}-${suffix++}${extension}`;
    }
  }
  const prepared = prepareImport(await readFile(file, 'utf8'), file, dateInJapan, usedUuids);
  planned.push({ source: file, target, ...prepared });
}

const imported = planned.map((item) => {
  const relative = path.relative(contentRoot, item.target);
  return parseArticle(item.markdown, relative);
});
buildKnowledgeIndex([...existing, ...imported]);

console.log(`${apply ? 'Importing' : 'Previewing'} ${planned.length} Markdown files into content/${destination}/`);
for (const item of planned) {
  const marker = item.generatedUuid ? 'new UUID' : 'kept UUID';
  console.log(`- ${path.relative(sourceRoot, item.source)} -> ${path.relative(root, item.target)} (${marker}, ${item.title})`);
}

if (!apply) {
  console.log('\nDry run only. Re-run with --apply to write these files.');
} else {
  for (const item of planned) {
    await mkdir(path.dirname(item.target), { recursive: true });
    await writeFile(item.target, item.markdown, { flag: 'wx' });
  }
  console.log(`\nImported ${planned.length} files. Run npm run check before committing.`);
}
