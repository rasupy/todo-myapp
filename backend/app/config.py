import os


# FlaskやDBの設定値を管理
class Config:
    # Flask設定
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
    DEBUG = os.getenv("FLASK_DEBUG", "False") == "True"

    # DB設定
    DATABASE_URL = os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/todo_db"
    )
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
