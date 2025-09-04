from flask import Blueprint, request, jsonify
from database import SessionLocal
from models import Category

api_bp = Blueprint("api", __name__)


# カテゴリー追加機能
@api_bp.route("/category", methods=["POST"])
def add_category():
    data = request.get_json()
    title = data.get("title")
    user_id = data.get("user_id")
    session = SessionLocal()
    try:
        exists = session.query(Category).filter_by(user_id=user_id, title=title).first()
        if exists:
            return jsonify({"error": "同じタイトルのカテゴリーが既に存在します"}), 409
        category = Category(title=title, user_id=user_id)
        session.add(category)
        session.commit()
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
