# Passation : add-on MyElectricalData new

Document de reprise du dépôt `Marlboro62/hassio-addons`, à mettre à jour à chaque nouvelle version.
Il décrit l'état de l'add-on, la façon de le publier et ce qu'il reste à faire.

**Dernière mise à jour : 29 octobre 2026.**

## État actuel

| Canal | Branche | Version add-on | Version MyElectricalData | Images Docker Hub |
| --- | --- | --- | --- | --- |
| Stable | `master` | 2.12.1 | 2.12.1 | `marlboro62/{arch}-myelectricaldata-new` |
| Bêta | `test-myelectricaldata-new` | 2.12.1 | 2.12.1 | `marlboro62/{arch}-myelectricaldata-new-beta` |

- Architectures : `amd64` et `aarch64` (Raspberry Pi 4 et 5), construites nativement sur les serveurs GitHub.
- Dossier de l'add-on : `myelectricaldata_new/` (slug `myelectricaldata_new`, bêta installable à côté sous le slug `myelectricaldata_new_beta`).
- L'add-on regroupe dans un seul conteneur le backend, l'interface web, PostgreSQL et nginx (mode client de
  [MyElectricalData new](https://github.com/MyElectricalData/myelectricaldata_new)), avec l'accès par le panneau latéral (Ingress).

## Publication

Tout passe par GitHub Actions : aucune construction à la main.

### Bêta : `myelectricaldata-new-beta.yml`

- **Automatique** toutes les 6 heures : si une nouvelle release amont existe, construit et vérifie les deux images,
  les pousse sur Docker Hub, met à jour la branche bêta (version, `MED_VERSION`, CHANGELOG) et ouvre une issue
  « Bêta … publiée : à tester ».
- **Manuel** (Actions → « MyElectricalData new : bêta » → Run workflow) : version amont et version d'add-on au choix
  (ex. `2.12.1.1` pour une révision propre à l'add-on), essai à blanc possible.
- Si un correctif de `patches/` ne s'applique plus, la construction échoue et **rien n'est publié**.

### Stable : `myelectricaldata-new-stable.yml`

- **Manuel uniquement**, après test de la bêta.
- Recopie les images bêta sous le nom stable, sans reconstruction : c'est exactement l'image testée.
- `master` reçoit les fichiers de l'add-on de la branche bêta (sauf `config.yaml`, dont seule la version change, et `README.md`).
  Les correctifs retirés de la bêta disparaissent donc aussi de la stable.
- Ferme l'issue « à tester » et reconstruit la démo.

### Autres workflows

| Workflow | Rôle |
| --- | --- |
| `demo.yml` | Démo de l'interface sur GitHub Pages (`/demo/`), reprise de l'image stable, et démo du thème (`/theme/`) |
| `verifier-myelectricaldata.yml` | Vérifie une branche du fork ou de l'amont avant une PR : ruff, mypy, tests, lint et build du frontend |
| `tester-docker-multiarch.yml` | Teste la construction amd64 + arm64 d'une branche, vers un registre temporaire (rien n'est publié) |
| `blueprints.yml` | Valide les blueprints avec Home Assistant |

**Prérequis :** secret `DOCKERHUB_TOKEN` (lecture et écriture sur le compte Docker Hub `marlboro62`).

## Correctifs appliqués à MyElectricalData (`myelectricaldata_new/patches/`)

Le Dockerfile applique chaque correctif sur les sources amont. Un correctif déjà présent à l'identique en amont est ignoré ;
un correctif qui ne s'applique plus bloque la construction.

### Gardés

| Correctif | Pourquoi |
| --- | --- |
| `ingress-basename.patch` | L'interface fonctionne sous le chemin d'Ingress de Home Assistant (`basename` du routeur lu dans `env.js`). Propre à l'add-on. |
| `prix-manuels.patch` | Saisie manuelle des prix de son offre (Base ou HC/HP) quand le contrat n'est pas dans la liste, conservée lors des synchronisations. |

### Retirés en 2.12.1 (intégrés en amont)

| Correctif | Intégré dans MyElectricalData |
| --- | --- |
| `lien-passerelle.patch` | 2.10.0 (PR #154) |
| `log-energy-dashboard.patch` | 2.10.0 (issue #177) |
| `offres-obsoletes.patch` | 2.10.0 (issue #173) |
| `noms-fr-entites.patch` | 2.12.0 : option `entity_language`, « fr » par défaut (PR #172) |
| `detail-taxes.patch` | 2.12.0, version amont différente (ne s'appliquait plus) |

**À chaque nouvelle version amont :** vérifier les deux correctifs restants. Si l'un est intégré en amont, le retirer
de la branche bêta avant de publier.

## Procédure de mise à jour

1. La bêta se publie seule (ou à la main avec le workflow bêta).
2. Sur le Home Assistant **de test** : sauvegarde de l'add-on bêta, mise à jour, puis contrôle du journal
   (démarrage, migrations, synchronisation, exports MQTT, VictoriaMetrics et tableau de bord Énergie).
3. Contrôles dans l'interface : noms des entités en français, page Consommation €, panneau latéral.
4. Si tout est bon : workflow stable.
5. Sur le Home Assistant **de production** : sauvegarde de l'add-on, puis mise à jour.
6. Fermer à la main les anciennes issues « Bêta … à tester » qui resteraient ouvertes.

## Écosystème

| Dépôt | Rôle |
| --- | --- |
| [hassio-addons](https://github.com/Marlboro62/hassio-addons) | Cet add-on, la démo, le thème et les blueprints |
| [myelectricaldata-proxmox](https://github.com/Marlboro62/myelectricaldata-proxmox) | Script d'installation en conteneur LXC Proxmox (sans Docker) |
| [content-card-linky-new](https://github.com/Marlboro62/content-card-linky-new) | Carte Lovelace (HACS) |
| [myelectricaldata-new-grafana](https://github.com/Marlboro62/myelectricaldata-new-grafana) | Tableaux de bord Grafana (accès PostgreSQL en lecture seule de l'add-on) |
| [myelectricaldata_new (fork)](https://github.com/Marlboro62/myelectricaldata_new) | Branches des PR vers l'amont |

## En cours

- **Script Proxmox chez community-scripts** : PR refusée le 28 octobre 2026 (DevScripts #2482), le dépôt amont n'a pas les
  600 étoiles demandées. Le script reste distribué par `myelectricaldata-proxmox`.
- **Issue amont #142** : le mainteneur attendait la publication sur community-scripts. Proposition en attente : une page
  `docs/local-client/installation/proxmox.md` qui renvoie vers `myelectricaldata-proxmox`.
- **Avertissement connu** au démarrage : `FastAPIDeprecationWarning` sur `root_path`. Il vient de MyElectricalData et
  n'empêche rien.
- **Projet** : proposer l'add-on au dépôt d'alexbelgium une fois stabilisé.

## Règles

- Support uniquement par les issues GitHub.
- Rien de personnel dans le contenu publié (README, démo, captures) : pas d'adresse, de ville, de numéro de PDL,
  d'adresse IP réelle ni d'identifiant.
- Commits en français, au format Conventional Commits.
