# Current

## Current Phase

My Interest Wiki UI refresh

## Current State

AstroによるGitHub Pages向け静的な「個人的な興味図鑑」を実装。趣味・雑学・好きなものを、完成度を気にせず残す。仕事・資格・体系的な技術学習は`maruyamamasaya/study`が担当する。Markdownの永久UUIDを記事IDとし、Indexerが現在path、Wiki Link、Backlink、未解決・曖昧リンクを再構築する。

## Working

- `content/`を正本とするMarkdown管理
- UUIDベースの記事URLとpath変更追従
- 興味を眺めるHome、本文中心のArticle、全文検索、気軽なMarkdown追加UI
- Simple Wiki、Windows 98、Living Aurora、Pulse Neon、Blue Cosmosの5表示テーマ。画面下の切替メニューから選択し、ブラウザに保存する
- GitHub ActionsによるPages build/deploy
- Indexerの主要不変条件テスト

## In Progress

- None.

## Known Issues

- 静的サイトからGitHubへ直接commitは行わない。追加画面は安全なMarkdown生成・ダウンロードに限定する。

## Immediate Next

- Repository名に合わせてGitHub Pagesを有効化し、初回deployを確認する。
