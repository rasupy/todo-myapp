// カテゴリーを追加する機能
import { addCategory, type Category } from "./api";

export function createAddForm(
  container: HTMLElement | null,
  onAdded: (cat: Category) => void
) {
  if (!container) return;

  const input = document.createElement("input");
  (input as HTMLInputElement).placeholder = "新しいカテゴリー名";

  const btn = document.createElement("button");
  btn.textContent = "追加";
  btn.addEventListener("click", async () => {
    const title = (input as HTMLInputElement).value.trim();
    if (!title) return;
    const created = await addCategory(title);
    (input as HTMLInputElement).value = "";
    onAdded(created);
  });

  container.innerHTML = "";
  container.appendChild(input);
  container.appendChild(btn);
}
