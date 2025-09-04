from flask import Flask
from werkzeug.security import generate_password_hash, check_password_hash
from database import SessionLocal, create_tables
from models import User
from config import Config
from api import api_bp

app = Flask(__name__)
app.config.from_object(Config)
app.register_blueprint(api_bp)

"""
仮ユーザーを作成
ユーザー名: testuser
メールアドレス: "testuser@example.com"
パスワード: password123
"""

# 仮ユーザー情報
USERNAME = "testuser"
EMAIL = "testuser@example.com"
PASSWORD = "password123"


def get_or_create_user():
    session = SessionLocal()
    try:
        user = session.query(User).filter_by(name=USERNAME).first()
        if user:
            # 既存ユーザー: ログイン（パスワードチェック）
            if check_password_hash(user.password_hash, PASSWORD):
                print("ログイン成功")
            else:
                print("パスワードが違います")
            return user
        # 新規作成
        password_hash = generate_password_hash(PASSWORD)
        user = User(name=USERNAME, email=EMAIL, password_hash=password_hash)
        session.add(user)
        session.commit()
        print("新規登録しました")
        return user
    finally:
        session.close()


@app.route("/")
def hello():
    return "Hello, World!"


if __name__ == "__main__":
    create_tables()
    get_or_create_user()
    app.run(host="0.0.0.0", port=5000)
