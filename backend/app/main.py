from flask import Flask
from werkzeug.security import generate_password_hash, check_password_hash
from database import SessionLocal, create_tables
from models import User
from config import Config
from api import api_bp
import time

app = Flask(__name__)
app.config.from_object(Config)
# APIエンドポイントをフロントエンドの呼び出しに合わせて
# /api/<endpoint>をexposeするためにURLプレフィックスを追加
app.register_blueprint(api_bp, url_prefix="/api")

"""
仮ユーザー情報
ユーザー名: testuser
メール: testuser@example.com
パスワード: password123
"""

USERNAME = "testuser"
EMAIL = "testuser@example.com"
PASSWORD = "password123"


# ユーザー取得・新規作成（リトライ機能統合）
def get_or_create_user(retries=10, delay=3):
    for i in range(retries):
        session = SessionLocal()
        try:
            user = session.query(User).filter_by(name=USERNAME).first()
            if user:
                if check_password_hash(user.password_hash, PASSWORD):
                    print("ログイン成功")
                else:
                    print("パスワードが違います")
                return user
            password_hash = generate_password_hash(PASSWORD)
            user = User(name=USERNAME, email=EMAIL, password_hash=password_hash)
            session.add(user)
            session.commit()
            print("新規登録しました")
            return user
        except Exception as e:
            print(f"[main.py] get_or_create_user failed: {e}")
            if "UndefinedTable" in str(e) or 'relation "users" does not exist' in str(
                e
            ):
                print("[main.py] テーブル未作成のため再度create_tables()を実行")
                create_tables()
            time.sleep(delay)
        finally:
            session.close()
    print("[main.py] get_or_create_user failed after retries.")


@app.route("/")
def hello():
    return "Hello, World!"


if __name__ == "__main__":
    create_tables(retries=10, delay=3)
    get_or_create_user()
    app.run(host="0.0.0.0", port=5000)
