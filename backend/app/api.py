from flask import Blueprint, request, jsonify
from database import SessionLocal
from models import Category
from sqlalchemy.exc import IntegrityError

api_bp = Blueprint("api", __name__)


# カテゴリー追加機能
@api_bp.route("/category", methods=["POST"])
def add_category():
    data = request.get_json() or {}
    title = data.get("title")
    user_id = data.get("user_id")

    # 入力検証
    if title is None or user_id is None:
        return jsonify({"error": "title と user_id が必要です"}), 400
    title = str(title).strip()
    if title == "":
        return jsonify({"error": "title が空です"}), 400

    session = SessionLocal()
    try:
        exists = session.query(Category).filter_by(user_id=user_id, title=title).first()
        if exists:
            return jsonify({"error": "同じタイトルのカテゴリーが既に存在します"}), 409
        category = Category(title=title, user_id=user_id)
        session.add(category)
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            return jsonify({"error": "同じタイトルのカテゴリーが既に存在します"}), 409
        except Exception:
            session.rollback()
            return jsonify({"error": "サーバーエラー"}), 500

        return (
            jsonify(
                {
                    "category_id": category.category_id,
                    "category_title": category.title,
                    "user_id": category.user_id,
                }
            ),
            201,
        )
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
            return (
                jsonify(
                    {
                        "category_id": category.category_id,
                        "category_title": category.title,
                        "user_id": category.user_id,
                    }
                ),
                200,
            )

        # 同一ユーザー内で同じタイトルが既に存在しないかチェック
        exists = (
            session.query(Category).filter_by(user_id=user_id, title=new_title).first()
        )
        if exists:
            return jsonify({"error": "同じタイトルのカテゴリーが既に存在します"}), 409

        # 更新実行
        category.title = new_title
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            return jsonify({"error": "同じタイトルのカテゴリーが既に存在します"}), 409
        except Exception:
            session.rollback()
            return jsonify({"error": "サーバーエラー"}), 500

        return (
            jsonify(
                {
                    "category_id": category.category_id,
                    "category_title": category.title,
                    "user_id": category.user_id,
                }
            ),
            200,
        )
    finally:
        session.close()
