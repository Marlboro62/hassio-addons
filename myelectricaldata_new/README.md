Cet add-on est développé sur mon temps libre, par passion pour la domotique. S'il vous rend service, un café via l'un des boutons ci-dessous fait toujours plaisir ☕

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-d32f2f?logo=buymeacoffee&logoColor=white&style=flat)](https://buymeacoffee.com/marlboro62) [![Ko-fi](https://img.shields.io/badge/Ko--fi-ff5e5b?logo=kofi&logoColor=white&style=flat)](https://ko-fi.com/nothing_one)

Vos retours sont tout aussi précieux : bugs, idées ou améliorations, n'hésitez pas à [ouvrir une issue](https://github.com/Marlboro62/hassio-addons/issues).

# MyElectricalData new

Add-on **non officiel**, **uniquement pour architecture amd64** (pas de Raspberry Pi), qui fait tourner le **mode client** de [MyElectricalData new](https://github.com/MyElectricalData/myelectricaldata_new) dans Home Assistant.

- Interface web MyElectricalData (consommation, production, Tempo, EcoWatt, offres)
- Synchronisation automatique via la passerelle [www.v2.myelectricaldata.fr](https://www.v2.myelectricaldata.fr)
- Base PostgreSQL intégrée, données incluses dans les sauvegardes Home Assistant
- Export vers Home Assistant, MQTT, VictoriaMetrics ou Jeedom (configurable dans l'interface)
- Accès en lecture seule à la base pour Grafana (optionnel), avec des [dashboards prêts à l'emploi](https://github.com/Marlboro62/myelectricaldata-new-grafana)

## Informations

- Architecture : amd64 uniquement
- Statut : stable, suit les versions publiées par le projet MyElectricalData (les nouveautés sont d'abord testées dans l'add-on « MyElectricalData New Beta »)
- Numéro de version : par exemple `2.4.4.1` = version amont `2.4.4` de MyElectricalData, suivie d'une révision propre à l'add-on
- Maintenu par Marlboro62, sans lien officiel avec l'équipe MyElectricalData

## Avant de commencer

1. Créez un compte sur [www.v2.myelectricaldata.fr](https://www.v2.myelectricaldata.fr) et donnez le consentement Enedis.
2. Récupérez votre **Client ID** et votre **Client Secret** dans **Paramètres > API**.
3. Sur le **Tableau de bord** du site, cochez **Consommation** (et **Production** si vous produisez) sur la carte de votre PDL. L'add-on recopie ces options à chaque démarrage : sans elles, ses pages restent vides tant qu'on ne clique pas sur « Récupérer ».
4. Saisissez le **Client ID** et le **Client Secret** dans l'onglet **Configuration** de l'add-on, puis démarrez-le.

## Pour aller plus loin

- **Grafana** : définissez `grafana_password` et ouvrez le port 5432 dans la section **Réseau** de l'add-on (réseau local uniquement, sans SSL). Détail dans l'onglet **Documentation**.
- **Carte Lovelace** : [content-card-linky-new](https://github.com/Marlboro62/content-card-linky-new), qui s'appuie sur l'export Home Assistant.

Voir l'onglet **Documentation** pour le détail de toutes les options.
