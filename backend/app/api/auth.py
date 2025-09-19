from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import IntegrityError
from database import session_scope
from models import User


auth_bp = Blueprint("auth", __name__)


# ユーザー情報を辞書に変換
def _user_to_dict(user: User) -> dict:
    return {"user_id": user.user_id, "name": user.name, "email": user.email}


# ユーザー登録
@auth_bp.post("/auth/register")
def register():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not name or not email or not password:
        return jsonify({"error": "name, email, password が必要です"}), 400
    if len(password) < 6:
        return jsonify({"error": "password は6文字以上にしてください"}), 400
    with session_scope() as session:
        try:
            user = User(
                name=name,
                email=email,
                password_hash=generate_password_hash(password),
            )
            session.add(user)
            session.flush()  # to get user_id
            return jsonify(_user_to_dict(user)), 201
        except IntegrityError:
            # email unique violation
            session.rollback()
            return jsonify({"error": "このメールアドレスは既に登録されています"}), 409


# ログイン
@auth_bp.post("/auth/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not email or not password:
        return jsonify({"error": "email と password が必要です"}), 400
    with session_scope() as session:
        user = session.query(User).filter_by(email=email).first()
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({"error": "メールアドレスまたはパスワードが違います"}), 401
        return jsonify(_user_to_dict(user)), 200


# ユーザー情報取得
@auth_bp.get("/auth/me")
def me():
    """簡易: クエリの user_id でユーザー情報を返す(フロントのローカル保存と併用)。"""
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "user_id が必要です"}), 400
    with session_scope() as session:
        user = session.query(User).filter_by(user_id=user_id).first()
        if not user:
            return jsonify({"error": "ユーザーが見つかりません"}), 404
        return jsonify(_user_to_dict(user)), 200


# ログアウト
@auth_bp.post("/auth/logout")
def logout():
    # セッションやトークンを使っていないため、フロント側のローカル削除を期待
    return jsonify({"ok": True}), 200
