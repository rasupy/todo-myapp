// タスク編集モーダル
import type { Task } from "./api.js";
import { updateTask } from "./api.js";

export interface TaskEditOptions {
  onSaved?: () => Promise<void> | void;
  dialogSelector?: string;
  formSelector?: string;
  titleSelector?: string;
  contentSelector?: string;
  submitSelector?: string;
  cancelSelector?: string;
}

const DEFAULTS: Required<Omit<TaskEditOptions, "onSaved">> = {
  dialogSelector: "#taskEditDialog",
  formSelector: "#taskEditForm",
  titleSelector: "#taskEditTitle",
  contentSelector: "#taskEditContent",
  submitSelector: "#taskEditSubmit",
  cancelSelector: "#taskEditCancel",
};

let currentTask: Task | null = null;

export function openTaskEditDialog(task: Task) {
  currentTask = task;
  const dlg = document.querySelector(
    DEFAULTS.dialogSelector
  ) as HTMLDialogElement | null;
  const title = document.querySelector(
    DEFAULTS.titleSelector
  ) as HTMLInputElement | null;
  const content = document.querySelector(
    DEFAULTS.contentSelector
  ) as HTMLTextAreaElement | null;
  if (!dlg || !title || !content) return;
  title.value = task.title ?? "";
  content.value = task.content ?? "";
  dlg.showModal();
  setTimeout(() => title.focus(), 30);
}

export function initTaskEdit(options: TaskEditOptions = {}) {
  const opts = { ...DEFAULTS, ...options };
  const dlg = document.querySelector(
    opts.dialogSelector
  ) as HTMLDialogElement | null;
  const form = document.querySelector(
    opts.formSelector
  ) as HTMLFormElement | null;
  const title = document.querySelector(
    opts.titleSelector
  ) as HTMLInputElement | null;
  const content = document.querySelector(
    opts.contentSelector
  ) as HTMLTextAreaElement | null;
  const btnSubmit = document.querySelector(
    opts.submitSelector
  ) as HTMLButtonElement | null;
  const btnCancel = document.querySelector(
    opts.cancelSelector
  ) as HTMLButtonElement | null;
  if (!dlg || !form || !title || !content || !btnSubmit || !btnCancel) return;

  btnCancel.addEventListener("click", () => dlg.close());

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (btnSubmit.disabled || !currentTask) return;
    const patch: any = {
      title: title.value.trim(),
      content: content.value,
    };
    if (!patch.title) return; // タイトル必須

    btnSubmit.disabled = true;
    btnSubmit.setAttribute("data-loading", "1");
    try {
      await updateTask(currentTask.id, patch);
      await options.onSaved?.();
      dlg.close();
    } catch (err: any) {
      alert(`タスク更新に失敗しました\n${err?.message ?? "Unknown error"}`);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.removeAttribute("data-loading");
    }
  });
}
