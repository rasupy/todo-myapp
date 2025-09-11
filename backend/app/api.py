from flask import Blueprint, request, jsonify
from database import SessionLocal
from models import Category
from sqlalchemy import func, case, update

api_bp = Blueprint("api", __name__)


# カテゴリー一覧取得
@api_bp.route("/categories", methods=["GET"])
def list_categories():
    """クエリパラメータ: user_id
    レスポンス: [{ category_id, category_title, sort_order, user_id }, ...]
    """
    user_id = request.args.get("user_id", type=int)
    if user_id is None:
        return jsonify({"error": "user_id が必要です"}), 400

    session = SessionLocal()
    try:
        # 並び順は sort_order の昇順で返す（追加順: 早いものほど小さい値）
        cats = (
            session.query(Category)
            .filter_by(user_id=user_id)
            .order_by(Category.sort_order.asc())
            .all()
        )
        result = [_category_to_dict(c) for c in cats]
        return jsonify(result), 200
    finally:
        session.close()


# カテゴリー追加機能
@api_bp.route("/category", methods=["POST"])
def add_category():
    data = request.get_json() or {}
    title = data.get("title")
    user_id = data.get("user_id")
    if title is None or user_id is None:
        return jsonify({"error": "title と user_id が必要です"}), 400
    session = SessionLocal()
    try:
        exists = session.query(Category).filter_by(user_id=user_id, title=title).first()
        if exists:
            return jsonify({"error": "同じタイトルのカテゴリーが既に存在します"}), 409

        # 追加順を反映するため、同一ユーザーの現在の最大 sort_order を取得して +1
        max_sort = (
            session.query(func.max(Category.sort_order))
            .filter_by(user_id=user_id)
            .scalar()
        )
        if max_sort is None:
            new_sort = 0
        else:
            new_sort = int(max_sort) + 1

        category = Category(title=title, user_id=user_id, sort_order=new_sort)
        session.add(category)
        session.commit()
        return jsonify(_category_to_dict(category)), 201
    finally:
        session.close()


# カテゴリー名の変更機能
@api_bp.route("/category/<int:category_id>", methods=["PUT", "PATCH"])
def rename_category(category_id):
    """JSON フォーマット: { "title": "新しいタイトル", "user_id": 123 }
    エラーコード:
      400 - リクエスト不正（必須フィールド欠如）
      404 - 指定カテゴリが存在しない
      409 - 同じタイトルのカテゴリが既に存在する
    """
    data = request.get_json() or {}
    new_title = data.get("title")
    user_id = data.get("user_id")

    if not new_title or user_id is None:
        return jsonify({"error": "title と user_id が必要です"}), 400

    session = SessionLocal()
    try:
        # 対象カテゴリ存在チェック
        category = (
            session.query(Category)
            .filter_by(category_id=category_id, user_id=user_id)
            .first()
        )
        if not category:
            return jsonify({"error": "指定されたカテゴリーが見つかりません"}), 404

        # 変更前と同じタイトルならそのまま返す
        if category.title == new_title:
            return jsonify(_category_to_dict(category)), 200

        # 同一ユーザー内で同じタイトルが既に存在しないかチェック
        exists = (
            session.query(Category).filter_by(user_id=user_id, title=new_title).first()
        )
        if exists:
            return jsonify({"error": "同じタイトルのカテゴリーが既に存在します"}), 409

        # 更新実行
        category.title = new_title
        session.commit()

        return jsonify(_category_to_dict(category)), 200
    finally:
        session.close()


# カテゴリーの並べ替え
@api_bp.route("/categories/reorder", methods=["PATCH"])
def reorder_categories():
    """JSON フォーマット: { "user_id": 1, "ordered_ids": [3,1,2,...] }
    ordered_ids に含まれるカテゴリ ID のみを更新し、各 ID に対して一度の SQL UPDATE
    (CASE WHEN .. THEN .. END) で sort_order を付与します。効率を意識した実装。
    """
    data = request.get_json() or {}
    user_id = data.get("user_id")
    ordered_ids = data.get("ordered_ids")

    if user_id is None or not isinstance(ordered_ids, list):
        return jsonify({"error": "user_id と ordered_ids が必要です"}), 400

    if len(ordered_ids) == 0:
        return jsonify({"error": "ordered_ids が空です"}), 400

    session = SessionLocal()
    try:
        # 期待する ID リストに対する CASE 式を作成
        mapping = {int(cid): idx for idx, cid in enumerate(ordered_ids)}

        # 対象が指定ユーザーに属していることを保証する WHERE を付与
        # SQLAlchemy case() expects when/then pairs as positional args, not a single list
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
        session.commit()

        return jsonify({"updated": res.rowcount}), 200
    finally:
        session.close()


def _category_to_dict(category: Category) -> dict:
    """共通のレスポンス変換: Category -> dict

    keys: category_id, category_title, sort_order, user_id
    """
    return {
        "category_id": category.category_id,
        "category_title": category.title,
        "sort_order": category.sort_order,
        "user_id": category.user_id,
    }


# カテゴリーの削除
@api_bp.route("/category/<int:category_id>", methods=["DELETE"])
def delete_category(category_id: int):
    """クエリパラメータ: user_id
    成功時: { deleted: true }
    """
    user_id = request.args.get("user_id", type=int)
    if user_id is None:
        return jsonify({"error": "user_id が必要です"}), 400

    session = SessionLocal()
    try:
        cat = (
            session.query(Category)
            .filter_by(category_id=category_id, user_id=user_id)
            .first()
        )
        if not cat:
            return jsonify({"error": "指定されたカテゴリーが見つかりません"}), 404
        session.delete(cat)
        session.commit()
        return jsonify({"deleted": True}), 200
    finally:
        session.close()
