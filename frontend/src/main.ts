// カテゴリ一覧の取得、表示、編集、追加、削除
import { fetchCategories, updateCategory, type Category } from "./api.js";
import { initCategoryAdd } from "./categoryAdd.js";

import { renderCategoryList } from "./categoryView.js";
import { makeSortable } from "./categorySortable.js";
import { removeCategory } from "./categoryDel.js";

async function init() {
  // DOM要素の取得
  const listContainer = document.querySelector("#categories") as HTMLElement;

  // 初期データ取得
  let categories: Category[] = [];
  try {
    categories = await fetchCategories();
  } catch (err) {
    listContainer.textContent = String(err);
  }

  // 再描画
  async function reload() {
    categories = await fetchCategories();
    render();
  }

  // 描画
  function render() {
    const ul = renderCategoryList(listContainer, categories, onEdit, onDelete);
    if (ul && (ul as any).dataset.sortable !== "1") {
      makeSortable(ul);
    }
  }

  // 編集
  async function onEdit(id: number, title: string) {
    try {
      await updateCategory(id, title);
      await reload();
    } catch (e) {
      console.error(e);
      alert("更新に失敗しました");
    }
  }

  render();

  // カテゴリ追加機能初期化（追加後に再読込）
  initCategoryAdd({ onAdded: reload });

  // カテゴリーの削除機能
  async function onDelete(id: number) {
    try {
      const ok = await removeCategory(id, {
        before: () => {
          listContainer.dataset.loading = "1";
        },
        after: () => {
          delete listContainer.dataset.loading;
        },
      });
      if (ok) await reload();
    } catch (e) {
      console.error(e);
      alert("削除に失敗しました");
    }
  }
}
// 初期化実行
init().catch((e) => console.error("init:fatal", e));
