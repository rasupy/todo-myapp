// API 呼び出しをまとめる
// カテゴリー関連の関数
export type Category = {
  id: number;
  title: string;
  sortOrder: number;
  userId: number;
};

const BASE = "";

function mapServer(c: any): Category {
  return {
    id: c.category_id,
    title: c.category_title,
    sortOrder: c.sort_order,
    userId: c.user_id,
  };
}

// カテゴリー一覧を取得
export async function fetchCategories(userId = 1): Promise<Category[]> {
  const res = await fetch(`${BASE}/api/categories?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return data.map(mapServer);
}

// カテゴリーを追加
export async function addCategory(
  title: string,
  userId = 1
): Promise<Category> {
  const res = await fetch(`${BASE}/api/category`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, user_id: userId }),
  });
  if (!res.ok) throw new Error("Failed to add category");
  const data = await res.json();
  return mapServer(data);
}

// カテゴリーを更新
export async function updateCategory(
  id: number,
  title: string,
  userId = 1
): Promise<Category> {
  const res = await fetch(`${BASE}/api/category/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, user_id: userId }),
  });
  if (!res.ok) throw new Error("Failed to update category");
  const data = await res.json();
  return mapServer(data);
}

// カテゴリーの並べ替え
export async function reorderCategories(
  orderedIds: number[],
  userId = 1
): Promise<number> {
  const res = await fetch(`${BASE}/api/categories/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, ordered_ids: orderedIds }),
  });
  if (!res.ok) throw new Error("Failed to reorder categories");
  const data = await res.json();
  return data.updated ?? 0;
}

// カテゴリーを削除
export async function deleteCategory(
  id: number,
  userId = 1
): Promise<{ deleted: boolean }> {
  const res = await fetch(`${BASE}/api/category/${id}?user_id=${userId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete category");
  return res.json();
}
