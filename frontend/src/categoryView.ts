// カテゴリー一覧を表示する機能
import { Category } from "./api.js";

export type OnEdit = (id: number, title: string) => void;
export type OnDelete = (id: number) => void;

export function renderCategoryList(
  container: HTMLElement,
  categories: Category[],
  onEdit: OnEdit,
  onDelete: OnDelete
): HTMLUListElement | null {
  container.innerHTML = "";
  if (categories.length === 0) {
    container.textContent = "カテゴリーがありません";
    return null;
  }

  const ul = document.createElement("ul");
  categories.forEach((cat) => {
    const li = document.createElement("li");
    li.className = "cat-item";
    li.dataset.id = String(cat.id);

    const span = document.createElement("span");
    span.className = "title";
    span.textContent = cat.title;

    const editBtn = document.createElement("button");
    editBtn.textContent = "編集";
    editBtn.addEventListener("click", () => startEdit(li, cat));

    const delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.addEventListener("click", () => {
      if (confirm("削除してよろしいですか？")) onDelete(cat.id);
    });

    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(delBtn);
    ul.appendChild(li);
  });

  container.appendChild(ul);

  function startEdit(li: HTMLElement, cat: Category) {
    const input = document.createElement("input") as HTMLInputElement;
    input.value = cat.title;

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "保存";
    saveBtn.addEventListener("click", () => {
      const newTitle = input.value.trim();
      if (!newTitle) return;
      onEdit(cat.id, newTitle);
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "取消";
    cancelBtn.addEventListener("click", () =>
      renderCategoryList(container, categories, onEdit, onDelete)
    );

    li.innerHTML = "";
    li.appendChild(input);
    li.appendChild(saveBtn);
    li.appendChild(cancelBtn);
  }

  return ul;
}
