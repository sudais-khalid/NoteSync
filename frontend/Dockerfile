# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY public ./public
COPY src ./src
COPY tailwind.config.js postcss.config.js ./
# REACT_APP_API_URL is intentionally NOT set: the build falls back to a
# relative '/api' base URL, which nginx proxies to the backend service.
RUN npm run build

# ---- Runtime stage ----
# nginx-unprivileged already runs as the non-root 'nginx' user (uid 101);
# the explicit USER below just makes that visible/auditable.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
USER nginx

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
