import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base

# DB接続設定（環境変数から取得、なければデフォルト）
DB_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/todo_db"
)
engine = create_engine(DB_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)


# テーブル作成（作成済みならスキップ）
def create_tables():
    try:
        Base.metadata.create_all(engine)
        print("[database.py] Tables checked/created.")
    except Exception as e:
        print(f"[database.py] Table creation failed: {e}")


if __name__ == "__main__":
    create_tables()
