from flask import Blueprint
from .categories import categories_bp
from .tasks import tasks_bp
from .auth import auth_bp

# 共通の Blueprint を作成
api_bp = Blueprint("api", __name__)

api_bp.register_blueprint(categories_bp)
api_bp.register_blueprint(tasks_bp)
api_bp.register_blueprint(auth_bp)

__all__ = ["api_bp"]
