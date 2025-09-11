# フロントエンド連携メモ

### フロントに返す JSON データ

```python
# カテゴリー追加機能
"category_id": category.category_id,
"category_title": category.title,
"user_id": category.user_id,

# カテゴリー名の編集機能
"category_id": category.category_id,
"category_title": category.title,
"user_id": category.user_id,

# カテゴリーの並べ替え（ソート）機能
```

### テーブルの確認

```bash
docker exec -i todo-db psql -U postgres -d todo_db -c "\d+ categories" ; docker exec -i todo-db psql -U postgres -d todo_db -c "SELECT * FROM categories LIMIT 50;"
```
