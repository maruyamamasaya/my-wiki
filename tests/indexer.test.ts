import { describe, expect, it } from 'vitest';
import { buildKnowledgeIndex, parseArticle } from '../scripts/indexer';
import { prepareImport, safeRelativeMarkdownPath, titleFromMarkdown } from '../scripts/importer';
import { dateInJapan, dateTimeInJapan } from '../src/lib/datetime';
const idA='8b6df7d2-4e2e-4f73-9288-a933e65d8321', idB='12b5bcc6-bb25-4dc2-8edc-c0a71dbb6354';
const md=(id:string,title:string,body='',aliases:string[]=[] )=>`---\nid: ${id}\ntitle: ${title}\naliases: [${aliases.join(',')}]\ncreated: 2026-09-10\nupdated: 2026-09-10\ntags: [test]\n---\n${body}`;
describe('knowledge index',()=>{
  it('keeps identity and resolves backlinks after a path move/rename',()=>{const a=parseArticle(md(idA,'OpenShift','[[Virtualization]]'),'moved/redhat.md');const b=parseArticle(md(idB,'Virtualization'),'new/place/vm.md');const i=buildKnowledgeIndex([a,b]);expect(i.articles[idA].path).toBe('moved/redhat.md');expect(i.articles[idB].backlinks).toEqual([idA]);});
  it('resolves aliases and UUIDs',()=>{const a=parseArticle(md(idA,'Source','[[OCP]]\n[['+idB+']]'),'a.md');const b=parseArticle(md(idB,'Renamed','',['OCP']),'b.md');const i=buildKnowledgeIndex([a,b]);expect(i.articles[idA].outgoingLinks.every(x=>x.uuid===idB)).toBe(true);});
  it('preserves UUID when title changes',()=>{const a=parseArticle(md(idA,'New title'),'renamed.md');expect(a.uuid).toBe(idA);expect(a.title).toBe('New title');});
  it('reports unresolved links',()=>{const a=parseArticle(md(idA,'A','[[Missing]]'),'a.md');expect(buildKnowledgeIndex([a]).unresolvedLinks[0].label).toBe('Missing');});
  it('does not guess duplicate titles or aliases',()=>{const a=parseArticle(md(idA,'Same'),'a.md');const b=parseArticle(md(idB,'Other','',['Same']),'b.md');const i=buildKnowledgeIndex([a,b]);expect(i.ambiguousLinks).toHaveLength(0);const source=parseArticle(md('7f3e9250-e521-4d31-a3d2-414f16bb510c','Source','[[Same]]'),'source.md');const j=buildKnowledgeIndex([a,b,source]);expect(j.ambiguousLinks[0].candidates).toEqual(expect.arrayContaining([idA,idB]));});
  it('rejects duplicate UUIDs',()=>{const a=parseArticle(md(idA,'A'),'a.md');const b=parseArticle(md(idA,'B'),'b.md');expect(()=>buildKnowledgeIndex([a,b])).toThrow(/Duplicate UUID/);});
});
describe('Japan time',()=>{
  it('uses the next calendar day after midnight in Japan',()=>{expect(dateInJapan(new Date('2026-09-10T15:30:00Z'))).toBe('2026-09-11');});
  it('formats timestamps in Asia/Tokyo',()=>{expect(dateTimeInJapan('2026-09-10T15:30:00Z')).toContain('2026/09/11');});
});
describe('Markdown importer',()=>{
  it('derives a title from H1 and fills required metadata',()=>{const used=new Set<string>();const result=prepareImport('# Imported title\n\nBody','note.md','2026-09-10',used,()=>idA);const parsed=parseArticle(result.markdown,'note.md');expect(result.title).toBe('Imported title');expect(parsed.uuid).toBe(idA);expect(parsed.created).toBe('2026-09-10');});
  it('keeps a valid unused UUID and existing metadata',()=>{const source=md(idA,'Existing');const result=prepareImport(source,'note.md','2026-09-11',new Set(),()=>idB);expect(result.uuid).toBe(idA);expect(result.generatedUuid).toBe(false);expect(parseArticle(result.markdown,'note.md').title).toBe('Existing');});
  it('replaces duplicate UUIDs',()=>{const result=prepareImport(md(idA,'Duplicate'),'note.md','2026-09-10',new Set([idA]),()=>idB);expect(result.uuid).toBe(idB);expect(result.generatedUuid).toBe(true);});
  it('falls back to a readable filename title',()=>{expect(titleFromMarkdown('Body','my-note.md')).toBe('my note');});
  it('preserves notes whose opening horizontal rule resembles invalid front matter',()=>{const source='---\n### Topic\n\n- **text**\n\n---\n';const result=prepareImport(source,'topic.md','2026-09-10',new Set(),()=>idA);expect(result.title).toBe('topic');expect(parseArticle(result.markdown,'topic.md').body).toContain('### Topic');expect(parseArticle(result.markdown,'topic.md').body).toContain('- **text**');});
  it('normalizes markdown extensions and rejects traversal',()=>{expect(safeRelativeMarkdownPath('folder/a.markdown')).toBe('folder/a.md');expect(()=>safeRelativeMarkdownPath('../a.md')).toThrow(/Unsafe/);});
});
