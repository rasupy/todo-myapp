// タスク追加モーダル
import { addTask } from "./api.js";

export interface TaskAddOptions {
  onAdded?: () => Promise<void> | void;
  // セレクタ
  dialogSelector?: string;
  formSelector?: string;
  titleSelector?: string;
  contentSelector?: string;
  submitSelector?: string;
  cancelSelector?: string;
}

const DEFAULTS: Required<Omit<TaskAddOptions, "onAdded">> = {
  dialogSelector: "#taskAddDialog",
  formSelector: "#taskAddForm",
  titleSelector: "#taskAddTitle",
  contentSelector: "#taskAddContent",
  submitSelector: "#taskAddSubmit",
  cancelSelector: "#taskAddCancel",
};

let currentCategoryId: number | null = null;

export function openTaskAddDialog(categoryId: number) {
  currentCategoryId = categoryId;
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
  title.value = "";
  content.value = "";
  dlg.showModal();
  setTimeout(() => title.focus(), 30);
}

export function initTaskAdd(options: TaskAddOptions = {}) {
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
    if (btnSubmit.disabled) return;
    const cid = currentCategoryId;
    if (!cid) return;
    const t = title.value.trim();
    const c = content.value;
    if (!t) return;
    btnSubmit.disabled = true;
    btnSubmit.setAttribute("data-loading", "1");
    try {
      await addTask(cid, t, c);
      await options.onAdded?.();
      dlg.close();
    } catch (err: any) {
      alert(`タスク追加に失敗しました\n${err?.message ?? "Unknown error"}`);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.removeAttribute("data-loading");
    }
  });
}
