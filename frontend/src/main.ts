// カテゴリ一覧の取得、表示、編集、追加、削除
// タスク一覧の取得、表示、編集、追加、削除
// カテゴリ並べ替え
// タスク並べ替え
// それぞれのAPI呼び出し
import {
  fetchCategories,
  updateCategory,
  type Category,
  fetchTasks,
  type Task,
  reorderTasks,
} from "./api.js";
import { initCategoryAdd } from "./categoryAdd.js";

import { renderCategoryList } from "./categoryView.js";
import { makeSortable } from "./categorySortable.js";
import { removeTask } from "./taskDel.js";
import { makeTaskSortable } from "./taskSortable.js";
import { removeCategory } from "./categoryDel.js";
import { renderTaskList } from "./taskView.js";
import { initTaskAdd, openTaskAddDialog } from "./taskAdd.js";
import { initTaskEdit, openTaskEditDialog } from "./taskEdit.js";

async function init() {
  // DOM要素の取得
  const listContainer = document.querySelector("#categories") as HTMLElement;
  const taskContainer = document.querySelector("#tasks") as HTMLElement;

  // 初期データ取得
  let categories: Category[] = [];
  let tasks: Task[] = [];
  let activeCategory: Category | null = null;
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

  // カテゴリーリスト描画
  function render() {
    const ul = renderCategoryList(
      listContainer,
      categories,
      onEdit,
      onDelete,
      onSelectCategory,
      onOpenTaskAdd
    );
    if (ul && (ul as any).dataset.sortable !== "1") {
      makeSortable(ul);
    }
  }

  // カテゴリー名の編集
  async function onEdit(id: number, title: string) {
    try {
      await updateCategory(id, title);
      await reload();
    } catch (e) {
      alert("更新に失敗しました");
    }
  }

  render();

  // カテゴリ追加機能初期化（追加後に再読込）
  initCategoryAdd({ onAdded: reload });

  // タスク追加モーダル初期化（追加後にタスク再取得）
  initTaskAdd({
    onAdded: async () => {
      if (activeCategory) {
        tasks = await fetchTasks(activeCategory.id);
        renderTasksUI();
      }
    },
  });

  // タスク編集モーダル初期化（保存後にタスク再取得）
  initTaskEdit({
    onSaved: async () => {
      if (activeCategory) {
        tasks = await fetchTasks(activeCategory.id);
        renderTasksUI();
      }
    },
  });

  async function onSelectCategory(cat: Category) {
    activeCategory = cat;
    tasks = await fetchTasks(cat.id);
    renderTasksUI();
  }

  function onOpenTaskAdd(cat: Category) {
    activeCategory = cat;
    openTaskAddDialog(cat.id);
  }

  function renderTasksUI() {
    const ul = renderTaskList(
      taskContainer,
      tasks,
      (task) => {
        openTaskEditDialog(task);
      },
      async (taskId: number) => {
        try {
          const ok = await removeTask(taskId, {
            before: () => (taskContainer.dataset.loading = "1"),
            after: () => delete taskContainer.dataset.loading,
          });
          if (ok && activeCategory) {
            tasks = await fetchTasks(activeCategory.id);
            renderTasksUI();
          }
        } catch (e) {
          alert("タスクの削除に失敗しました");
        }
      }
    );
    if (ul && (ul as any).dataset.sortable !== "1" && activeCategory) {
      makeTaskSortable(ul, activeCategory.id, async (orderedIds: number[]) => {
        await reorderTasks(activeCategory.id, orderedIds);
      });
    }
  }

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
      alert("削除に失敗しました");
    }
  }
}
// 初期化実行
init();

// 以下、関数スコープ外定義は避け、init内にヘルパーを追加
