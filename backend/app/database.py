import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base
import time
from sqlalchemy.exc import OperationalError

# DB接続設定
DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/todo_db")
engine = create_engine(DB_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)


# テーブル作成（作成済みならスキップ）
def create_tables(retries=10, delay=3):
    for i in range(retries):
        try:
            Base.metadata.create_all(engine)
            print("[database.py] Tables checked/created.")
            return
        except OperationalError as e:
            print(f"[database.py] Table creation failed: {e}")
            time.sleep(delay)
    print("[database.py] Table creation failed after retries.")


if __name__ == "__main__":
    create_tables()
