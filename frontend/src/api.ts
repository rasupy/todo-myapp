// API 呼び出しをまとめる
export type Category = { id: number; title: string };

const BASE = "";

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE}/api/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function addCategory(title: string): Promise<Category> {
  const res = await fetch(`${BASE}/api/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to add category");
  return res.json();
}

export async function updateCategory(
  id: number,
  title: string
): Promise<Category> {
  const res = await fetch(`${BASE}/api/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to update category");
  return res.json();
}
