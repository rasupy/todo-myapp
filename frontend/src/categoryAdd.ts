// カテゴリ追加ダイアログ制御モジュール
import { addCategory } from "./api.js";

export interface CategoryAddOptions {
  onAdded?: () => Promise<void> | void; // 追加成功後の再読込処理
  dialogSelector?: string; // ダイアログ要素セレクタ
  openButtonSelector?: string; // 開くボタン
  formSelector?: string; // フォーム
  inputSelector?: string; // 入力欄
  cancelSelector?: string; // キャンセルボタン
  submitSelector?: string; // 送信ボタン
  autoFocusDelayMs?: number; // フォーカス遅延
}

const DEFAULT_OPTS: Required<Omit<CategoryAddOptions, "onAdded">> = {
  dialogSelector: "#catAddDialog",
  openButtonSelector: "#btnCatAdd",
  formSelector: "#catAddForm",
  inputSelector: "#catAddInput",
  cancelSelector: "#catAddCancel",
  submitSelector: "#catAddSubmit",
  autoFocusDelayMs: 30,
};

export function initCategoryAdd(options: CategoryAddOptions = {}) {
  const opts = { ...DEFAULT_OPTS, ...options };

  const dlg = document.querySelector(
    opts.dialogSelector
  ) as HTMLDialogElement | null;
  const btnOpen = document.querySelector(
    opts.openButtonSelector
  ) as HTMLButtonElement | null;
  const form = document.querySelector(
    opts.formSelector
  ) as HTMLFormElement | null;
  const input = document.querySelector(
    opts.inputSelector
  ) as HTMLInputElement | null;
  const btnCancel = document.querySelector(
    opts.cancelSelector
  ) as HTMLButtonElement | null;
  const btnSubmit = document.querySelector(
    opts.submitSelector
  ) as HTMLButtonElement | null;

  if (!dlg || !btnOpen || !form || !input || !btnCancel || !btnSubmit) {
    // 要素不足なら何もしない
    return;
  }

  function openDialog() {
    input.value = "";
    dlg.showModal();
    setTimeout(() => input.focus(), opts.autoFocusDelayMs);
  }

  btnOpen.addEventListener("click", openDialog);
  btnCancel.addEventListener("click", () => dlg.close());

  // 送信処理
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = input.value.trim();
    if (!title) return;
    if (btnSubmit.disabled) return;
    btnSubmit.disabled = true;
    btnSubmit.setAttribute("data-loading", "1");
    try {
      await addCategory(title);
      await options.onAdded?.();
      dlg.close();
    } catch (err: any) {
      alert(`追加に失敗しました\n${err?.message ?? "Unknown error"}`);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.removeAttribute("data-loading");
    }
  });
}
