// アーカイブ（=タスク）削除機能: taskDel を薄くラップ
import { deleteTask } from "./api.js";

export type DeleteOptions = {
  userId?: number;
  before?: (id: number) => void;
  after?: (id: number, ok: boolean) => void;
};

const inFlight = new Set<number>();

export async function removeArchive(
  id: number,
  opts: DeleteOptions = {}
): Promise<boolean> {
  if (inFlight.has(id)) return false;
  inFlight.add(id);
  opts.before?.(id);
  try {
    await deleteTask(id, opts.userId ?? undefined);
    return true;
  } finally {
    inFlight.delete(id);
    opts.after?.(id, !inFlight.has(id));
  }
}
