# Backend (Flask API)

## 概要

- Flask + SQLAlchemy でカテゴリ/タスク（アーカイブ含む）を提供する REST API。
- 機能単位で Blueprint を分割（`api/categories.py`, `api/tasks.py`）。
- シンプルな `status` 管理（通常/archived）で、要件追加に強い構成。

## フォルダ構成（抜粋）

```
backend/
  app/
    api/
      categories.py     # カテゴリ CRUD + 並べ替え
      tasks.py          # タスク CRUD + 並べ替え + アーカイブ
      utils.py          # 共通エラーレスポンス
      __init__.py       # api_bp（親）に子BPを登録
    models.py           # User / Category / Task
    database.py         # セッション/テーブル作成
    config.py           # DB接続設定
    main.py             # アプリ起動（/api で公開）
```

## 主なエンドポイント

- Category
  - GET `/api/categories`（一覧）
  - POST `/api/category`（追加）
  - PUT/PATCH `/api/category/:id`（リネーム）
  - PATCH `/api/categories/reorder`（並び替え）
  - DELETE `/api/category/:id`（削除）
- Task / Archive
  - GET `/api/tasks?user_id&category_id[&status=archived]`
  - POST `/api/task`
  - PUT/PATCH `/api/task/:id`（タイトル/内容/ステータス更新, status 変更で末尾配置）
  - PATCH `/api/tasks/reorder`（カテゴリ内の並び替え保存）
  - DELETE `/api/task/:id`

## 設計のポイントとメリット

- BP 分割で保守性向上：機能ごとにファイルが小さく、変更影響範囲が明確。
- インデックス/ユニーク制約：カテゴリの `user_id+title` ユニーク、表示順の高速化用インデックス。
- 並び順の一括更新：SQL の `CASE WHEN` を用いて効率よく更新。
- ステータス設計：`status=archived` でアーカイブと通常を簡潔に切り替え。

## ローカル起動（Docker）

```bash
cd todo-myapp
docker-compose up --build -d
# API: http://localhost:5000/api
```

## 今後の拡張

- 認証（JWT やセッション）
- カテゴリ移動（task の category_id 変更時の順序再計算）
- ページング/検索
