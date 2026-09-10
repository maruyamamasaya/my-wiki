import matter from 'gray-matter';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type LinkStatus = 'resolved' | 'unresolved' | 'ambiguous';
export interface ParsedArticle {
  uuid: string; title: string; aliases: string[]; tags: string[];
  created: string; updated: string; path: string; body: string; wikiLinks: string[];
}
export interface LinkResult { label: string; status: LinkStatus; uuid?: string; candidates?: string[] }
export interface IndexedArticle extends ParsedArticle {
  outgoingLinks: LinkResult[]; backlinks: string[];
}
export interface KnowledgeIndex {
  generatedAt: string; articles: Record<string, IndexedArticle>;
  unresolvedLinks: Array<{ sourceUuid: string; label: string }>;
  ambiguousLinks: Array<{ sourceUuid: string; label: string; candidates: string[] }>;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WIKI_LINK = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g;
const asStrings = (value: unknown) => Array.isArray(value) ? value.map(String) : value ? [String(value)] : [];
const dateString = (value: unknown) => value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? '');

export function parseArticle(source: string, relativePath: string): ParsedArticle {
  const { data, content } = matter(source);
  const uuid = String(data.id ?? '');
  const title = String(data.title ?? '').trim();
  if (!UUID.test(uuid)) throw new Error(`${relativePath}: valid UUID front matter "id" is required`);
  if (!title) throw new Error(`${relativePath}: front matter "title" is required`);
  const wikiLinks = [...content.matchAll(WIKI_LINK)].map((match) => match[1].trim()).filter(Boolean);
  return {
    uuid, title, aliases: asStrings(data.aliases), tags: asStrings(data.tags),
    created: dateString(data.created), updated: dateString(data.updated),
    path: relativePath.replaceAll('\\', '/'), body: content.trim(), wikiLinks: [...new Set(wikiLinks)],
  };
}

export function buildKnowledgeIndex(input: ParsedArticle[], generatedAt = new Date().toISOString()): KnowledgeIndex {
  const articles: Record<string, IndexedArticle> = {};
  for (const article of input) {
    if (articles[article.uuid]) throw new Error(`Duplicate UUID: ${article.uuid}`);
    articles[article.uuid] = { ...article, outgoingLinks: [], backlinks: [] };
  }
  const lookup = new Map<string, Set<string>>();
  const add = (key: string, uuid: string) => {
    const normalized = key.trim().toLocaleLowerCase();
    if (!normalized) return;
    const values = lookup.get(normalized) ?? new Set<string>(); values.add(uuid); lookup.set(normalized, values);
  };
  for (const article of Object.values(articles)) {
    add(article.uuid, article.uuid); add(article.path, article.uuid);
    add(article.path.replace(/\.md$/i, ''), article.uuid); add(path.basename(article.path, '.md'), article.uuid);
    add(article.title, article.uuid); article.aliases.forEach((alias) => add(alias, article.uuid));
  }
  const unresolvedLinks: KnowledgeIndex['unresolvedLinks'] = [];
  const ambiguousLinks: KnowledgeIndex['ambiguousLinks'] = [];
  for (const article of Object.values(articles)) {
    article.outgoingLinks = article.wikiLinks.map((label) => {
      const candidates = [...(lookup.get(label.toLocaleLowerCase()) ?? [])];
      if (candidates.length === 1) {
        const target = candidates[0];
        if (!articles[target].backlinks.includes(article.uuid)) articles[target].backlinks.push(article.uuid);
        return { label, status: 'resolved', uuid: target };
      }
      if (candidates.length > 1) {
        ambiguousLinks.push({ sourceUuid: article.uuid, label, candidates });
        return { label, status: 'ambiguous', candidates };
      }
      unresolvedLinks.push({ sourceUuid: article.uuid, label });
      return { label, status: 'unresolved' };
    });
  }
  return { generatedAt, articles, unresolvedLinks, ambiguousLinks };
}

export async function readArticle(file: string, contentRoot: string) {
  return parseArticle(await readFile(file, 'utf8'), path.relative(contentRoot, file));
}
