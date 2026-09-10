# Personal Knowledge Wiki

Markdownを正本として管理する、自分専用の静的Knowledge Wikiです。記事はファイル名や保存場所ではなくFront Matterの永久UUIDで識別します。Obsidianで`content/`をVaultとして編集し、GitHubへのpushでGitHub Pagesが自動更新されます。

## 開発

Node.js 22以降で`npm install`後、`npm run dev`を実行します。`npm run check`で型検査、Indexerテスト、静的ビルドをまとめて確認できます。

## Markdownを追加する

Webの「＋ 追加」でMarkdownを貼り付けると、H1からタイトルを補完し、UUIDと日付を含むFront Matter付きファイルをダウンロードできます。ファイルを`content/`配下へ置き、必要ならaliasesやtagsを編集してください。静的サイトにGitHub tokenは保存しません。

```yaml
---
id: 8b6df7d2-4e2e-4f73-9288-a933e65d8321
title: OpenShift
aliases: [OCP]
created: 2026-09-10
updated: 2026-09-10
tags: [openshift]
---
```

UUIDは記事作成時だけ生成し、移動、ファイル名変更、title変更の際も変更しません。本文のリンクには`[[OpenShift]]`を使います。

`created`と`updated`の日付、および画面に表示する日時は日本時間（`Asia/Tokyo`）を基準にします。既存記事を編集した場合は`updated`を日本時間の日付へ更新してください。

## Obsidian

Obsidianで`content/`をVaultとして開きます。通常のMarkdownとWiki Linkのまま編集でき、移動・rename後もFront Matterの`id`を維持します。

## Indexを再生成する

`npm run index`を実行します。Indexerは`content/**/*.md`を走査し、`public/knowledge-index.json`とビルド用Indexを生成します。UUID重複や必須項目不足はエラーにし、title/aliasが重複するリンクは曖昧、見つからないリンクは未解決として記録します。

## GitHub Pagesへデプロイする

1. Repositoryの Settings → Pages → Source で「GitHub Actions」を選択します。
2. `main`へpushします。
3. `.github/workflows/deploy-pages.yml`がテスト、Index生成、ビルド、Pages公開を実行します。

Project PagesのサブパスはworkflowがRepository名から設定します。独自ドメインを使う場合は`SITE_URL`と`BASE_PATH`を調整してください。

## 主な構成

- `content/`: Markdownの正本（Obsidian Vault）
- `scripts/indexer.ts`: UUID、Wiki Link、Backlinkの解決
- `src/pages/`: Home、Article、Search、追加画面
- `tests/`: path移動、rename、alias、UUID、Backlink、未解決・曖昧リンクの検証
