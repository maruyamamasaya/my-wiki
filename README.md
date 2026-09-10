# Personal Knowledge Wiki

Markdownを正本として管理する、自分専用の静的Knowledge Wikiです。記事はファイル名や保存場所ではなくFront Matterの永久UUIDで識別します。Obsidianで`content/`をVaultとして編集し、GitHubへのpushでGitHub Pagesが自動更新されます。

## 開発

Node.js 22以降で`npm install`後、`npm run dev`を実行します。`npm run check`で型検査、Indexerテスト、静的ビルドをまとめて確認できます。

## Markdownを追加する

Webの「記事を追加」でMarkdownを貼り付け、「GitHubで追加を確認」からIssueを送信すると、GitHub Actionsが内容を検証して記事追加のPull Requestを作成します。PRを確認してマージするとPagesへ公開されます。初回のみRepositoryの Settings → Actions → Generalで「Allow GitHub Actions to create and approve pull requests」を有効にしてください。静的サイトにGitHub tokenは保存しません。

ダウンロードとコピーも予備の追加方法として利用できます。ダウンロードした場合はファイルを`content/`配下へ置き、必要ならaliasesやtagsを編集してください。

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

## Markdownを一括インポートする

未整理のMarkdownファイル、またはMarkdownが入ったディレクトリを指定すると、既存ファイルを変更せずに取り込み予定を確認できます。

```bash
npm run import -- /path/to/markdown-files
```

単一ファイルも指定できます。

```bash
npm run import -- "/path/to/🌟目次 - Wiki.md"
```

問題がなければ`--apply`を付けて`content/imported/`へ書き込みます。入力元のサブディレクトリ構造は維持されます。

```bash
npm run import -- /path/to/markdown-files --apply
```

保存先の大分類は変更できます。

```bash
npm run import -- /path/to/markdown-files --destination=ai --apply
```

UUIDがない、無効、または既存記事と重複する場合は新しいUUIDを発行します。titleはFront Matter、最初のH1、ファイル名の順で補完し、日付、aliases、tagsにも安全な初期値を設定します。同名ファイルを上書きせず連番で保存します。取り込み後は`npm run check`で全体を検証してください。

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
