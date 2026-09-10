# Domain

## Glossary

- Article: 1つのMarkdown文書。
- Article ID: Front Matterの永久UUID。
- Wiki Link: 本文中の`[[label]]`。
- Ambiguous Link: 候補UUIDが複数あるリンク。
- Backlink: 対象記事を参照する記事への逆向きリンク。

## Entities

- Article
- Wiki Link
- Knowledge Index

## Business Rules

- Articleの同一性はUUIDだけで決まり、path、ファイル名、titleに依存しない。
- 新規ArticleはUUIDを一度だけ生成する。既存ArticleのUUIDは変更しない。
- Link解決候補はtitle、aliases、UUID、現在pathから求める。
- 0候補は未解決、複数候補は曖昧とし、推測で結ばない。

## Invariants

- UUIDは全記事で一意かつ有効。
- Articleにはtitleがある。
- Backlinkは解決済みoutgoing linkから再生成される。
- 記事の日付生成と画面上の日時表示は`Asia/Tokyo`を基準とする。

## Open Questions

- 将来の安全なGitHub書き込みフローはv1対象外。
