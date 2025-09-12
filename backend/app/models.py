from sqlalchemy import (
    Column,
    Integer,
    BigInteger,
    String,
    Text,
    TIMESTAMP,
    ForeignKey,
    UniqueConstraint,
    Index,
    func,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


# ユーザーモデル
class User(Base):
    __tablename__ = "users"
    user_id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(
        TIMESTAMP(timezone=True), server_default=func.current_timestamp()
    )
    deleted_at = Column(TIMESTAMP(timezone=True))
    categories = relationship(
        "Category", back_populates="user", cascade="all, delete-orphan"
    )
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")


# カテゴリーモデル
class Category(Base):
    __tablename__ = "categories"
    category_id = Column(BigInteger, primary_key=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    sort_order = Column(Integer, default=0)
    user_id = Column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"))
    user = relationship("User", back_populates="categories")
    tasks = relationship(
        "Task", back_populates="category", cascade="all, delete-orphan"
    )
    __table_args__ = (
        UniqueConstraint("user_id", "title"),
        Index("idx_categories_sort_order", "sort_order"),
        Index(
            "idx_categories_user_sort", "user_id", "sort_order"
        ),  # 追加: ユーザー内ソート高速化
    )


# タスクモデル
class Task(Base):
    __tablename__ = "tasks"
    task_id = Column(BigInteger, primary_key=True, autoincrement=True)
    title = Column(String(32), nullable=False)
    content = Column(Text)
    status = Column(String(32), default="todo")
    sort_order = Column(Integer, default=0)
    user_id = Column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"))
    category_id = Column(
        BigInteger, ForeignKey("categories.category_id", ondelete="CASCADE")
    )
    user = relationship("User", back_populates="tasks")
    category = relationship("Category", back_populates="tasks")
    __table_args__ = (Index("idx_tasks_sort_order", "sort_order"),)
