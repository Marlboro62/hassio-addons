# Démo de l'interface MyElectricalData new

Version en ligne : **https://marlboro62.github.io/hassio-addons/demo/**

La démo est la vraie interface de l'add-on, reprise telle quelle de l'image Docker
`marlboro62/amd64-myelectricaldata-new`, avec des **données fictives** :
aucun compte, aucun compteur réel, rien n'est envoyé nulle part.

| Fichier | Rôle |
| --- | --- |
| `demo-engine.js` | Intercepte les appels à l'API (`/api/…`) dans le navigateur et y répond, y compris la progression en direct des exports |
| `demo-data.js` | Génère les données : consommation sur 3 ans et courbe de charge sur 2 ans, production solaire, Tempo, EcoWatt, réseau France, offres et exports |
| `build.py` | Assemble la démo : mêmes réécritures d'adresses que l'accès Ingress de l'add-on, puis ajout des deux scripts |

Le workflow `.github/workflows/demo.yml` republie la démo à chaque nouvelle version de
l'add-on stable (modification de `myelectricaldata_new/config.yaml`), ou à la main depuis
l'onglet **Actions**.

## Tester en local

```bash
VERSION=$(sed -n 's/^version: "\(.*\)"/\1/p' myelectricaldata_new/config.yaml)
id=$(docker create marlboro62/amd64-myelectricaldata-new:$VERSION)
docker cp "$id:/var/www/med" /tmp/med-web && docker rm "$id"
python3 demo/build.py /tmp/med-web /tmp/site/hassio-addons/demo /hassio-addons/demo demo
cd /tmp/site && python3 -m http.server 8080
# puis http://localhost:8080/hassio-addons/demo/
```

Les données affichées sont calculées à partir de la date du jour : elles restent
cohérentes (veille, saison Tempo en cours…) sans mise à jour.
