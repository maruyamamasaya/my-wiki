import matter from 'gray-matter';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface PreparedImport {
  markdown: string;
  title: string;
  uuid: string;
  generatedUuid: boolean;
}

const strings = (value: unknown) => Array.isArray(value) ? value.map(String) : value ? [String(value)] : [];
const validDate = (value: unknown) => /^\d{4}-\d{2}-\d{2}$/.test(String(value ?? ''));

export function titleFromMarkdown(source: string, filename: string) {
  const parsed = matter(source);
  const configured = String(parsed.data.title ?? '').trim();
  if (configured) return configured;
  const heading = parsed.content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return heading || path.basename(filename, path.extname(filename)).replace(/[-_]+/g, ' ').trim() || 'Untitled';
}

export function prepareImport(
  source: string,
  filename: string,
  today: string,
  usedUuids: Set<string>,
  createUuid = randomUUID,
): PreparedImport {
  const parsed = matter(source);
  const originalUuid = String(parsed.data.id ?? '');
  const generatedUuid = !UUID.test(originalUuid) || usedUuids.has(originalUuid);
  let uuid = generatedUuid ? createUuid() : originalUuid;
  while (usedUuids.has(uuid)) uuid = createUuid();
  usedUuids.add(uuid);
  const title = titleFromMarkdown(source, filename);
  const data = {
    ...parsed.data,
    id: uuid,
    title,
    aliases: strings(parsed.data.aliases),
    created: validDate(parsed.data.created) ? String(parsed.data.created) : today,
    updated: validDate(parsed.data.updated) ? String(parsed.data.updated) : today,
    tags: strings(parsed.data.tags),
  };
  return { markdown: matter.stringify(parsed.content.trimStart(), data), title, uuid, generatedUuid };
}

export function safeRelativeMarkdownPath(relativePath: string) {
  const normalized = relativePath.replaceAll('\\', '/').replace(/^\/+/, '');
  if (!normalized || normalized === '.' || normalized.split('/').includes('..')) throw new Error(`Unsafe import path: ${relativePath}`);
  return normalized.replace(/\.markdown$/i, '.md');
}
