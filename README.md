## Todo Mini App

学習 / 仕事 / 趣味のタスクをシンプルに整理する最小構成のタスク管理アプリ。フロント（TypeScript, 素の DOM）とバックエンド（Flask API）を疎結合に分離し、Docker で素早く再現できる構成です。

### 主要機能（概要）

- カテゴリーの追加 / インライン編集 / 削除
- ドラッグ＆ドロップで並び替え（カテゴリ・タスク・アーカイブ）
- タスクの追加 / 編集 / 削除
- アーカイブボード（カテゴリごと）
  - タスクをアーカイブへ移動（[chevron_right]）
  - アーカイブからタスクへ復元（[chevron_left]）
  - アーカイブの削除 / 並び替え
- レスポンシブ（PC / モバイル）

### 技術スタックと動機

- Frontend: TypeScript / HTML Templates / (S)CSS
  - 小さく速い: フレームワーク非依存で依存を最小化、学習コストとビルド時間を抑制
  - ロジック分離: ビュー/テンプレート/ドラッグ処理/データ取得をモジュール分割
- Backend: Flask / Python / SQLAlchemy
  - API は Blueprint を機能単位（カテゴリ/タスク）で分割し保守性を確保
  - `status=archived` などシンプルな状態管理で要件追加に強い
- DB: PostgreSQL（インデックス/ユニーク制約で安定性と性能）
- Infra: Docker / Docker Compose（環境差異の吸収・再現性）

### ディレクトリ（抜粋）

```
todo-myapp/
  backend/
    app/
      api/
        categories.py    # カテゴリAPI
        tasks.py         # タスク/アーカイブAPI
        utils.py         # 共通レスポンス等
        __init__.py      # api_bp を束ねる
      models.py          # User/Category/Task
      database.py, config.py, main.py
  frontend/
    public/
      index.html
      templates/         # UIテンプレート（category/task/archive/modal）
      scss/              # スタイル
    src/
      main.ts            # 画面オーケストレーション
      api.ts             # APIクライアント
      categoryView.ts, taskView.ts, archiveView.ts
      categorySortable.ts, taskSortable.ts
      templates.ts       # テンプレートローダ
  docker-compose.yml
```

### ざっくり動作フロー

1. カテゴリ一覧を取得して描画（並び替え可）
2. カテゴリ選択 → 同カテゴリの「タスク」と「アーカイブ」を同時取得して表示
3. 行の右端ボタンで操作
   - タスク: `[ chevron_right, edit, delete ]`
   - アーカイブ: `[ chevron_left, delete ]`
4. どちらのリストもドラッグ＆ドロップで順序変更 → PATCH API で保存

### セットアップ（最短）

```bash
git clone <repo-url>
cd todo-myapp
cp backend/.env.example backend/.env   # 必要に応じて調整
docker-compose up --build -d
```

- Frontend: http://localhost:3000
- API: http://localhost:5000/api

### 開発メモ

1. backend: API/モデル編集 → コンテナ再起動 or ホットリロード設定
2. frontend: `src/` の TS 編集 → `tsc` / Docker ビルドで自動反映
3. コミット: Conventional Commits 推奨（例: `feat(api): add category reorder endpoint`）

### 今後の改善候補

- 認証（JWT / セッション）
- E2E/ユニットテスト整備（pytest / Vitest 等）
- CI（GitHub Actions）+ Lint/Format 導入
- PWA / オフラインキャッシュ

### ライセンス / 作者

Author: raspy (2025-)  
License: MIT（予定 or LICENSE 参照）

---

シンプルさと拡張余地の両立を目指しています。フィードバック歓迎です。
