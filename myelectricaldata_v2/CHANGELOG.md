# Changelog

## 2.0.0.1

- Affiche la version amont de MyElectricalData au démarrage.
- Ajout de ce journal des modifications.

## 2.0.0

Basé sur [MyElectricalData 2.0.0](https://github.com/MyElectricalData/myelectricaldata_new/releases/tag/2.0.0) :

- Passage au format Enedis Data Connect 2026 (passerelle et client local).
- Changement incompatible : nécessite une passerelle au format Data Connect 2026.
- Problème connu : la synchro des mesures Linky renvoie 0 enregistrement (contrat illisible), signalé au mainteneur.

## 0.1.0

- Première version expérimentale : backend, interface web et PostgreSQL intégrés.
