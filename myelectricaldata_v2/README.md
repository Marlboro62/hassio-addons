# MyElectricalData v2 (expérimental)

Add-on **non officiel** qui fait tourner le **mode client** de [MyElectricalData v2](https://github.com/MyElectricalData/myelectricaldata_new) dans Home Assistant.

- Interface web MyElectricalData (consommation, production, Tempo, EcoWatt, offres)
- Synchronisation automatique via la passerelle [www.v2.myelectricaldata.fr](https://www.v2.myelectricaldata.fr)
- Base PostgreSQL intégrée, données incluses dans les sauvegardes Home Assistant
- Export vers Home Assistant, MQTT, VictoriaMetrics ou Jeedom (configurable dans l'interface)

## Informations

- Architecture : amd64
- Statut : expérimental, suit les versions publiées par le projet MyElectricalData
- Maintenu par Marlboro62, sans lien officiel avec l'équipe MyElectricalData

## Avant de commencer

1. Créez un compte sur [www.v2.myelectricaldata.fr](https://www.v2.myelectricaldata.fr) et donnez le consentement Enedis.
2. Récupérez votre **Client ID** et votre **Client Secret** dans **Paramètres > API**.
3. Saisissez-les dans l'onglet **Configuration** de l'add-on, puis démarrez-le.

Voir l'onglet **Documentation** pour le détail.
