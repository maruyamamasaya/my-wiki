# Architecture

## System Overview

GitHub Repositoryの`content/`を唯一の正本とする、ビルド時生成型の静的Knowledge Wiki。

## Technology Stack

- Astro 5 / TypeScript / static output
- gray-matter + markdown-it
- Vitest
- GitHub Actions / GitHub Pages

## Major Components

- Content: Front Matter付きMarkdown
- Indexer: 検証、リンク解決、Backlink逆引き、検索用本文の生成
- Web: Home、UUID記事route、Search、Markdown追加UI
- Delivery: pushを起点にIndex、test、build、Pages deploy

## Data Flow

`content/**/*.md` → Indexer → UUID keyed index → Astro static pages/search JSON → GitHub Pages。ファイル移動時は同じUUIDに新しいpathが結び直される。

## External Services

GitHub Repository、Actions、Pagesのみ。閲覧時の外部APIやserver runtimeはない。

## Deployment

Astroの`dist/`をGitHub Pages artifactとして公開する。

## Key Constraints

- UUIDは不変。pathとtitleは変更可能。
- Wiki Linkはtitle、alias、UUID、現在pathで解決する。
- 複数候補は曖昧として未解決のまま扱う。
- GitHub credentialをclient bundleへ含めない。
