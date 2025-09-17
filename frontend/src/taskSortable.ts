// タスク並べ替え機能
import { reorderTasks } from "./api.js";

// ul 要素に対して sortable を設定する。
export function makeTaskSortable(
  ul: HTMLUListElement,
  categoryId: number,
  onReorder?: (orderedIds: number[]) => Promise<void>
) {
  if ((ul as any).dataset.sortable === "1") return;
  (ul as any).dataset.sortable = "1";

  let dragEl: HTMLElement | null = null;
  let placeholder: HTMLElement | null = null;
  let startX = 0;
  let startY = 0;
  let started = false;
  let rect: DOMRect | null = null;
  const MOVE_THRESHOLD = 6;

  function cleanup(pu?: PointerEvent) {
    try {
      if (dragEl && pu) (dragEl as Element).releasePointerCapture(pu.pointerId);
    } catch {}
    if (placeholder && placeholder.parentElement) placeholder.remove();
    if (dragEl) {
      dragEl.style.position = "";
      dragEl.style.left = "";
      dragEl.style.top = "";
      dragEl.style.width = "";
      dragEl.style.zIndex = "";
      dragEl.classList.remove("dragging");
    }
    dragEl = null;
    placeholder = null;
    started = false;
    rect = null;
    window.removeEventListener("pointermove", onPointerMove as any);
    window.removeEventListener("pointerup", onPointerUp as any);
    window.removeEventListener("pointercancel", onPointerCancel as any);
  }

  function startDrag(li: HTMLLIElement) {
    dragEl = li;
    placeholder = document.createElement("li");
    placeholder.className = "placeholder";
    placeholder.style.height = `${li.getBoundingClientRect().height}px`;
    li.parentElement?.insertBefore(placeholder, li.nextSibling);

    rect = li.getBoundingClientRect();
    li.style.position = "fixed";
    li.style.left = `${rect.left}px`;
    li.style.top = `${rect.top}px`;
    li.style.width = `${rect.width}px`;
    li.style.zIndex = "1000";
    li.classList.add("dragging");
    started = true;
  }

  const onPointerMove = (pm: PointerEvent) => {
    if (!dragEl) return;
    if (!started) {
      const dx = pm.clientX - startX;
      const dy = pm.clientY - startY;
      if (Math.hypot(dx, dy) >= MOVE_THRESHOLD) {
        startDrag(dragEl as HTMLLIElement);
      } else return;
    }
    const r = rect as DOMRect;
    dragEl.style.left = `${pm.clientX - r.width / 2}px`;
    dragEl.style.top = `${pm.clientY - r.height / 2}px`;
    const after = getDragAfterElement(ul, pm.clientY);
    if (after == null) ul.appendChild(placeholder as HTMLElement);
    else ul.insertBefore(placeholder as HTMLElement, after);
  };

  const onPointerUp = async (pu: PointerEvent) => {
    if (!dragEl) return cleanup(pu);
    try {
      if (started && placeholder && placeholder.parentElement) {
        placeholder.parentElement.insertBefore(dragEl as Node, placeholder);
      }
      if (started) {
        const ordered: number[] = Array.from(
          ul.querySelectorAll("li:not(.placeholder)")
        )
          .map((el) => Number((el as HTMLElement).dataset.id))
          .filter(Boolean);
        if (onReorder) await onReorder(ordered);
        else await reorderTasks(categoryId, ordered);
      }
    } catch (err) {
      alert("並び替えの保存に失敗しました");
    } finally {
      cleanup(pu);
    }
  };

  const onPointerCancel = (pc: PointerEvent) => cleanup(pc);

  ul.addEventListener("pointerdown", (e) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return; // ボタン上はドラッグさせない
    const li = target.closest("li") as HTMLLIElement | null;
    if (!li) return;
    if ((e as PointerEvent).button !== 0) return;
    const pid = (e as PointerEvent).pointerId;
    startX = (e as PointerEvent).clientX;
    startY = (e as PointerEvent).clientY;
    dragEl = li;
    try {
      (li as Element).setPointerCapture(pid);
    } catch {}
    window.addEventListener("pointermove", onPointerMove as any);
    window.addEventListener("pointerup", onPointerUp as any);
    window.addEventListener("pointercancel", onPointerCancel as any);
  });
}

function getDragAfterElement(container: HTMLElement, y: number) {
  const draggableElements = Array.from(
    container.querySelectorAll("li:not(.dragging):not(.placeholder)")
  ).map((el) => el as HTMLElement);

  return draggableElements.reduce<HTMLElement | null>((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && (closest == null || offset > (closest as any)._offset)) {
      (child as any)._offset = offset;
      return child;
    }
    return closest;
  }, null);
}
