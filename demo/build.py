#!/usr/bin/env python3
"""Construit la démo statique de MyElectricalData new à partir de l'interface de l'add-on.

    build.py <interface> <sortie> <chemin_de_base> <dossier_demo>

<interface>    : contenu de /var/www/med extrait de l'image de l'add-on
<sortie>       : dossier publié (GitHub Pages)
<chemin_de_base> : chemin sous lequel la démo est servie, ex. /hassio-addons/demo
<dossier_demo> : dossier contenant demo-engine.js et demo-data.js

Reprend les réécritures d'adresses de nginx.conf (accès Ingress), avec
<chemin_de_base> à la place de l'en-tête X-Ingress-Path, puis insère la
couche de simulation avant l'application.
"""
import pathlib
import shutil
import sys

src, out, base, demo = sys.argv[1:5]
src, out, demo = pathlib.Path(src), pathlib.Path(out), pathlib.Path(demo)
base = "/" + base.strip("/")

if out.exists():
    shutil.rmtree(out)
shutil.copytree(src, out)

SUBS = [
    ('VITE_BASE_PATH: ""', f'VITE_BASE_PATH: "{base}"'),
    ('"/api"', f'"{base}/api"'),
    ('"/api/', f'"{base}/api/'),
    ("/__MED_BASE__/", f"{base}/"),
    ('"/env.js"', f'"{base}/env.js"'),
    ('"/favicon', f'"{base}/favicon'),
    ('"/manifest.json"', f'"{base}/manifest.json"'),
    ('"/logo', f'"{base}/logo'),
    ('"/enedis_', f'"{base}/enedis_'),
    ('"/Paypal', f'"{base}/Paypal'),
    ('"/paypal', f'"{base}/paypal'),
    ('"/buy_me', f'"{base}/buy_me'),
    ('"/qr-code', f'"{base}/qr-code'),
    ('href:"/', f'href:"{base}/'),
]

for f in out.rglob("*"):
    if f.suffix not in {".js", ".css", ".json", ".html"}:
        continue
    text = f.read_text(encoding="utf-8")
    new = text
    for a, b in SUBS:
        new = new.replace(a, b)
    if new != text:
        f.write_text(new, encoding="utf-8")

(out / "env.js").write_text(
    "window.__ENV__ = {\n"
    f'  VITE_API_BASE_URL: "{base}/api",\n'
    f'  VITE_BACKEND_URL: "{base}/api",\n'
    '  VITE_SERVER_MODE: "false",\n'
    f'  VITE_BASE_PATH: "{base}",\n'
    '  VITE_DEFAULT_MQTT_BROKER: "core-mosquitto",\n'
    '  VITE_DEFAULT_MQTT_PORT: "1883",\n'
    '  VITE_DEFAULT_TOPIC_PREFIX: "myelectricaldata",\n'
    '  VITE_DEFAULT_ENTITY_PREFIX: "myelectricaldata",\n'
    '  VITE_DEFAULT_DISCOVERY_PREFIX: "homeassistant",\n'
    '  VITE_DEFAULT_HA_URL: "http://homeassistant:8123",\n'
    '  VITE_DEFAULT_VM_URL: "",\n'
    "};\n",
    encoding="utf-8",
)

for name in ("demo-engine.js", "demo-data.js"):
    shutil.copy(demo / name, out / name)

index = out / "index.html"
html = index.read_text(encoding="utf-8")
env_tag = f'<script src="{base}/env.js"'
assert env_tag in html, "balise env.js introuvable dans index.html"
html = html.replace(
    env_tag,
    f'<script src="{base}/demo-engine.js"></script>\n    <script src="{base}/demo-data.js"></script>\n    {env_tag}',
    1,
)
index.write_text(html, encoding="utf-8")
# GitHub Pages sert 404.html pour les adresses inconnues : l'application gère la route elle-même.
shutil.copy(index, out / "404.html")
print(f"Démo construite dans {out} (base {base})")
