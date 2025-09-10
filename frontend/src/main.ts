const USER_ID = 1; // テスト用の仮ユーザー

function el(id: string) {
  return document.getElementById(id) as HTMLElement | null;
}

async function fetchCategories() {
  const listEl = el("categories");
  if (!listEl) return;
  listEl.textContent = "読み込み中...";
  try {
    const res = await fetch(`/api/categories?user_id=${USER_ID}`);
    if (!res.ok) {
      listEl.textContent = `一覧取得エラー: ${res.status}`;
      return;
    }
    const data = await res.json();
    if (Array.isArray(data) && data.length) {
      listEl.innerHTML = data
        .map(
          (c: any) =>
            `<div class="cat-item"><strong>${
              c.category_id
            }</strong>: <span class="title">${escapeHtml(
              c.category_title
            )}</span> <button data-id="${
              c.category_id
            }" class="edit">編集</button></div>`
        )
        .join("");
    } else {
      listEl.textContent = "カテゴリーがありません";
    }
    // bind edit buttons
    document.querySelectorAll("button.edit").forEach((b) => {
      b.addEventListener("click", () => {
        const id = (b as HTMLButtonElement).getAttribute("data-id");
        const title = prompt("新しいタイトルを入力してください");
        if (!id || title === null) return;
        renameCategory(Number(id), title.trim());
      });
    });
  } catch (err) {
    listEl.textContent = "通信エラー";
  }
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>\"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] || c)
  );
}

async function addCategory(title: string) {
  const resEl = el("result");
  try {
    const res = await fetch("/api/category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, user_id: USER_ID }),
    });
    const data = await res.json();
    resEl!.textContent =
      `status: ${res.status}\n` + JSON.stringify(data, null, 2);
    if (res.ok) fetchCategories();
  } catch (err) {
    resEl!.textContent = "通信エラー: " + String(err);
  }
}

async function renameCategory(categoryId: number, title: string) {
  const resEl = el("result");
  try {
    const res = await fetch(`/api/category/${categoryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, user_id: USER_ID }),
    });
    const data = await res.json();
    resEl!.textContent =
      `status: ${res.status}\n` + JSON.stringify(data, null, 2);
    if (res.ok) fetchCategories();
  } catch (err) {
    resEl!.textContent = "通信エラー: " + String(err);
  }
}

// UI bindings
document.addEventListener("DOMContentLoaded", () => {
  const addBtn = el("addBtn") as HTMLButtonElement | null;
  addBtn?.addEventListener("click", () => {
    const input = document.querySelector(
      "#newTitle"
    ) as HTMLInputElement | null;
    if (!input) return;
    const val = input.value.trim();
    if (!val) return alert("タイトルを入力してください");
    addCategory(val);
    input.value = "";
  });

  fetchCategories();
});
