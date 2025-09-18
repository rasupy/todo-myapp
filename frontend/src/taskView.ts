// タスク一覧の表示・編集UI
import type { Task } from "./api.js";
import { getTemplate } from "./templates.js";

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
  const itemTpl = getTemplate("tmpl-task-item");
  tasks.forEach((t) => {
    const node = itemTpl.content.firstElementChild!.cloneNode(
      true
    ) as HTMLElement;
    const li = node as HTMLLIElement;
    li.dataset.id = String(t.id);
    const title = li.querySelector(".task-title") as HTMLElement | null;
    if (title) title.textContent = t.title;
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
