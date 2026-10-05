# Changelog

## 2.1.0.1

- Nouvelle option : import de l'historique de consommation de l'add-on MyElectricalData v1 (journalier et courbe de charge), sans consommer de quota.

## 2.1.0

Basé sur [MyElectricalData 2.1.0](https://github.com/MyElectricalData/myelectricaldata_new/releases/tag/2.1.0) :

- Export Home Assistant compatible avec content-card-linky.
- Ventilation heures pleines / heures creuses exportée vers Home Assistant et MQTT.
- La première récupération de la courbe de charge peut prendre plusieurs jours (quota de 50 appels par jour sans cache).

## 2.0.2

Basé sur [MyElectricalData 2.0.2](https://github.com/MyElectricalData/myelectricaldata_new/releases/tag/2.0.2) :

- Corrections de la compatibilité v5 de la passerelle (2.0.1, 2.0.2).
- Consentement Enedis Data Connect sans code (2.0.1).
- Remarque : « 0 enregistrement » et « contrat illisible » peuvent venir du quota journalier de la passerelle (50 appels sans cache), visible dans Mon compte sur www.v2.myelectricaldata.fr.

## 2.0.0.1

- Affiche la version amont de MyElectricalData au démarrage.
- Ajout de ce journal des modifications.

## 2.0.0

Basé sur [MyElectricalData 2.0.0](https://github.com/MyElectricalData/myelectricaldata_new/releases/tag/2.0.0) :

- Passage au format Enedis Data Connect 2026 (passerelle et client local).
- Changement incompatible : nécessite une passerelle au format Data Connect 2026.
- Remarque : « 0 enregistrement » et « contrat illisible » peuvent venir du quota journalier de la passerelle (50 appels sans cache), visible dans Mon compte sur www.v2.myelectricaldata.fr.

## 0.1.0

- Première version expérimentale : backend, interface web et PostgreSQL intégrés.
