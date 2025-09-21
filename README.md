## Todo Mini App — 説明

タスク管理アプリ。
開発をしながら実践学習を目的としています。
フロントエンドとバックエンドの開発を分離し、Docker で起動できます。

### 主要機能

- カテゴリ: 追加、リネーム、削除、並び替え
- タスク: 追加、編集、削除、並び替え
- アーカイブ: 移動、復元、削除、並び替え
- 簡易ログイン/登録

### 使用技術と採用理由

- Frontend: TypeScript + HTML + SCSS
  React は未学習の為、基礎として採用。
- Backend: Flask + SQLAlchemy
  Python の応用技術として採用。
- DB: PostgreSQL
  SQLAlchemy に対応、容易に導入が可能なので採用。
- Infra: Docker Compose
  開発環境を共有可能。

### 学び（要点）

- 体系的に開発を学習できる。
- 開発と運用面をイメージしながら、読み取りやすいフォルダ構成、コードを意識。

### 最短セットアップ

```bash
cd todo-myapp
docker compose up --build -d
```

- Frontend: `http://localhost:3000`
- Backend(API): `http://localhost:5000/api`

### 今後の予定

- アプリとして実装、頒布する。
