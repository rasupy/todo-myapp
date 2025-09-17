// API 呼び出しをまとめる
// カテゴリー関連の関数
export type Category = {
  id: number;
  title: string;
  sortOrder: number;
  userId: number;
};

// タスク関連の型
export type Task = {
  id: number;
  title: string;
  content: string;
  status: string;
  sortOrder: number;
  userId: number;
  categoryId: number;
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

function mapTaskServer(t: any): Task {
  return {
    id: t.task_id,
    title: t.task_title,
    content: t.content ?? "",
    status: t.status ?? "todo",
    sortOrder: t.sort_order,
    userId: t.user_id,
    categoryId: t.category_id,
  };
}

// カテゴリー一覧を取得
export async function fetchCategories(userId = 1): Promise<Category[]> {
  const res = await fetch(`${BASE}/api/categories?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return data.map(mapServer);
}

// タスク一覧を取得（カテゴリ内）
export async function fetchTasks(
  categoryId: number,
  userId = 1
): Promise<Task[]> {
  const res = await fetch(
    `${BASE}/api/tasks?user_id=${userId}&category_id=${categoryId}`
  );
  if (!res.ok) throw new Error("Failed to fetch tasks");
  const data = await res.json();
  return data.map(mapTaskServer);
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

// タスクを追加
export async function addTask(
  categoryId: number,
  title: string,
  content = "",
  userId = 1
): Promise<Task> {
  const res = await fetch(`${BASE}/api/task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      content,
      user_id: userId,
      category_id: categoryId,
    }),
  });
  if (!res.ok) throw new Error("Failed to add task");
  const data = await res.json();
  return mapTaskServer(data);
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

// タスクを更新（タイトル・内容・ステータス）
export async function updateTask(
  id: number,
  patch: Partial<Pick<Task, "title" | "content" | "status">>,
  userId = 1
): Promise<Task> {
  const res = await fetch(`${BASE}/api/task/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...patch, user_id: userId }),
  });
  if (!res.ok) throw new Error("Failed to update task");
  const data = await res.json();
  return mapTaskServer(data);
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

// タスクの並べ替え（カテゴリ内）
export async function reorderTasks(
  categoryId: number,
  orderedIds: number[],
  userId = 1
): Promise<number> {
  const res = await fetch(`${BASE}/api/tasks/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      category_id: categoryId,
      ordered_ids: orderedIds,
    }),
  });
  if (!res.ok) throw new Error("Failed to reorder tasks");
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

// タスクを削除
export async function deleteTask(
  id: number,
  userId = 1
): Promise<{ deleted: boolean }> {
  const res = await fetch(`${BASE}/api/task/${id}?user_id=${userId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete task");
  return res.json();
}
