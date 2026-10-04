## [Non publié]

### Corrigé
- `last_month` et `last_month_last_year` valaient 0 le 1er du mois (date UTC), car la
  période de fin était calculée depuis la veille. Elle l'est maintenant depuis le jour
  courant. Sans effet les autres jours du mois (issue officielle #640, PR #641).

## 0.15.1-annual-tempo.2026.09

Fork de MyElectricalData (base : dépôt officiel v0.13.4), image `marlboro62/myelectricaldata:patched`.

### Ajouté
- **Période annuelle personnalisable** : nouvelle option `annual_period_start` (format
  `MM-JJ`, par exemple `10-01`) pour chaque point de livraison, avec valeur par défaut
  `01-01` (année civile, comportement d'origine). Elle se règle dans le formulaire de
  configuration web (section « Global ») ou dans `config.yaml`. Une migration de base de
  données ajoute la colonne (issue officielle #621).
- Les totaux annuels (`current_year`, `last_year`, comparaison avec l'année précédente),
  les graphiques mensuels, le tableau annuel et les statistiques de prix suivent cette
  période. Le tableau annuel affiche la plage facturée, par exemple `10/2025 - 09/2026`.
- **Camembert Tempo à 6 parts** (Bleu, Blanc, Rouge × HC, HP) dans l'interface web pour
  les contrats Tempo.
- **Capteurs de pourcentage Tempo** pour l'année en cours : un capteur par catégorie dans
  l'appareil « EDF Tempo ».
- Nouveaux attributs sur le capteur principal de consommation : `annual_period_start` et
  `tempo_percentage_blue_hc`, `_blue_hp`, `_white_hc`, `_white_hp`, `_red_hc`, `_red_hp`.
  Ils permettent aux cartes Lovelace de lire ces valeurs sans configuration supplémentaire.

### Modifié
- **Noms de capteurs en français** dans Home Assistant : appareils Linky, EDF Tempo et
  RTE Tempo (par exemple `Consommation HC Bleu`, `Coût consommation HP Rouge`,
  `Historique Consommation`, `Jours Bleu`, `Prix Rouge HP`, `Aujourd'hui`, `Demain`).
- Les capteurs RTE Tempo affichent `Bleu`, `Blanc` ou `Rouge` au lieu de `BLUE`, `WHITE`
  ou `RED`. Seul l'affichage change, la logique interne reste identique.
- Les statistiques long terme du tableau de bord Énergie sont renommées en français
  (par exemple `Bleu HC Consommation`, `Coût`, `Revenu`). Home Assistant régénère les
  métadonnées en quelques minutes, sans perte d'historique. Les identifiants techniques
  des statistiques (`statistic_id`) ne changent pas.
- Version interne synchronisée avec celle de l'addon.

> **À savoir en cas de mise à jour depuis la version officielle** : les noms affichés des
> entités changent. Vérifie les cartes et les automatisations qui s'appuient sur les anciens
> libellés.

### Corrigé
- Import des statistiques vers Home Assistant : ajout de `unit_class` (`energy` pour les
  kWh, aucune pour les euros) et de `mean_type` dans les métadonnées. Ces champs ne sont
  envoyés que sur Home Assistant 2025.11 ou plus récent, et la vérification de version
  accepte les versions bêta (par exemple `2026.9.0b9`) (issue officielle #623, PR #635).
- Le libellé de l'année `current` publié en MQTT suit désormais la période annuelle
  configurée.
- Les attributs `annual_period_start` et `tempo_percentage_*` n'étaient pas publiés à cause
  d'un mauvais nom d'attribut interne (`usage_point_config` au lieu de `config_usage_point`).


## 0.13.4 (2026-01-14)
- Update to latest version from m4dm4rtig4n/myelectricaldata (changelog : https://github.com/m4dm4rtig4n/myelectricaldata/releases)

## 0.13.3 (2026-01-13)
- Update to latest version from m4dm4rtig4n/myelectricaldata (changelog : https://github.com/m4dm4rtig4n/myelectricaldata/releases)
- The Home Assistant project has deprecated support for the armv7, armhf and i386 architectures. Support wil be fully dropped in the upcoming Home Assistant 2025.12 release

- Added support for configuring extra environment variables via the `env_vars` add-on option alongside config.yaml. See https://github.com/alexbelgium/hassio-addons/wiki/Add-Environment-variables-to-your-Addon-2 for details.

## 0.13.2 (2024-05-30)

- Update to latest version from m4dm4rtig4n/myelectricaldata (changelog : <https://github.com/m4dm4rtig4n/myelectricaldata/releases>)

## 0.13.1 (2024-05-28)

- Update to latest version from m4dm4rtig4n/myelectricaldata (changelog : <https://github.com/m4dm4rtig4n/myelectricaldata/releases>)

## 0.13.0 (2024-05-25)

- Update to latest version from m4dm4rtig4n/myelectricaldata (changelog : <https://github.com/m4dm4rtig4n/myelectricaldata/releases>)

## 0.12.0 (2024-02-24)

- Update to latest version from m4dm4rtig4n/myelectricaldata

## 0.11.0 (2024-02-17)

- Update to latest version from m4dm4rtig4n/myelectricaldata

## 0.10.0 (2024-02-10)

- Update to latest version from m4dm4rtig4n/myelectricaldata

## 0.9.3 (2023-12-16)

- Update to latest version from m4dm4rtig4n/myelectricaldata

## 0.9.2-6 (2023-11-24)

- Minor bugs fixed

## 0.9.2-5 (2023-11-23)

- Minor bugs fixed

## 0.9.2-4 (2023-11-23)

- Minor bugs fixed

## 0.9.2 (2023-09-23)

- Update to latest version from m4dm4rtig4n/myelectricaldata

## 0.9.1 (2023-08-23)

- Update to latest version from m4dm4rtig4n/myelectricaldata

## 0.9.0 (2023-07-22)

- Update to latest version from m4dm4rtig4n/myelectricaldata

## 0.8.16 (2023-04-21)

- Update to latest version from m4dm4rtig4n/myelectricaldata

## 0.8.15 (2023-04-15)

- Update to latest version from m4dm4rtig4n/myelectricaldata
- Implemented healthcheck
- Ingress addition

## 0.8.13 (2023-01-22)

- Update to latest version from m4dm4rtig4n/myelectricaldata

## 0.8.13-beta5 (2023-01-21)

- Update to latest version from m4dm4rtig4n/myelectricaldata

## 0.8.13-beta1 (2023-01-07)

- Update to latest version from m4dm4rtig4n/myelectricaldata

## 0.8.12-beta1 (2022-12-31)

- Update to latest version from m4dm4rtig4n/myelectricaldata

## 0.8.11-beta6 (2022-12-25)

- Update to latest version from m4dm4rtig4n/myelectricaldata

## 0.8.11-beta1 (2022-12-17)

- Update to latest version from m4dm4rtig4n/myelectricaldata
- Export 5000 port

## 0.8.10 (2022-12-13)

- Update to latest version from m4dm4rtig4n/myelectricaldata

## 0.8.8 (2022-12-10)

- Update to latest version from m4dm4rtig4n/myelectricaldata

## 0.8.7 (2022-12-03)

- Update to latest version from m4dm4rtig4n/myelectricaldata

## 0.8.8-dev (2022-12-03)

- Update to latest version from m4dm4rtig4n/myelectricaldata

## 0.8.6-dev (2022-12-02)

- Update to latest version from m4dm4rtig4n/myelectricaldata

## 0.8.3-dev (2022-12-01)

- Update to latest version from m4dm4rtig4n/myelectricaldata
- Migration to MyElectricalData
- WARNING : update to supervisor 2022.11 before installing
- Add codenotary sign
- New standardized logic for Dockerfile build and packages installation

## 0.7.7 (2021-11-25)

- Update to latest version from m4dm4rtig4n/enedisgateway2mqtt

## 0.7.8-dev (2021-11-23)

- Update to latest version from m4dm4rtig4n/enedisgateway2mqtt

## 0.7.7-dev (2021-11-23)

- Update to latest version from m4dm4rtig4n/enedisgateway2mqtt

## 0.7.7-dev (2021-11-21)

- Update to latest version from m4dm4rtig4n/enedisgateway2mqtt

## 0.7.5 (2021-11-18)

- Update to latest version from m4dm4rtig4n/enedisgateway2mqtt
- Allows setting TZ

## 0.7.4 (2021-11-18)

- Update to latest version from m4dm4rtig4n/enedisgateway2mqtt

## 0.7.3 (2021-11-18)

- Improve code

## 0.7.1 (2021-11-17)

- Logic change for configuration, from addon options to an external config yaml
- Allows setting options through 3 ways, see addon readme
- Data validation
