FROM node:20-alpine AS build

WORKDIR /app

# package 定義のみコピーして依存キャッシュ層を最大化
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ソースコピー（不要になった dist は含まない運用想定）
COPY tsconfig.json ./
COPY public ./public
COPY src ./src

# 本番用ビルド (tsc) -- React 等なし純 TS
RUN npm run build

# production stage with nginx
FROM nginx:stable-alpine

# remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# build ステージの成果物と public を配置
RUN mkdir -p /usr/share/nginx/html
COPY --from=build /app/public /usr/share/nginx/html/
COPY --from=build /app/dist /usr/share/nginx/html/

# copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
