# フロントエンド開発

## 概要

TypeScript + Node.js + HTML + SCSS
※React は、未学習のため未使用。

## 主要 UI とフロー

- 3 カラム: Category / Task / Archive
- ログイン　/　登録
- カテゴリを追加
- タスクを追加
- アーカイブに移動、タスクに戻す

## 技術と採用理由

- TypeScript: JavaScript の応用技術、型定義で保守性 UP
- HTML + SCSS: カスタマイズしやすいフォルダ構成
- Nginx 配信: 静的ファイル`public/` と `dist/` をまとめて提供

## 起動（Docker が最短）

```bash
cd todo-myapp
docker compose up --build -d
# http://localhost:3000
```
