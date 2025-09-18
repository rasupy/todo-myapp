from flask import jsonify


# 共通のエラーレスポンスを返すユーティリティ関数
def error(message: str, status: int):
    return jsonify({"error": message}), status
