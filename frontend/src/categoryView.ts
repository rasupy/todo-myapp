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
    span.setAttribute("role", "textbox");
    span.setAttribute("aria-readonly", "true");

    const actionsWrap = document.createElement("span");
    actionsWrap.className = "row-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "row-action row-action-edit txt-btn";
    editBtn.textContent = "Edit";
    editBtn.title = "Edit";

    const delBtn = document.createElement("button");
    delBtn.className = "row-action row-action-del txt-btn";
    delBtn.textContent = "Delete";
    delBtn.title = "Delete";

    actionsWrap.appendChild(editBtn);
    actionsWrap.appendChild(delBtn);
    li.appendChild(span);
    li.appendChild(actionsWrap);
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
    if (target.closest(".row-action-edit")) {
      D("click:edit", id);
      startEdit(li, id);
      return;
    }
    // 削除
    if (target.closest(".row-action-del")) {
      D("click:delete", id);
      if (confirm("削除してよろしいですか？")) onDelete(id);
      return;
    }
    // 保存
    if (target.closest(".row-action-save")) {
      D("click:save", id);
      const input = li.querySelector("input") as HTMLInputElement | null;
      if (!input) return;
      const newTitle = input.value.trim();
      if (!newTitle) return;
      onEdit(id, newTitle);
      return;
    }
    // 取消
    if (target.closest(".row-action-cancel")) {
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
    input.className = "cat-edit-input";
    li.classList.add("is-editing");
    input.setAttribute("aria-label", "カテゴリー名編集");
    input.setAttribute("data-cat-id", String(id));

    const act = document.createElement("span");
    act.className = "row-actions editing";

    const saveBtn = document.createElement("button");
    saveBtn.className = "row-action row-action-save txt-btn";
    saveBtn.textContent = "Save";
    saveBtn.title = "Save";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "row-action row-action-cancel txt-btn";
    cancelBtn.textContent = "Cancel";
    cancelBtn.title = "Cancel";

    act.appendChild(saveBtn);
    act.appendChild(cancelBtn);
    li.appendChild(input);
    li.appendChild(act);
    setTimeout(() => input.focus(), 0);

    // Enter / ESC キーサポート
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        const newTitle = input.value.trim();
        if (!newTitle) return;
        onEdit(id, newTitle);
      } else if (ev.key === "Escape") {
        renderCategoryList(container, categories, onEdit, onDelete);
      }
    });
  }

  return ul;
}
