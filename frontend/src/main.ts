// アプリケーションのエントリーポイント
import { fetchCategories, updateCategory, type Category } from "./api.js";
import { renderCategoryList } from "./categoryView.js";
import { createAddForm } from "./categoryForm.js";
import { makeSortable } from "./categorySortable.js";
import { removeCategory } from "./categoryDel.js";

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
      categories = await fetchCategories();
      render();
    } catch (e) {
      console.error(e);
      alert("更新に失敗しました");
    }
  }

  createAddForm(addContainer as HTMLElement, async (created: Category) => {
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
      const ok = await removeCategory(id, {
        before: () => {
          listContainer.dataset.loading = "1";
        },
        after: () => {
          delete listContainer.dataset.loading;
        },
      });
      if (ok) {
        categories = await fetchCategories();
        render();
      }
    } catch (e) {
      console.error(e);
      alert("削除に失敗しました");
    }
  }
}

init().catch((e) => console.error(e));
