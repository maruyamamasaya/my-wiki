# Current

## Current Phase

Knowledge Wiki v1 implemented and validated

## Current State

AstroによるGitHub Pages向け静的Wikiを実装済み。Markdownの永久UUIDを記事IDとし、Indexerが現在path、Wiki Link、Backlink、未解決・曖昧リンクを再構築する。

## Working

- `content/`を正本とするMarkdown管理
- UUIDベースの記事URLとpath変更追従
- Home、Article、全文検索、Markdown追加UI
- 未整理Markdownのdry-run付き一括インポートCLI
- GitHub ActionsによるPages build/deploy
- Indexerの主要不変条件テスト

## In Progress

- None.

## Known Issues

- 静的サイトからGitHubへ直接commitは行わない。追加画面は安全なMarkdown生成・ダウンロードに限定する。

## Immediate Next

- Repository名に合わせてGitHub Pagesを有効化し、初回deployを確認する。
