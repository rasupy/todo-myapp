// カテゴリー削除機能
import { deleteCategory } from "./api.js";

export type DeleteOptions = {
  userId?: number; // デフォルト 1
  before?: (id: number) => void; // 送信直前フック（ボタン無効化など）
  after?: (id: number, ok: boolean) => void; // 終了後フック（復帰など）
};

// 内部状態: 進行中ID集合（連打防止）
const inFlight = new Set<number>();

export async function removeCategory(
  id: number,
  opts: DeleteOptions = {}
): Promise<boolean> {
  if (inFlight.has(id)) return false;
  inFlight.add(id);
  opts.before?.(id);
  try {
    await deleteCategory(id, opts.userId ?? undefined);
    return true;
  } catch (e) {
    throw e;
  } finally {
    inFlight.delete(id);
    opts.after?.(id, !inFlight.has(id));
  }
}
