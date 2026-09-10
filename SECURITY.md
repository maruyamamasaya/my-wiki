# Security

## Authentication / Authorization

v1の静的閲覧サイトには認証・認可を実装しない。private contentを載せる場合、public GitHub Pagesは使用しない。

## Secrets

PAT、token、credentialをsource、Markdown、client bundleへ保存しない。追加画面はローカルでMarkdownを生成し、GitHub APIへ直接書き込まない。

## Sensitive Data

Pages公開対象はRepository内容そのものなので、秘密・個人情報を`content/`へ置かない。

## Input Validation

Front MatterのUUIDとtitleをbuild時に検証する。Markdown内HTMLは無効化し、動的表示はHTML escapeする。

## External Services

GitHub Actionsは最小権限（contents: read, pages: write, id-token: write）を使う。

## Dependencies

lockfileをcommitし、依存更新を定期確認する。
