## Todo Mini App — 必要最低限の説明

学習/検証に最適なミニマルなタスク管理アプリ。Frontend(TypeScript, 素の DOM)と Backend(Flask API) を疎結合で分離し、Docker で即起動できます。

### 主要機能

- カテゴリ: 追加/リネーム/削除、並び替え(DnD)
- タスク: 追加/編集/削除、並び替え(DnD)
- アーカイブ: 移動/復元/削除、並び替え(DnD)
- 簡易ログイン/登録（`localStorage.user_id` 利用）

### 使用技術と採用理由

- Frontend: TypeScript + HTML Templates + (S)CSS — フレームワークレスで軽量、型で保守性
- Backend: Flask + SQLAlchemy — 小規模 API を最短構築、`status=archived` で状態管理を単純化
- DB: PostgreSQL — ユニーク制約/インデックスで整合性と性能
- Infra: Docker Compose — 再現性と素早いセットアップ

### 学び（要点）

- 表示/テンプレート/ドラッグ/データ取得の責務分離による見通しの良さ
- DnD → `PATCH` 一括更新（SQL `CASE WHEN`）で効率的な並び順保存
- シンプルな状態設計（`status` で通常/アーカイブを切替）
- フロント/バックの疎結合とコンテナ化での再現性

### 最短セットアップ

```bash
cd todo-myapp
docker compose up --build -d
```

- Frontend: `http://localhost:3000`
- API: `http://localhost:5000/api`

必要最低限の構成で「動く → 拡張できる」を重視しています。
