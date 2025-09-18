# Frontend (TypeScript)

## 概要

- フレームワーク非依存の TypeScript + HTML Templates 構成。
- API クライアント/表示/ドラッグ並べ替え/モーダル/テンプレート読込をモジュールごとに分離。

## フォルダ構成（抜粋）

```
frontend/
  public/
    index.html
    templates/
      category-item.html
      task-item.html
      archive-item.html
      modal-*.html
    scss/
      styles.scss, base/, layout/, components/
  src/
    main.ts              # 画面全体のオーケストレーション
    api.ts               # API 呼び出し（fetch* / update* / reorder*）
    categoryView.ts      # カテゴリ一覧の描画
    taskView.ts          # タスク一覧 + アーカイブボタン
    archiveView.ts       # アーカイブ一覧 + 復元/削除
    categorySortable.ts  # カテゴリのDnD
    taskSortable.ts      # タスク/アーカイブのDnD
    templates.ts         # テンプレートローダ
```

## 主要 UI と動作フロー

- 画面構成: Category / Task / Archive の 3 カラム
- カテゴリ選択 → Task と Archive を同時取得して表示
- 行右端のアイコン
  - Task: `[ chevron_right, edit, delete ]`
  - Archive: `[ chevron_left, delete ]`
- DnD で順序変更 → `PATCH` API で保存

## 採用技術とメリット

- TypeScript: 型補完/安全性で保守性向上
- フレームワークレス: 軽量・理解容易、学習/検証用途に最適
- Caching なしのテンプレート直読み: 変更を即時反映、開発サイクルが速い

## ローカルビルド（任意）

```bash
cd todo-myapp/frontend
npm install
npm run build
# public/ と dist/ を nginx で配信（Docker イメージ内）
```

## 今後の拡張

- トースト通知/バリデーションの強化
- テスト（ユニット/E2E）導入
- Lint/Formatter の導入（ESLint/Prettier）
