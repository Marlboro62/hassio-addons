ARG MED_VERSION=2.1.0
FROM ghcr.io/myelectricaldata/myelectricaldata_new/frontend:${MED_VERSION} AS frontend

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

COPY --from=frontend /usr/share/nginx/html /var/www/med
RUN printf 'window.__ENV__ = {\n  VITE_API_BASE_URL: "/api",\n  VITE_BACKEND_URL: "/api",\n  VITE_SERVER_MODE: "false",\n};\n' > /var/www/med/env.js \
 && chmod -R a+rX /var/www/med

COPY nginx.conf /etc/nginx/conf.d/med.conf
COPY run.sh /run.sh
RUN chmod +x /run.sh

WORKDIR /app
ENTRYPOINT []
CMD ["/run.sh"]
