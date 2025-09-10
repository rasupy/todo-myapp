FROM node:18-alpine AS build

WORKDIR /app

# copy package files first for better caching
COPY package.json package-lock.json* ./

# install typescript
RUN npm install --no-audit --no-fund

# copy source and build with tsc
COPY . .
RUN npm run build

# production stage with nginx
FROM nginx:stable-alpine

# remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# copy built assets
RUN mkdir -p /usr/share/nginx/html
# copy compiled assets and static files
COPY --from=build /app/dist /usr/share/nginx/html
# copy public static files (index.html, styles, favicon etc.)
COPY public/ /usr/share/nginx/html/

# copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
