ARG MED_VERSION=2.1.0
# --- Interface : code officiel de la version suivie + correctifs de l'add-on ---
FROM node:20-alpine AS webbuild
ARG MED_VERSION
RUN apk add --no-cache git
WORKDIR /src
RUN git clone --depth 1 --branch "${MED_VERSION}" https://github.com/MyElectricalData/myelectricaldata_new.git .
COPY patches/ /patches/
RUN set -e; for p in /patches/*.patch; do \
      [ -e "$p" ] || continue; \
      if git apply --check "$p" 2>/dev/null; then git apply "$p" && echo "Correctif appliqué : $p"; \
      elif git apply --reverse --check "$p" 2>/dev/null; then echo "Correctif déjà intégré en amont, ignoré : $p"; \
      else echo "ERREUR : le correctif $p ne s'applique plus sur la version ${MED_VERSION}"; exit 1; fi; \
    done
WORKDIR /src/apps/web
RUN npm ci --no-audit --no-fund && npm run build

FROM ghcr.io/myelectricaldata/myelectricaldata_new/backend:${MED_VERSION}
USER root
ARG MED_VERSION
ENV MED_VERSION=${MED_VERSION}

RUN mkdir -p /etc/postgresql-common \
 && echo "create_main_cluster = false" > /etc/postgresql-common/createcluster.conf \
 && apt-get update \
 && apt-get install -y --no-install-recommends nginx postgresql jq \
 && rm -rf /var/lib/apt/lists/* \
 && rm -f /etc/nginx/sites-enabled/default

COPY --from=webbuild /src/apps/web/dist /var/www/med
RUN printf 'window.__ENV__ = {\n  VITE_API_BASE_URL: "/api",\n  VITE_BACKEND_URL: "/api",\n  VITE_SERVER_MODE: "false",\n};\n' > /var/www/med/env.js \
 && chmod -R a+rX /var/www/med

COPY nginx.conf /etc/nginx/conf.d/med.conf
COPY run.sh /run.sh
COPY import_v1.sh /import_v1.sh
RUN chmod +x /run.sh /import_v1.sh

WORKDIR /app
ENTRYPOINT []
CMD ["/run.sh"]
