# Data Model

## Persistence Strategy

Git管理されたMarkdownファイルが正本。Knowledge IndexとHTMLは再生成可能な派生物。

## Entities

Articleは`id`, `title`, `aliases`, `created`, `updated`, `tags`, Markdown本文を持つ。Indexerは`path`, `wikiLinks`, `outgoingLinks`, `backlinks`を付加する。

## Primary Keys

Articleの`id`（UUID）。

## Relations

Wiki Linkが一意に解決された場合、source UUIDからtarget UUIDへの関係を作る。Backlinkはその逆引き。

## Ownership

ユーザーがRepositoryとMarkdownを所有する。

## Lifecycle

作成時にUUIDを付与し、移動・rename・title変更後も維持する。削除した記事へのリンクは次回Index生成で未解決になる。

## Retention

Git historyに従う。生成Indexはいつでも再構築できる。

## Migration Notes

UUIDを持たない既存Markdownは、取り込み時に一度だけUUIDを付与する。
