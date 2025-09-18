from flask import Blueprint, request, jsonify
from sqlalchemy import func, case, update
from database import session_scope
from models import Category, Task
from .utils import error

# タスク関連の Blueprint
tasks_bp = Blueprint("tasks", __name__)


# タスクを辞書形式に変換
def _task_to_dict(task: Task) -> dict:
    return {
        "task_id": task.task_id,
        "task_title": task.title,
        "content": task.content,
        "status": task.status,
        "sort_order": task.sort_order,
        "user_id": task.user_id,
        "category_id": task.category_id,
    }


# すべてのタスクを取得
@tasks_bp.get("/tasks")
def list_tasks():
    user_id = request.args.get("user_id", type=int)
    category_id = request.args.get("category_id", type=int)
    status = request.args.get("status")  # e.g. "archived"
    if user_id is None or category_id is None:
        return error("user_id と category_id が必要です", 400)
    with session_scope() as session:
        cat = (
            session.query(Category)
            .filter_by(category_id=category_id, user_id=user_id)
            .first()
        )
        if not cat:
            return error("指定されたカテゴリーが見つかりません", 404)
        q = session.query(Task).filter_by(user_id=user_id, category_id=category_id)
        if status is not None:
            q = q.filter(Task.status == status)
        else:
            q = q.filter(Task.status != "archived")
        tasks = q.order_by(Task.sort_order.asc()).all()
        return jsonify([_task_to_dict(t) for t in tasks]), 200


# タスクの追加
@tasks_bp.post("/task")
def add_task():
    data = request.get_json() or {}
    title = data.get("title")
    content = data.get("content", "")
    user_id = data.get("user_id")
    category_id = data.get("category_id")
    if not title or user_id is None or category_id is None:
        return error("title, user_id, category_id が必要です", 400)
    with session_scope() as session:
        cat = (
            session.query(Category)
            .filter_by(category_id=category_id, user_id=user_id)
            .first()
        )
        if not cat:
            return error("指定されたカテゴリーが見つかりません", 404)
        max_sort = (
            session.query(func.max(Task.sort_order))
            .filter_by(user_id=user_id, category_id=category_id)
            .scalar()
        )
        new_sort = 0 if max_sort is None else int(max_sort) + 1
        task = Task(
            title=title,
            content=content,
            user_id=user_id,
            category_id=category_id,
            sort_order=new_sort,
        )
        session.add(task)
        return jsonify(_task_to_dict(task)), 201


# タスクの編集
@tasks_bp.route("/task/<int:task_id>", methods=["PUT", "PATCH"])
def edit_task(task_id: int):
    data = request.get_json() or {}
    user_id = data.get("user_id")
    title = data.get("title")
    content = data.get("content")
    status = data.get("status")
    if user_id is None:
        return error("user_id が必要です", 400)
    if title is None and content is None and status is None:
        return error("更新項目がありません", 400)
    with session_scope() as session:
        task = session.query(Task).filter_by(task_id=task_id, user_id=user_id).first()
        if not task:
            return error("指定されたタスクが見つかりません", 404)
        if title is not None:
            task.title = title
        if content is not None:
            task.content = content
        if status is not None:
            prev_status = task.status
            task.status = status
            try:
                if status == "archived":
                    max_sort = (
                        session.query(func.max(Task.sort_order))
                        .filter(
                            Task.user_id == user_id,
                            Task.category_id == task.category_id,
                            Task.status == "archived",
                        )
                        .scalar()
                    )
                else:
                    max_sort = (
                        session.query(func.max(Task.sort_order))
                        .filter(
                            Task.user_id == user_id,
                            Task.category_id == task.category_id,
                            Task.status != "archived",
                        )
                        .scalar()
                    )
                new_sort = 0 if max_sort is None else int(max_sort) + 1
                task.sort_order = new_sort
            except Exception:
                pass
        return jsonify(_task_to_dict(task)), 200


# タスクの削除
@tasks_bp.delete("/task/<int:task_id>")
def delete_task(task_id: int):
    user_id = request.args.get("user_id", type=int)
    if user_id is None:
        return error("user_id が必要です", 400)
    with session_scope() as session:
        task = session.query(Task).filter_by(task_id=task_id, user_id=user_id).first()
        if not task:
            return error("指定されたタスクが見つかりません", 404)
        category_id = task.category_id
        session.delete(task)
        session.flush()
        remaining = (
            session.query(Task)
            .filter_by(user_id=user_id, category_id=category_id)
            .order_by(Task.sort_order.asc())
            .all()
        )
        for idx, t in enumerate(remaining):
            if t.sort_order != idx:
                t.sort_order = idx
        return jsonify({"deleted": True, "remaining": len(remaining)}), 200


# タスクの並び替え
@tasks_bp.patch("/tasks/reorder")
def reorder_tasks():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    category_id = data.get("category_id")
    ordered_ids = data.get("ordered_ids")
    if user_id is None or category_id is None or not isinstance(ordered_ids, list):
        return error("user_id, category_id, ordered_ids が必要です", 400)
    if len(ordered_ids) == 0:
        return error("ordered_ids が空です", 400)
    with session_scope() as session:
        cat = (
            session.query(Category)
            .filter_by(category_id=category_id, user_id=user_id)
            .first()
        )
        if not cat:
            return error("指定されたカテゴリーが見つかりません", 404)
        mapping = {int(tid): idx for idx, tid in enumerate(ordered_ids)}
        when_pairs = [(Task.task_id == tid, order) for tid, order in mapping.items()]
        stmt = (
            update(Task)
            .where(Task.task_id.in_(list(mapping.keys())))
            .where(Task.user_id == user_id)
            .where(Task.category_id == category_id)
            .values(sort_order=case(*when_pairs, else_=Task.sort_order))
        )
        res = session.execute(stmt)
        return jsonify({"updated": res.rowcount}), 200
