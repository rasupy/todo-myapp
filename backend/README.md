# バックエンド開発

## 概要

Flask + SQLAlchemy の REST API。
カテゴリ、タスク、アーカイブのデータを提供。

## 主なエンドポイント

- Category: GET `/api/categories`, POST `/api/category`, PATCH `/api/categories/reorder`, PUT/PATCH/DELETE `/api/category/:id`
- Task: GET `/api/tasks?user_id&category_id[&status=archived]`, POST `/api/task`, PATCH `/api/tasks/reorder`, PUT/PATCH/DELETE `/api/task/:id`
- Auth: POST `/api/auth/register`, POST `/api/auth/login`, GET `/api/auth/me?user_id=...`, POST `/api/auth/logout`

## 技術と採用理由

- Flask + SQLAlchemy: 小規模 API を素早く構築、ORM で保守性 UP
- PostgreSQL: メジャーで導入しやすい。
- Blueprint 分割: 変更影響を局所化

## 学び（要点）

- データベース操作
- JSON 形式のデータに変換してフロント側に渡す。リアルタイム処理（ページのリロードなし）でデータベース操作とフロントとバック間データの送受信が可能。

## 起動（Docker）

```bash
cd todo-myapp
docker compose up --build -d
# API: http://localhost:5000/api
```
