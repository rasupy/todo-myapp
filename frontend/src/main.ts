// カテゴリ一覧の取得、表示、編集、追加、削除、並べ替え
// タスク一覧の取得、表示、編集、追加、削除、並べ替え
// アーカイブ済タスクの表示、復元、削除
// それぞれのAPI呼び出し
import {
  fetchCategories,
  updateCategory,
  type Category,
  fetchTasks,
  type Task,
  reorderTasks,
  fetchArchivedTasks,
  archiveTask,
  restoreTask,
} from "./api.js";
import { initCategoryAdd } from "./categoryAdd.js";

import { renderCategoryList } from "./categoryView.js";
import { makeSortable } from "./categorySortable.js";
import { removeTask } from "./taskDel.js";
import { removeArchive } from "./archiveDel.js";
import { makeTaskSortable } from "./taskSortable.js";
import { makeArchiveSortable } from "./archiveSortable.js";
import { removeCategory } from "./categoryDel.js";
import { renderTaskList } from "./taskView.js";
import { renderArchiveList } from "./archiveView.js";
import { initTaskAdd, openTaskAddDialog } from "./taskAdd.js";
import { initTaskEdit, openTaskEditDialog } from "./taskEdit.js";
import { loadTemplates } from "./templates.js";

async function init() {
  // UIテンプレートを読み込み
  await loadTemplates();
  // DOM要素の取得
  const listContainer = document.querySelector("#categories") as HTMLElement;
  const taskContainer = document.querySelector("#tasks") as HTMLElement;
  const archiveContainer = document.querySelector("#archive") as HTMLElement;

  // 初期データ取得
  let categories: Category[] = [];
  let tasks: Task[] = [];
  let archived: Task[] = [];
  let activeCategory: Category | null = null;
  try {
    categories = await fetchCategories();
  } catch (err) {
    listContainer.textContent = String(err);
  }

  // UIユーティリティ
  const setLoading = (el: HTMLElement, on: boolean) => {
    if (on) el.dataset.loading = "1";
    else delete el.dataset.loading;
  };

  // 再描画（カテゴリリスト）
  async function reload() {
    categories = await fetchCategories();
    render();
  }

  // タスク/アーカイブの取得と両パネル再描画
  async function refreshTaskBoards() {
    if (!activeCategory) return;
    [tasks, archived] = await Promise.all([
      fetchTasks(activeCategory.id),
      fetchArchivedTasks(activeCategory.id),
    ]);
    renderTasksUI();
    renderArchiveUI();
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
      alert("Update failed");
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
    await refreshTaskBoards();
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
            before: () => setLoading(taskContainer, true),
            after: () => setLoading(taskContainer, false),
          });
          if (ok && activeCategory) await refreshTaskBoards();
        } catch (e) {
          alert("Delete failed");
        }
      },
      async (taskId: number) => {
        try {
          await archiveTask(taskId);
          if (activeCategory) await refreshTaskBoards();
        } catch (e) {
          alert("Archive failed");
        }
      }
    );
    if (ul && (ul as any).dataset.sortable !== "1" && activeCategory) {
      makeTaskSortable(ul, activeCategory.id, async (orderedIds: number[]) => {
        await reorderTasks(activeCategory.id, orderedIds);
      });
    }
  }

  function renderArchiveUI() {
    const ul = renderArchiveList(
      archiveContainer,
      archived,
      async (taskId: number) => {
        try {
          await restoreTask(taskId);
          if (activeCategory) await refreshTaskBoards();
        } catch (e) {
          alert("Restore failed");
        }
      },
      async (taskId: number) => {
        try {
          const ok = await removeArchive(taskId, {
            before: () => setLoading(archiveContainer, true),
            after: () => setLoading(archiveContainer, false),
          });
          if (ok && activeCategory) await refreshTaskBoards();
        } catch (e) {
          alert("Archive deletion failed");
        }
      }
    );
    if (ul && (ul as any).dataset.sortable !== "1" && activeCategory) {
      makeArchiveSortable(
        ul,
        activeCategory.id,
        async (orderedIds: number[]) => {
          await reorderTasks(activeCategory.id, orderedIds);
        }
      );
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
      alert("Delete failed");
    }
  }
}
// 初期化実行
init();
