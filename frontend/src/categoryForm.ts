// カテゴリーを追加する機能
import { addCategory, type Category } from "./api.js";

// container: フォームを配置する要素
// onAdded: 追加成功時に呼ばれるコールバック
export function createAddForm(
  container: HTMLElement | null,
  onAdded: (cat: Category) => void
) {
  if (!container) return;

  // 既存の要素があれば再利用を試みる
  let input =
    container.querySelector<HTMLInputElement>("#newTitle") ||
    container.querySelector<HTMLInputElement>("input");
  let btn =
    container.querySelector<HTMLButtonElement>("#addBtn") ||
    container.querySelector<HTMLButtonElement>("button");

  const createdInput = !input;
  const createdBtn = !btn;

  if (!input) {
    input = document.createElement("input");
    input.placeholder = "新しいカテゴリー名";
  }

  if (!btn) {
    btn = document.createElement("button");
    btn.textContent = "追加";
  }

  if (createdInput || createdBtn) {
    container.innerHTML = "";
    container.appendChild(input);
    container.appendChild(btn);
  }

  // イベントバインディングを避ける
  if (btn.dataset && btn.dataset.addBound === "1") return;
  if (btn.dataset) btn.dataset.addBound = "1";

  btn.addEventListener("click", async () => {
    const title = input!.value.trim();
    if (!title) return;
    try {
      const created = await addCategory(title);
      input!.value = "";
      onAdded(created);
    } catch (e) {
      console.error(e);
      alert("カテゴリーの追加に失敗しました");
    }
  });
}
