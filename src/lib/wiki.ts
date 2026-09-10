import MarkdownIt from 'markdown-it';
import type StateInline from 'markdown-it/lib/rules_inline/state_inline.mjs';
import type Token from 'markdown-it/lib/token.mjs';
import type { KnowledgeIndex } from '../../scripts/indexer';

export type TableOfContentsItem = { id: string; level: 2 | 3; text: string };

export function articleUrl(uuid: string, base = import.meta.env.BASE_URL) {
  return `${base}articles/${uuid}/`.replace(/\/+/g, '/');
}

function withoutDuplicateTitle(body: string, title?: string) {
  if (!title) return body;
  const lines = body.split(/\r?\n/);
  const firstContentLine = lines.findIndex((line) => line.trim());
  if (firstContentLine < 0) return body;
  const heading = lines[firstContentLine].match(/^#\s+(.+?)\s*#*\s*$/);
  if (!heading || heading[1].trim() !== title.trim()) return body;
  lines.splice(firstContentLine, 1);
  if (lines[firstContentLine]?.trim() === '') lines.splice(firstContentLine, 1);
  return lines.join('\n');
}

function headingText(token?: Token) {
  return token?.children?.map((child) => child.content).join('') || token?.content || '';
}

function headingId(text: string) {
  return text
    .normalize('NFKC')
    .toLocaleLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{Letter}\p{Number}\-_]/gu, '') || 'section';
}

export function renderMarkdownWithToc(body: string, index: KnowledgeIndex, base = import.meta.env.BASE_URL, title?: string) {
  const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
  const toc: TableOfContentsItem[] = [];
  const usedHeadingIds = new Map<string, number>();
  const lookup = new Map<string, string[]>();
  const add = (value: string, uuid: string) => {
    const key = value.toLocaleLowerCase(); lookup.set(key, [...(lookup.get(key) ?? []), uuid]);
  };
  Object.values(index.articles).forEach((a) => {
    [a.title, ...a.aliases, a.uuid, a.path, a.path.replace(/\.md$/i, '')].forEach((v) => add(v, a.uuid));
  });
  md.inline.ruler.before('link', 'wiki_link', (state: StateInline, silent: boolean) => {
    if (state.src.charCodeAt(state.pos) !== 0x5b || state.src.charCodeAt(state.pos + 1) !== 0x5b) return false;
    const match = state.src.slice(state.pos).match(/^\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/);
    if (!match) return false;
    if (silent) return true;

    const target = match[1].trim();
    const label = (match[2] || target).trim();
    const matches = [...new Set(lookup.get(target.toLocaleLowerCase()) ?? [])];
    if (matches.length === 1) {
      const open = state.push('link_open', 'a', 1);
      open.attrs = [['class', 'wiki-link'], ['href', articleUrl(matches[0], base)]];
      const text = state.push('text', '', 0);
      text.content = label;
      state.push('link_close', 'a', -1);
    } else {
      const status = matches.length ? 'ambiguous' : 'unresolved';
      const open = state.push('wiki_link_open', 'span', 1);
      open.attrs = [
        ['class', `wiki-link ${status}`],
        ['title', status === 'ambiguous' ? '曖昧なリンク' : '未解決リンク'],
      ];
      const text = state.push('text', '', 0);
      text.content = label;
      state.push('wiki_link_close', 'span', -1);
    }
    state.pos += match[0].length;
    return true;
  });
  md.core.ruler.after('inline', 'heading_anchors', (state) => {
    state.tokens.forEach((token, index) => {
      if (token.type !== 'heading_open') return;
      const level = Number(token.tag.slice(1));
      if (level !== 2 && level !== 3) return;
      const text = headingText(state.tokens[index + 1]);
      const baseId = headingId(text);
      const occurrence = (usedHeadingIds.get(baseId) ?? 0) + 1;
      usedHeadingIds.set(baseId, occurrence);
      const id = occurrence === 1 ? baseId : `${baseId}-${occurrence}`;
      token.attrSet('id', id);
      toc.push({ id, level, text });
    });
  });
  const html = md.render(withoutDuplicateTitle(body, title));
  return { html, toc };
}

export function renderMarkdown(body: string, index: KnowledgeIndex, base = import.meta.env.BASE_URL, title?: string) {
  return renderMarkdownWithToc(body, index, base, title).html;
}
