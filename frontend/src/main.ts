// アプリケーションのエントリーポイント
import {
  fetchCategories,
  updateCategory,
  deleteCategory,
  type Category,
} from "./api.js";
import { renderCategoryList } from "./categoryView.js";
import { createAddForm } from "./categoryForm.js";
import { makeSortable } from "./categorySortable.js";

async function init() {
  const addContainer = (document.querySelector("#addContainer") ||
    document
      .querySelector("#app")
      ?.querySelector("section")) as HTMLElement | null;
  const listContainer = document.querySelector("#categories") as HTMLElement;

  let categories: Category[] = [];
  try {
    categories = await fetchCategories();
  } catch (err) {
    listContainer.textContent = String(err);
    categories = [];
  }

  function render() {
    const ul = renderCategoryList(listContainer, categories, onEdit, onDelete);
    if (ul && (ul as any).dataset.sortable !== "1") makeSortable(ul);
  }

  async function onEdit(id: number, title: string) {
    try {
      await updateCategory(id, title);
      // 更新後に再取得して UI を正確に反映
      categories = await fetchCategories();
      render();
    } catch (e) {
      console.error(e);
      alert("更新に失敗しました");
    }
  }

  createAddForm(addContainer as HTMLElement, async (created: Category) => {
    // 追加後は最新をサーバーから取得して反映
    try {
      categories = await fetchCategories();
      render();
    } catch (e) {
      console.error(e);
      alert("カテゴリー取得に失敗しました");
    }
  });

  render();

  async function onDelete(id: number) {
    try {
      await deleteCategory(id);
      categories = await fetchCategories();
      render();
    } catch (e) {
      console.error(e);
      alert("削除に失敗しました");
    }
  }
}

init().catch((e) => console.error(e));
