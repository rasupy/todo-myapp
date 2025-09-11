// カテゴリーを編集する機能
import { Category } from "./api";

export function createEditView(
  cat: Category,
  onSave: (title: string) => Promise<void>,
  onCancel: () => void
) {
  const input = document.createElement("input");
  input.value = cat.title;
  const save = document.createElement("button");
  save.textContent = "保存";
  save.addEventListener("click", async () => {
    await onSave(input.value);
  });
  const cancel = document.createElement("button");
  cancel.textContent = "取消";
  cancel.addEventListener("click", onCancel);
  const wrap = document.createElement("div");
  wrap.appendChild(input);
  wrap.appendChild(save);
  wrap.appendChild(cancel);
  return wrap;
}
