// アプリケーションのエントリーポイント (debug instrumentation added)
import { fetchCategories, updateCategory, type Category } from "./api.js";
import { renderCategoryList } from "./categoryView.js";
import { createAddForm } from "./categoryForm.js";
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
  const addContainer = (document.querySelector("#addContainer") ||
    document
      .querySelector("#app")
      ?.querySelector("section")) as HTMLElement | null;
  const listContainer = document.querySelector("#categories") as HTMLElement;
  debugLog("dom refs", {
    addContainer: !!addContainer,
    listContainer: !!listContainer,
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

  createAddForm(addContainer as HTMLElement, async (created: Category) => {
    debugLog("onAdd:callback", created.id);
    try {
      categories = await fetchCategories();
      debugLog("onAdd:refetched", categories.length);
      render();
    } catch (e) {
      console.error(e);
      alert("カテゴリー取得に失敗しました");
    }
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
