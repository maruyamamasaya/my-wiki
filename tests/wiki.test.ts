import { describe, expect, it } from 'vitest';
import { buildKnowledgeIndex, parseArticle } from '../scripts/indexer';
import { renderMarkdown } from '../src/lib/wiki';

const openShiftId = '8b6df7d2-4e2e-4f73-9288-a933e65d8321';
const duplicateId = '12b5bcc6-bb25-4dc2-8edc-c0a71dbb6354';
const article = (id: string, title: string, aliases: string[] = []) =>
  parseArticle(`---\nid: ${id}\ntitle: ${title}\naliases: [${aliases.join(',')}]\ncreated: 2026-09-10\nupdated: 2026-09-10\ntags: [test]\n---\n`, `${id}.md`);

describe('renderMarkdown wiki links', () => {
  const index = buildKnowledgeIndex([article(openShiftId, 'OpenShift', ['OCP'])]);
  const render = (markdown: string) => renderMarkdown(markdown, index, '/my-wiki/');

  it('renders standalone and inline wiki links as real UUID-based links', () => {
    expect(render('[[OpenShift]]')).toContain(`<a class="wiki-link" href="/my-wiki/articles/${openShiftId}/">OpenShift</a>`);
    expect(render('文章中の [[OpenShift]] です。')).toContain(`文章中の <a class="wiki-link" href="/my-wiki/articles/${openShiftId}/">OpenShift</a> です。`);
  });

  it('supports display labels and headings without changing target resolution', () => {
    expect(render('[[OpenShift|OpenShift Platform]]')).toContain('>OpenShift Platform</a>');
    expect(render('[[OpenShift#概要]]')).toContain(`href="/my-wiki/articles/${openShiftId}/"`);
  });

  it('preserves unresolved and ambiguous link states', () => {
    expect(render('[[Missing]]')).toContain('<span class="wiki-link unresolved" title="未解決リンク">Missing</span>');
    const ambiguous = buildKnowledgeIndex([
      article(openShiftId, 'OpenShift'),
      article(duplicateId, 'Other', ['OpenShift']),
    ]);
    expect(renderMarkdown('[[OpenShift]]', ambiguous, '/my-wiki/')).toContain(
      '<span class="wiki-link ambiguous" title="曖昧なリンク">OpenShift</span>',
    );
  });

  it('escapes wiki labels and keeps raw HTML disabled', () => {
    expect(render('[[OpenShift|<img src=x onerror=alert(1)>]]')).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(render('<script>alert(1)</script>')).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(render('<script>alert(1)</script>')).not.toContain('<script>');
  });

  it('keeps standard Markdown links and block rendering intact', () => {
    const html = render('# Heading\n\n- [[OpenShift]]\n- [GitHub](https://github.com/)\n\n```html\n[[OpenShift]]\n```');
    expect(html).toContain('<h1>Heading</h1>');
    expect(html).toContain('<ul>');
    expect(html).toContain('<a href="https://github.com/">GitHub</a>');
    expect(html).toContain('<code class="language-html">[[OpenShift]]');
  });

  it('renders emphasis and GitHub-style tables', () => {
    const html = render('**重要**\n\n| 項目 | 内容 |\n| --- | --- |\n| 状態 | 完了 |');
    expect(html).toContain('<strong>重要</strong>');
    expect(html).toContain('<table>');
    expect(html).toContain('<th>項目</th>');
    expect(html).toContain('<td>完了</td>');
  });

  it('omits only a leading H1 that duplicates the page title', () => {
    const html = renderMarkdown('# OpenShift\n\n本文\n\n# 別の見出し', index, '/my-wiki/', 'OpenShift');
    expect(html).not.toContain('<h1>OpenShift</h1>');
    expect(html).toContain('<p>本文</p>');
    expect(html).toContain('<h1>別の見出し</h1>');
  });
});
