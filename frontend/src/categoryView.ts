// カテゴリー一覧を表示する機能
import { Category } from "./api";

export type OnEdit = (id: number, title: string) => void;

export function renderCategoryList(
  container: HTMLElement,
  categories: Category[],
  onEdit: OnEdit
) {
  container.innerHTML = "";
  if (categories.length === 0) {
    container.textContent = "カテゴリーがありません";
    return;
  }

  const ul = document.createElement("ul");
  categories.forEach((cat) => {
    const li = document.createElement("li");
    li.className = "cat-item";

    const span = document.createElement("span");
    span.className = "title";
    span.textContent = cat.title;

    const btn = document.createElement("button");
    btn.textContent = "編集";
    btn.addEventListener("click", () => startEdit(li, cat));

    li.appendChild(span);
    li.appendChild(btn);
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
      renderCategoryList(container, categories, onEdit)
    );

    li.innerHTML = "";
    li.appendChild(input);
    li.appendChild(saveBtn);
    li.appendChild(cancelBtn);
  }
}
