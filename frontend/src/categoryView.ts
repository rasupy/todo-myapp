// カテゴリー一覧を表示する機能
import { Category } from "./api.js";
import { getTemplate } from "./templates.js";

export type OnEdit = (id: number, title: string) => void;
export type OnDelete = (id: number) => void;
export type OnSelect = (category: Category) => void;
export type OnAddTask = (category: Category) => void;

export function renderCategoryList(
  container: HTMLElement,
  categories: Category[],
  onEdit: OnEdit,
  onDelete: OnDelete,
  onSelect?: OnSelect,
  onAddTask?: OnAddTask
): HTMLUListElement | null {
  container.innerHTML = "";
  if (categories.length === 0) {
    container.classList.remove("list-panel");
    container.classList.add("placeholder-panel");
    const p = document.createElement("p");
    p.className = "placeholder-msg";
    p.textContent = "No categories";
    container.appendChild(p);
    return null;
  } else {
    // 通常リスト表示時は placeholder クラスを外しスクロール可能に戻す
    container.classList.add("list-panel");
    container.classList.remove("placeholder-panel");
  }

  const ul = document.createElement("ul");

  // アイテムDOM構築
  const itemTpl = getTemplate("tmpl-category-item");
  categories.forEach((cat) => {
    const node = itemTpl.content.firstElementChild!.cloneNode(
      true
    ) as HTMLElement;
    const li = node as HTMLLIElement;
    li.dataset.id = String(cat.id);
    const title = li.querySelector(".title") as HTMLElement | null;
    if (title) title.textContent = cat.title;
    ul.appendChild(li);
  });

  // クリックでイベント処理
  ul.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const li = target.closest("li.cat-item") as HTMLElement | null;
    if (!li) return;
    const id = Number(li.dataset.id);
    if (!id) return;

    // 編集開始
    if (target.closest(".row-action-edit")) {
      startEdit(li, id);
      return;
    }
    // タスク追加モーダル
    if (target.closest(".row-action-add")) {
      const cat = categories.find((c) => c.id === id);
      if (cat) onAddTask?.(cat);
      return;
    }
    // 削除
    if (target.closest(".row-action-del")) {
      if (confirm("Are you sure you want to delete this?")) onDelete(id);
      return;
    }
    // 保存
    if (target.closest(".row-action-save")) {
      const input = li.querySelector("input") as HTMLInputElement | null;
      if (!input) return;
      const newTitle = input.value.trim();
      if (!newTitle) return;
      onEdit(id, newTitle);
      return;
    }
    // 取消
    if (target.closest(".row-action-cancel")) {
      renderCategoryList(
        container,
        categories,
        onEdit,
        onDelete,
        onSelect,
        onAddTask
      );
      return;
    }

    // 行選択（上記のいずれにも該当しない場合）
    if (!target.closest(".row-actions")) {
      const cat = categories.find((c) => c.id === id);
      if (cat) onSelect?.(cat);
      return;
    }
  });

  container.appendChild(ul);

  function startEdit(li: HTMLElement, id: number) {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    li.innerHTML = "";
    const input = document.createElement("input");
    input.value = cat.title;
    input.className = "cat-edit-input";
    li.classList.add("is-editing");
    input.setAttribute("aria-label", "Edit category name");
    input.setAttribute("data-cat-id", String(id));

    const act = document.createElement("span");
    act.className = "row-actions editing";

    const saveBtn = document.createElement("button");
    saveBtn.className = "row-action row-action-save icon-btn-sm";
    saveBtn.title = "Save";
    saveBtn.setAttribute("aria-label", "Save category");
    saveBtn.innerHTML =
      '<span class="material-symbols-outlined" aria-hidden="true">add_circle</span>';

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "row-action row-action-cancel icon-btn-sm";
    cancelBtn.title = "Cancel";
    cancelBtn.setAttribute("aria-label", "Cancel editing");
    cancelBtn.innerHTML =
      '<span class="material-symbols-outlined" aria-hidden="true">cancel</span>';

    act.appendChild(saveBtn);
    act.appendChild(cancelBtn);
    li.appendChild(input);
    li.appendChild(act);
    setTimeout(() => input.focus(), 0);

    // Enter キーで保存
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        const newTitle = input.value.trim();
        if (!newTitle) return;
        onEdit(id, newTitle);
      }
    });
  }

  return ul;
}
