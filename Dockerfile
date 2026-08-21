# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install from the lockfile first so this layer is reused until deps change.
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# CRA inlines every REACT_APP_* value into the bundle at BUILD time, so the API
# base URL has to be known here — a Cloud Run env var set at deploy time would
# never reach the browser. Keep the default in sync with .env.production.
ARG REACT_APP_API_BASE_URL=https://investors-portal-backend-885787520862.europe-west1.run.app
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
# CI=true (Cloud Build sets no CI var, but keep it explicit) would promote CRA's
# lint warnings to errors and fail the image build on cosmetic findings.
ENV CI=false
ENV DISABLE_ESLINT_PLUGIN=true
# Source maps would ship the whole readable source tree to every visitor.
ENV GENERATE_SOURCEMAP=false
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:1.27-alpine AS runtime

# nginx:alpine renders /etc/nginx/templates/*.template with envsubst on startup,
# so `listen ${PORT}` follows whatever port Cloud Run injects. The filter keeps
# envsubst away from nginx's own $uri/$host variables.
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/build /usr/share/nginx/html

ENV NGINX_ENVSUBST_FILTER=^PORT$
ENV PORT=8080
EXPOSE 8080

# Inherits nginx:alpine's entrypoint (renders the template) and CMD.
