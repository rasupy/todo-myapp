// アプリケーションのエントリーポイント
import { fetchCategories, type Category } from "./api";
import { renderCategoryList } from "./categoryView";
import { createAddForm } from "./categoryForm";

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
    renderCategoryList(listContainer, categories, onEdit);
  }

  function onEdit(id: number, title: string) {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx >= 0) {
      categories[idx].title = title;
      render();
    }
  }

  createAddForm(addContainer as HTMLElement, (created: Category) => {
    categories.push(created);
    render();
  });

  render();
}

init().catch((e) => console.error(e));
