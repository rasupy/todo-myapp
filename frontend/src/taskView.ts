// タスク一覧の表示・編集UI
import type { Task } from "./api.js";

export type OnEditOpen = (task: Task) => void;
export type OnDeleteTask = (taskId: number) => void;

export function renderTaskList(
  container: HTMLElement,
  tasks: Task[],
  onOpenEdit: OnEditOpen,
  onDelete?: OnDeleteTask
): HTMLUListElement | null {
  container.innerHTML = "";
  if (tasks.length === 0) {
    container.classList.remove("list-panel");
    container.classList.add("placeholder-panel");
    const p = document.createElement("p");
    p.className = "placeholder-msg";
    p.textContent = "No tasks";
    container.appendChild(p);
    return null;
  } else {
    container.classList.add("list-panel");
    container.classList.remove("placeholder-panel");
  }

  const ul = document.createElement("ul");
  tasks.forEach((t) => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.id = String(t.id);

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = t.title;

    const actions = document.createElement("span");
    actions.className = "row-actions";

    const addEditBtn = document.createElement("button");
    addEditBtn.className = "row-action row-action-edit icon-btn-sm";
    addEditBtn.title = "Edit";
    addEditBtn.innerHTML =
      '<span class="material-symbols-outlined">edit</span>';

    const delBtn = document.createElement("button");
    delBtn.className = "row-action row-action-del icon-btn-sm";
    delBtn.title = "Delete";
    delBtn.setAttribute("aria-label", "Delete task");
    delBtn.innerHTML =
      '<span class="material-symbols-outlined" aria-hidden="true">delete</span>';

    actions.appendChild(addEditBtn);
    actions.appendChild(delBtn);
    li.appendChild(title);
    li.appendChild(actions);
    ul.appendChild(li);
  });

  ul.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const li = target.closest("li.task-item") as HTMLElement | null;
    if (!li) return;
    const id = Number(li.dataset.id);
    if (!id) return;
    if (target.closest(".row-action-edit")) {
      const task = tasks.find((x) => x.id === id);
      if (task) onOpenEdit(task);
      return;
    }
    if (target.closest(".row-action-del")) {
      if (confirm("Are you sure you want to delete this task?")) {
        onDelete?.(id);
      }
      return;
    }
  });

  container.appendChild(ul);
  return ul;
}
