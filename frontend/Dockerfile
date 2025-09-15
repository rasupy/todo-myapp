### Build (TypeScript -> dist)
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN --mount=type=cache,target=/root/.npm npm install --no-audit --no-fund
COPY tsconfig.json ./
COPY src ./src
ENV NODE_ENV=production
RUN npm run build

### Runtime (static files only)
FROM nginx:stable-alpine

# 公開用静的ファイル: 直接コンテキストから (SCSS 出力を含む public 配下)
COPY public/ /usr/share/nginx/html/
# コンパイル済み TS (存在すれば)
COPY --from=build /app/dist/ /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
