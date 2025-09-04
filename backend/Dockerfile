# FlaskAPI バックエンド用 Dockerfile
FROM python:3.12-slim

WORKDIR /app

# 必要なパッケージをインストール
RUN pip install --upgrade pip
COPY requirements.txt ./
RUN pip install -r requirements.txt

# アプリケーションのソースコードをコピー
COPY app/ ./app/

# ポート開放
EXPOSE 5000

# サーバ起動コマンド（Flaskアプリ起動）
CMD ["python", "app/main.py"]