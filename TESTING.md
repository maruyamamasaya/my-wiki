# Testing

## Testing Strategy

同一性とリンク解決をunit testで、型・静的生成をbuildで検証する。

## Validation Matrix

| 変更タイプ | 必要な検証 |
| --- | --- |
| Indexer / schema | `npm test`、`npm run index` |
| UI / route | `npm run build` |
| release | `npm run check` |

## Fast Validation

`npm test`

## Full Validation

`npm run check`

## Unit Test

path移動、ファイル名変更、title変更、alias/UUID解決、UUID維持、Backlink、未解決、title/alias重複、UUID重複を検証する。

## Manual Verification

Home、Article、Search、追加画面をmobile/desktopで確認し、Pagesではproject subpathのasset/linkを確認する。
