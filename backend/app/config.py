import os


# データベースURLやシークレットキーなどの設定を環境変数から取得
class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
    DEBUG = os.getenv("FLASK_DEBUG", "False") == "True"
    DATABASE_URL = os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@db:5432/todo_db"
    )
