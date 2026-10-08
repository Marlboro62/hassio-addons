ARG MED_VERSION=2.4.4

# --- Sources officielles de la version suivie (une seule fois, sur la machine de build) ---
FROM --platform=$BUILDPLATFORM alpine:3.20 AS src
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

# --- Interface web : fichiers statiques, identiques pour toutes les architectures ---
FROM --platform=$BUILDPLATFORM node:20-alpine AS webbuild
COPY --from=src /src/apps/web /src/apps/web
WORKDIR /src/apps/web
RUN npm ci --no-audit --no-fund && npm run build

# --- Backend : reconstruit depuis les sources (l'image officielle n'existe qu'en amd64) ---
FROM python:3.12-slim-trixie AS deps
RUN apt-get update && apt-get install -y --no-install-recommends gcc libc6-dev \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=src /src/apps/api/pyproject.toml /src/apps/api/README.md ./
RUN pip install --no-cache-dir .

FROM python:3.12-slim-trixie
ARG MED_VERSION
ENV MED_VERSION=${MED_VERSION} TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY --from=deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin
COPY --from=src /src/apps/api /app
RUN rm -rf /app/tests && chmod +x /app/entrypoint.sh

RUN mkdir -p /etc/postgresql-common \
 && echo "create_main_cluster = false" > /etc/postgresql-common/createcluster.conf \
 && apt-get update \
 && apt-get install -y --no-install-recommends tzdata nginx postgresql jq \
 && rm -rf /var/lib/apt/lists/* \
 && rm -f /etc/nginx/sites-enabled/default \
 && test -d /usr/lib/postgresql/17 || { echo "PostgreSQL 17 attendu (base de données existante)"; exit 1; }

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
