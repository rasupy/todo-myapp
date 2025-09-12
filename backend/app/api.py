from flask import Blueprint, request, jsonify
from database import session_scope
from models import Category
from sqlalchemy import func, case, update

api_bp = Blueprint("api", __name__)


# 共通レスポンスヘルパ
def error(message: str, status: int):
    return jsonify({"error": message}), status


# カテゴリー一覧取得
@api_bp.route("/categories", methods=["GET"])
def list_categories():
    user_id = request.args.get("user_id", type=int)
    if user_id is None:
        return error("user_id が必要です", 400)
    with session_scope() as session:
        cats = (
            session.query(Category)
            .filter_by(user_id=user_id)
            .order_by(Category.sort_order.asc())
            .all()
        )
        return jsonify([_category_to_dict(c) for c in cats]), 200


# カテゴリー追加
@api_bp.route("/category", methods=["POST"])
def add_category():
    data = request.get_json() or {}
    title = data.get("title")
    user_id = data.get("user_id")
    if title is None or user_id is None:
        return error("title と user_id が必要です", 400)
    with session_scope() as session:
        if session.query(Category).filter_by(user_id=user_id, title=title).first():
            return error("同じタイトルのカテゴリーが既に存在します", 409)
        max_sort = (
            session.query(func.max(Category.sort_order))
            .filter_by(user_id=user_id)
            .scalar()
        )
        new_sort = 0 if max_sort is None else int(max_sort) + 1
        category = Category(title=title, user_id=user_id, sort_order=new_sort)
        session.add(category)
        # commit は session_scope 内で
        return jsonify(_category_to_dict(category)), 201


# カテゴリー名変更
@api_bp.route("/category/<int:category_id>", methods=["PUT", "PATCH"])
def rename_category(category_id):
    data = request.get_json() or {}
    new_title = data.get("title")
    user_id = data.get("user_id")
    if not new_title or user_id is None:
        return error("title と user_id が必要です", 400)
    with session_scope() as session:
        category = (
            session.query(Category)
            .filter_by(category_id=category_id, user_id=user_id)
            .first()
        )
        if not category:
            return error("指定されたカテゴリーが見つかりません", 404)
        if category.title == new_title:
            return jsonify(_category_to_dict(category)), 200
        if session.query(Category).filter_by(user_id=user_id, title=new_title).first():
            return error("同じタイトルのカテゴリーが既に存在します", 409)
        category.title = new_title
        return jsonify(_category_to_dict(category)), 200


# カテゴリー並べ替え
@api_bp.route("/categories/reorder", methods=["PATCH"])
def reorder_categories():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    ordered_ids = data.get("ordered_ids")
    if user_id is None or not isinstance(ordered_ids, list):
        return error("user_id と ordered_ids が必要です", 400)
    if len(ordered_ids) == 0:
        return error("ordered_ids が空です", 400)
    with session_scope() as session:
        mapping = {int(cid): idx for idx, cid in enumerate(ordered_ids)}
        when_pairs = [
            (Category.category_id == cid, order) for cid, order in mapping.items()
        ]
        stmt = (
            update(Category)
            .where(Category.category_id.in_(list(mapping.keys())))
            .where(Category.user_id == user_id)
            .values(sort_order=case(*when_pairs, else_=Category.sort_order))
        )
        res = session.execute(stmt)
        return jsonify({"updated": res.rowcount}), 200


# カテゴリー削除
@api_bp.route("/category/<int:category_id>", methods=["DELETE"])
def delete_category(category_id: int):
    user_id = request.args.get("user_id", type=int)
    if user_id is None:
        return error("user_id が必要です", 400)
    with session_scope() as session:
        cat = (
            session.query(Category)
            .filter_by(category_id=category_id, user_id=user_id)
            .first()
        )
        if not cat:
            return error("指定されたカテゴリーが見つかりません", 404)
        session.delete(cat)
        session.flush()
        remaining = (
            session.query(Category)
            .filter_by(user_id=user_id)
            .order_by(Category.sort_order.asc())
            .all()
        )
        for idx, c in enumerate(remaining):
            if c.sort_order != idx:
                c.sort_order = idx
        return jsonify({"deleted": True, "remaining": len(remaining)}), 200


# Json形式の共通変換
def _category_to_dict(category: Category) -> dict:
    return {
        "category_id": category.category_id,
        "category_title": category.title,
        "sort_order": category.sort_order,
        "user_id": category.user_id,
    }
