import MarkdownIt from 'markdown-it';
import type { KnowledgeIndex } from '../../scripts/indexer';

export function articleUrl(uuid: string, base = import.meta.env.BASE_URL) {
  return `${base}articles/${uuid}/`.replace(/\/+/g, '/');
}

export function renderMarkdown(body: string, index: KnowledgeIndex) {
  const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
  const lookup = new Map<string, string[]>();
  const add = (value: string, uuid: string) => {
    const key = value.toLocaleLowerCase(); lookup.set(key, [...(lookup.get(key) ?? []), uuid]);
  };
  Object.values(index.articles).forEach((a) => {
    [a.title, ...a.aliases, a.uuid, a.path, a.path.replace(/\.md$/i, '')].forEach((v) => add(v, a.uuid));
  });
  const escaped = body.replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g, (_, target, label) => {
    const matches = [...new Set(lookup.get(String(target).trim().toLocaleLowerCase()) ?? [])];
    const text = md.utils.escapeHtml(String(label || target).trim());
    if (matches.length === 1) return `<a class="wiki-link" href="${articleUrl(matches[0])}">${text}</a>`;
    const state = matches.length ? 'ambiguous' : 'unresolved';
    return `<span class="wiki-link ${state}" title="${state === 'ambiguous' ? '曖昧なリンク' : '未解決リンク'}">${text}</span>`;
  });
  return md.render(escaped);
}
