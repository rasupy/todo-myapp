// カテゴリー一覧を表示する機能 (クリックデリゲーション版 + debug)
import { Category } from "./api.js";
const D = (...a: any[]) => console.log("[VIEW]", ...a);

export type OnEdit = (id: number, title: string) => void;
export type OnDelete = (id: number) => void;

export function renderCategoryList(
  container: HTMLElement,
  categories: Category[],
  onEdit: OnEdit,
  onDelete: OnDelete
): HTMLUListElement | null {
  D("renderCategoryList:begin", categories.length);
  container.innerHTML = "";
  if (categories.length === 0) {
    container.textContent = "カテゴリーがありません";
    D("renderCategoryList:empty");
    return null;
  }

  const ul = document.createElement("ul");

  // アイテムDOM構築 (個別ボタンにリスナは付与しない)
  categories.forEach((cat) => {
    const li = document.createElement("li");
    li.className = "cat-item";
    li.dataset.id = String(cat.id);

    const span = document.createElement("span");
    span.className = "title";
    span.textContent = cat.title;

    const editBtn = document.createElement("button");
    editBtn.className = "btn-edit";
    editBtn.textContent = "編集";

    const delBtn = document.createElement("button");
    delBtn.className = "btn-del";
    delBtn.textContent = "削除";

    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(delBtn);
    ul.appendChild(li);
  });

  // クリックデリゲーション: 親ulに1つだけイベント登録
  ul.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const li = target.closest("li.cat-item") as HTMLElement | null;
    if (!li) return;
    const id = Number(li.dataset.id);
    if (!id) return;

    // 編集開始
    if (target.classList.contains("btn-edit")) {
      D("click:edit", id);
      startEdit(li, id);
      return;
    }
    // 削除
    if (target.classList.contains("btn-del")) {
      D("click:delete", id);
      if (confirm("削除してよろしいですか？")) onDelete(id);
      return;
    }
    // 保存
    if (target.classList.contains("btn-save")) {
      D("click:save", id);
      const input = li.querySelector("input") as HTMLInputElement | null;
      if (!input) return;
      const newTitle = input.value.trim();
      if (!newTitle) return;
      onEdit(id, newTitle);
      return;
    }
    // 取消
    if (target.classList.contains("btn-cancel")) {
      D("click:cancel", id);
      // 元のリスト全体を再レンダ
      renderCategoryList(container, categories, onEdit, onDelete);
      return;
    }
  });

  container.appendChild(ul);
  D("renderCategoryList:end");

  function startEdit(li: HTMLElement, id: number) {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    D("startEdit", id);
    li.innerHTML = "";
    const input = document.createElement("input");
    input.value = cat.title;

    const saveBtn = document.createElement("button");
    saveBtn.className = "btn-save";
    saveBtn.textContent = "保存";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn-cancel";
    cancelBtn.textContent = "取消";

    li.appendChild(input);
    li.appendChild(saveBtn);
    li.appendChild(cancelBtn);
  }

  return ul;
}
