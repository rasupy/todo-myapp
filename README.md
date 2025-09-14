# Todo Mini App - タスク管理アプリ

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
- **カテゴリー管理 (最小構成)**：カテゴリー追加 / インライン編集 / 行アイコンによる削除
- **ドラッグ&ドロップ (カテゴリー)**：カテゴリー順序を入れ替え可能（サーバへ並び順送信予定 / 実装済み or 進行中）
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
   title VARCHAR(100) NOT NULL,
   sort_order INTEGER DEFAULT 0,
   user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
   UNIQUE (user_id, title)
);

-- tasks: タスク管理
CREATE TABLE tasks (
   task_id BIGSERIAL PRIMARY KEY, -- タスクID（自動採番）
   title VARCHAR(32) NOT NULL,
   content TEXT,
   status VARCHAR(32) DEFAULT 'todo', -- todo|progress|archive
   sort_order INTEGER DEFAULT 0,
   user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
   category_id BIGINT REFERENCES categories(category_id) ON DELETE CASCADE
);

-- 並び替え高速化のためインデックス
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_tasks_sort_order ON tasks(sort_order);
```

## フォルダ構成

```
todo-myapp/
├── backend/               # FlaskAPI（バックエンド）
│   ├── app/               # アプリ本体
│   │   ├── main.py        # エントリーポイント
│   │   ├── models.py      # DBモデル
│   │   ├── api.py         # APIルーティング
│   │   ├── config.py      # 設定
│   │   ├── database.py    # DB接続
│   ├── requirements.txt   # Python依存
│   ├── Dockerfile         # バックエンド用Docker
│   ├── docker-compose.yml # DB用Compose（backend単体）
├── frontend/              # TypeScript（フロントエンド）
│   ├── src/               # ソースコード
│   ├── public/            # 静的ファイル
│   ├── package.json       # npm依存
│   ├── Dockerfile         # フロントエンド用Docker
├── docker-compose.yml     # 全体構成
└── README.md              # ドキュメント
```

---

## セットアップ手順

1. **リポジトリをクローン**

   ```bash
   git clone https://github.com/your-username/todo-myapp.git
   cd todo-myapp
   ```

2. **環境変数の設定**

   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Docker で起動**

   ```bash
   docker-compose up --build
   ```

4. **アクセス**
   - フロントエンド (Nginx 配信想定の例): `http://localhost:3000`
   - バックエンド API: `http://localhost:5000/api`

---

## フロントエンド UI 仕様（簡素化後）

| 機能           | 操作                                       | 備考                                                         |
| -------------- | ------------------------------------------ | ------------------------------------------------------------ |
| カテゴリー追加 | ヘッダー右の `+` (Add) アイコン / キー `A` | モーダルで名称入力し Enter / 追加ボタン                      |
| カテゴリー編集 | 各行の鉛筆アイコン                         | インラインで入力。Enter 保存 / ESC キャンセル / ✔ ✖ アイコン |
| カテゴリー削除 | 各行のゴミ箱アイコン                       | 確認ダイアログ（ブラウザ標準 or 今後カスタム予定）           |
| 並び替え       | 行をドラッグ                               | ドラッグ中は影付き・プレースホルダ表示                       |

### 削除した旧機能

以前存在した「Edit / Delete モード切替」およびインライン追加フォームは廃止。Add だけを残し、編集・削除は行アクションに集約しました。

### ビルド / デプロイ方針

`dist/` ディレクトリは Docker ビルド時に `tsc` で生成するため、将来的にはリポジトリコミットから除外（`.dockerignore` 済）しクリーンビルドの再現性を確保します。

#### ローカル検証（フロントエンド単体）

```bash
cd frontend
docker build -t todo-frontend:dev .
docker run --rm -p 3000:80 todo-frontend:dev
```

#### 変更反映の注意

`src/` を変更したら再度 Docker ビルドしてください。`dist/main.js` が古いまま残ると UI が最新にならない場合があります。

---

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
- [ ] TypeScript リファクタリング
- [ ] PWA 対応（オフライン・通知）
- [ ] テスト実装（単体・統合）
- [ ] CI/CD（GitHub Actions）

---

## 開発者情報

- **開発期間**: 2025 年 7 月〜（開発中）
- **開発者**: rasupy（個人開発）

---

> ご質問・フィードバックはお気軽にどうぞ！

---

この README は、分かりやすさ・可読性・ポートフォリオ用途を重視して再構成しています。

---

## コミットメッセージ規約

```
<type>(<scope>): <概要>
```

- **type**: 変更の種類（例: feat, fix, docs, style, refactor, test, chore）
- **scope**: 変更対象（例: README, API, frontend, backend など）
- **概要**: 変更内容の要約

### サンプル

- docs(README): README を編集
- feat(api): タスク追加 API を実装
- fix(frontend): タスク一覧の表示バグ修正
- chore(deps): 依存パッケージを更新
