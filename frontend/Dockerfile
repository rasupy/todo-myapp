### Build (TypeScript -> dist)
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN --mount=type=cache,target=/root/.npm npm install --no-audit --no-fund
COPY tsconfig.json ./
COPY src ./src
COPY public ./public
ENV NODE_ENV=production
RUN npm run build && npm run scss:build

### Runtime (static files only)
FROM nginx:stable-alpine

# 公開用静的ファイル
COPY --from=build /app/public/ /usr/share/nginx/html/
# コンパイル
COPY --from=build /app/dist/ /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
