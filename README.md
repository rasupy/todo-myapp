# Todo Mini App - ポートフォリオ用タスク管理

![FlaskAPI](https://img.shields.io/badge/FlaskAPI-3.1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Docker](https://img.shields.io/badge/Docker-25.0-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)

## 概要

学習・仕事・趣味などのタスクを効率的に管理できる Web アプリです。  
フロントエンド（TypeScript）とバックエンド（FlaskAPI）を分離し、Docker で統一的な開発環境を構築、シンプルで可読性を重視した設計を目指しています。

---

## 特徴

- **フロントエンド/バックエンド分離**：API 通信による疎結合設計
- **Docker 開発環境**：環境差異を排除し、すぐに起動可能
- **カテゴリー・ステータス管理**：タスクを分類・進捗管理
- **ドラッグ&ドロップ**：直感的な操作性
- **レスポンシブデザイン**：PC・スマホ両対応

---

## 技術スタック

- **フロントエンド**：TypeScript, HTML5, CSS3, Sass, JavaScript(ES6+)
- **バックエンド**：FlaskAPI, Python3, SQLAlchemy, psycopg2
- **データベース**：PostgreSQL
- **インフラ**：Docker, Docker Compose
- **その他**：python-dotenv, Git

---

## データベース設計（PostgreSQL）

```sql
-- users: ユーザー情報
CREATE TABLE users (
   user_id BIGSERIAL PRIMARY KEY, -- ユーザーID（自動採番）
   name VARCHAR(100) NOT NULL,
   email VARCHAR(255) UNIQUE NOT NULL,
   password_hash VARCHAR(255) NOT NULL, -- ハッシュ化したパスワード
   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
   deleted_at TIMESTAMP WITH TIME ZONE
);

-- categories: カテゴリー管理
CREATE TABLE categories (
   category_id BIGSERIAL PRIMARY KEY, -- カテゴリーID（自動採番）
   name VARCHAR(100) NOT NULL,
   sort_order INTEGER DEFAULT 0,
   user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
   UNIQUE (user_id, name)
);

-- tasks: タスク管理
CREATE TABLE tasks (
   task_id BIGSERIAL PRIMARY KEY, -- タスクID（自動採番）
   title VARCHAR(32) NOT NULL,
   content TEXT,
   status VARCHAR(32) DEFAULT 'todo',　-- todo|progress|archive
   sort_order INTEGER DEFAULT 0,
   user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
   category_id BIGINT REFERENCES categories(category_id) ON DELETE CASCADE
);

-- 並び替え高速化のためインデックス
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_tasks_sort_order ON tasks(sort_order);
```

---

## フォルダ構成

```
todo-app/
├── backend/               # FlaskAPI（バックエンド）
│   ├── app/               # アプリ本体
│   │   ├── main.py        # エントリーポイント
│   │   ├── models.py      # DBモデル
│   │   ├── api.py         # APIルーティング
│   │   └── config.py      # 設定
│   ├── requirements.txt   # Python依存
│   ├── Dockerfile         # バックエンド用Docker
├── frontend/               # TypeScript（フロントエンド）
│   ├── src/               # ソースコード
│   │   ├── index.ts       # エントリーポイント
│   │   └── components/    # UI部品
│   ├── public/            # 静的ファイル
│   ├── package.json       # npm依存
│   ├── Dockerfile         # フロントエンド用Docker
├── docker-compose.yml      # 全体構成
└── README.md               # ドキュメント
```

---

## セットアップ手順

1. **リポジトリをクローン**

   ```bash
   git clone https://github.com/your-username/todo-app.git
   cd todo-app
   ```

2. **環境変数の設定**

   ```bash
   cp backend/.env.example backend/.env
   # 必要に応じて編集
   ```

3. **Docker で起動**

   ```bash
   docker-compose up --build
   ```

4. **アクセス**
   - フロントエンド: `http://localhost:3000`
   - バックエンド API: `http://localhost:5000/api`

---

## 要件定義

- タスクはカテゴリーごとに管理
- タスクの状態（todo, progress, archive）を変更可能
- ユーザーごとにタスク・カテゴリーを分離
- API は RESTful 設計
- フロントエンドは API 経由でデータ取得・更新
- セキュリティ（CSRF, XSS, 入力値検証）を考慮
- 保守性・拡張性を意識した設計

---

## 今後の予定

- [ ] 認証機能（ユーザー登録・ログイン）
- [ ] TypeScript 化の推進
- [ ] PWA 対応（オフライン・通知）
- [ ] テスト実装（単体・統合）
- [ ] CI/CD（GitHub Actions）

---

## 開発者情報

- **開発期間**: 2025 年 7 月〜
- **開発者**: rasupy（個人開発）

---

> ご質問・フィードバックはお気軽にどうぞ！

---

この README は、分かりやすさ・可読性・ポートフォリオ用途を重視して再構成しています。  
ご要望に応じてさらにカスタマイズ可能です。
