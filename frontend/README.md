# Frontend (TypeScript) — 簡潔版

## 概要

フレームワークレスな TypeScript + HTML Templates。表示/テンプレート/ドラッグ/データ取得をモジュール分割。

## 主要 UI とフロー

- 3 カラム: Category / Task / Archive
- 初回はログイン/登録（成功で `localStorage.user_id` 保存）
- カテゴリ選択で Task と Archive を同時取得
- 行右端の操作: Task `[chevron_right, edit, delete]` / Archive `[chevron_left, delete]`
- DnD で順序変更 → `PATCH` API で保存

## 技術と採用理由

- TypeScript + 素の DOM: 軽量・理解容易、型で保守性
- テンプレート直読み: 変更が即反映で開発が速い
- Nginx 配信: `public/` と `dist/` をまとめて提供

## 起動（Docker が最短）

```bash
cd todo-myapp
docker compose up --build -d
# http://localhost:3000
```

## ローカル開発（Node）

```bash
cd todo-myapp/frontend
npm install
npm run dev               # tsc --watch で dist/ を生成
npx http-server public -p 3000 &  # 静的配信
# dist/ も配信する場合: npx http-server . -p 3000
```

## トラブル（最小）

- `main.js` が見つからない → `npm run build|dev` 実行し、`public/` と `dist/` を配信
- API 404/接続失敗 → Compose の `backend` が稼働し、フロント Nginx が `/api/` を `backend:5000` にプロキシしているか確認
