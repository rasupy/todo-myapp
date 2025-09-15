## Todo Mini App

学習 / 仕事 / 趣味のタスクをシンプルに整理する最小構成のタスク管理アプリ。フロント(TypeScript)とバックエンド(Flask API)を疎結合に分離し、Docker で素早く環境再現できる構成です。

### 主要機能

- カテゴリー追加・インライン編集・削除
- ドラッグ&ドロップで並び替え（順序反映 API 実装中）
- レスポンシブ（PC / モバイル）

### 技術スタック

Frontend: TypeScript / HTML / (S)CSS  
Backend: Flask / Python / SQLAlchemy  
DB: PostgreSQL  
Infra: Docker / Docker Compose

### ディレクトリ概要

```
todo-myapp/
  backend/    Flask API, DB関連
  frontend/   TypeScript + 静的アセット
  docker-compose.yml  全体起動
```

### セットアップ (最短)

```bash
git clone <repo-url>
cd todo-myapp
cp backend/.env.example backend/.env   # 必要変数を調整
docker-compose up --build
```

フロント: http://localhost:3000  
API: http://localhost:5000/api

### 開発ワークフロー簡略

1. backend: API/モデルを編集 → コンテナ再起動 or ホットリロード設定
2. frontend: `src/` の TS 編集 → `tsc` / 再ビルド（Docker 内で自動化検討余地）
3. PR / コミット: プレフィックス規約に沿って記述

### コミット規約（抜粋）

```
<type>(<scope>): <summary>
type: feat | fix | docs | style | refactor | test | chore
```

例: `feat(api): add category reorder endpoint`

### 今後の改善候補

- 認証（JWT / セッション）
- タスク CRUD / 状態遷移 UI
- 並び順永続化 API 完了
- テスト整備 (pytest / Vitest など)
- CI (GitHub Actions) + Lint/Format 導入
- PWA / オフラインキャッシュ

### ライセンス / 作者

Author: raspy (2025-)  
License: MIT (予定 or LICENSE 参照)

---

フィードバック歓迎です。シンプルさと拡張余地の両立を目指しています。
