import fg from 'fast-glob';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildKnowledgeIndex, readArticle } from './indexer.js';

const root = process.cwd();
const contentRoot = path.join(root, 'content');
const files = await fg('**/*.md', { cwd: contentRoot, absolute: true });
const articles = await Promise.all(files.map((file) => readArticle(file, contentRoot)));
const index = buildKnowledgeIndex(articles);
await mkdir(path.join(root, 'src/generated'), { recursive: true });
await mkdir(path.join(root, 'public'), { recursive: true });
const json = `${JSON.stringify(index, null, 2)}\n`;
await writeFile(path.join(root, 'src/generated/knowledge-index.json'), json);
await writeFile(path.join(root, 'public/knowledge-index.json'), json);
console.log(`Indexed ${articles.length} articles (${index.unresolvedLinks.length} unresolved, ${index.ambiguousLinks.length} ambiguous)`);
