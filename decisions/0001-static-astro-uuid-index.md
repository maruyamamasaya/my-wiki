# ADR 0001: Astro static site and UUID-centered index

## Status

Accepted

## Context

MarkdownをGitHub/Obsidianで編集し、GitHub Pagesで閲覧する。ファイル移動後も記事間関係を維持し、clientへcredentialを置かない必要がある。

## Decision

Astroのstatic outputを採用し、build前に全Markdownを走査する。Articleの同一性はFront Matter UUIDだけで決め、Wiki Linkは生成時にUUIDへ解決する。投稿UIはMarkdown生成に限定する。

## Consequences

server不要でPages運用が単純になる。変更反映にはbuildが必要。Webからの直接commitは将来、安全なserver-side認証方式を別途設計する。
