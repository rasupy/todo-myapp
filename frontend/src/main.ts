// アプリケーションのエントリーポイント (debug instrumentation added)
import {
  fetchCategories,
  updateCategory,
  addCategory,
  type Category,
} from "./api.js";

// Build stamp for cache verification (updated automatically by manual edits)
// NOTE: Update this line to force browsers/proxies to fetch a new main.js when needed.
console.log("[BUILD] VERSION=0.1.0 TIMESTAMP=2025-09-14T00:00:00Z");
import { renderCategoryList } from "./categoryView.js";
import { makeSortable } from "./categorySortable.js";
import { removeCategory } from "./categoryDel.js";

// グローバル診断オブジェクト
(window as any).__APP_DEBUG__ = { logs: [] };
function debugLog(...args: any[]) {
  console.log("[APP]", ...args);
  (window as any).__APP_DEBUG__.logs.push(args);
}

debugLog("script loaded: main.ts executing");

async function init() {
  debugLog("init:start");
  const listContainer = document.querySelector("#categories") as HTMLElement;
  const btnAdd = document.querySelector(
    "#btnCatAdd"
  ) as HTMLButtonElement | null;
  const dlg = document.querySelector(
    "#catAddDialog"
  ) as HTMLDialogElement | null;
  const dlgForm = document.querySelector(
    "#catAddForm"
  ) as HTMLFormElement | null;
  const dlgInput = document.querySelector(
    "#catAddInput"
  ) as HTMLInputElement | null;
  const dlgCancel = document.querySelector(
    "#catAddCancel"
  ) as HTMLButtonElement | null;
  debugLog("dom refs", {
    listContainer: !!listContainer,
    btnAdd: !!btnAdd,
    dlg: !!dlg,
  });

  let categories: Category[] = [];
  try {
    categories = await fetchCategories();
    debugLog("fetchCategories:success", categories.length);
  } catch (err) {
    debugLog("fetchCategories:error", err);
    listContainer.textContent = String(err);
    categories = [];
  }

  function render() {
    debugLog("render:begin", categories.length);
    const ul = renderCategoryList(listContainer, categories, onEdit, onDelete);
    if (ul && (ul as any).dataset.sortable !== "1") {
      makeSortable(ul);
      debugLog("sortable:attached");
    }
    debugLog("render:end");
  }

  async function onEdit(id: number, title: string) {
    debugLog("onEdit:invoke", id, title);
    try {
      await updateCategory(id, title);
      debugLog("onEdit:updated", id);
      categories = await fetchCategories();
      debugLog("onEdit:refetched", categories.length);
      render();
    } catch (e) {
      console.error(e);
      alert("更新に失敗しました");
    }
  }

  // モード管理は不要になったため削除

  // --- Add モーダル制御 ---
  if (btnAdd && dlg && dlgForm && dlgInput && dlgCancel) {
    btnAdd.addEventListener("click", () => {
      dlgInput.value = "";
      dlg.showModal();
      setTimeout(() => dlgInput.focus(), 30);
    });
    dlgCancel.addEventListener("click", () => dlg.close());
    dlgForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = dlgInput.value.trim();
      if (!title) return;
      const submitBtn = dlgForm.querySelector(
        "#catAddSubmit"
      ) as HTMLButtonElement | null;
      if (submitBtn?.disabled) return; // 多重防止
      if (submitBtn) submitBtn.disabled = true;
      submitBtn?.setAttribute("data-loading", "1");
      try {
        const created = await addCategory(title);
        debugLog("modalAdd:created", created.id);
        categories = await fetchCategories();
        render();
        dlg.close();
      } catch (err: any) {
        console.error(err);
        alert(`追加に失敗しました\n${err?.message ?? "Unknown error"}`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.removeAttribute("data-loading");
        }
      }
    });
    // ESC キーは dialog が処理
  }

  // 削除は行のアイコンからのみ実行

  // キーボードショートカット A/E/D
  window.addEventListener("keydown", (ev) => {
    if ((ev.target as HTMLElement)?.tagName === "INPUT") return;
    if (ev.key.toLowerCase() === "a" && btnAdd) btnAdd.click();
  });

  render();

  async function onDelete(id: number) {
    debugLog("onDelete:invoke", id);
    try {
      const ok = await removeCategory(id, {
        before: () => {
          listContainer.dataset.loading = "1";
          debugLog("onDelete:before", id);
        },
        after: () => {
          delete listContainer.dataset.loading;
          debugLog("onDelete:after", id);
        },
      });
      if (ok) {
        debugLog("onDelete:success", id);
        categories = await fetchCategories();
        debugLog("onDelete:refetched", categories.length);
        render();
      }
    } catch (e) {
      console.error(e);
      alert("削除に失敗しました");
    }
  }
  debugLog("init:end");
}

init().catch((e) => debugLog("init:fatal", e));
