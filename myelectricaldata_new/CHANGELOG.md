# Changelog

## 2.9.0.3

- Page Consommation (€) : détail des taxes comprises dans le total (énergie HT, accise sur l'électricité, abonnement HT, TVA), dans le détail de chaque période.

## 2.9.0.2

- Offres obsolètes (grilles désactivées) synchronisées et sélectionnables : une offre choisie qui devient obsolète n'est plus supprimée et le PDL garde sa sélection (issue amont #173).

## 2.9.0.1

- Noms des capteurs Home Assistant en français par défaut, avec une option pour garder les noms anglais (page Home Assistant de l'interface). Les entity_id ne changent pas.

## 2.9.0

- Basé sur MyElectricalData 2.9.0 : [notes de version amont](https://github.com/MyElectricalData/myelectricaldata_new/releases/tag/2.9.0).

## 2.7.1

- Basé sur MyElectricalData 2.7.1 : [notes de version amont](https://github.com/MyElectricalData/myelectricaldata_new/releases/tag/2.7.1).

## 2.7.0.2

- Import v1 : accepte les bases v1 à révision non publiée (ex. d4f21c9a8b6e) dont les tables de données sont identiques ; seule la copie de travail est ajustée.

## 2.7.0.1

- Import de l'historique v1 avec l'outil officiel de MyElectricalData 2.7.0 : consommation, production et puissance max, après récupération des PDL. Nouvelle option « Simulation de l'import » (import_v1_dry_run).

## 2.7.0

- Basé sur MyElectricalData 2.7.0 : [notes de version amont](https://github.com/MyElectricalData/myelectricaldata_new/releases/tag/2.7.0).

## 2.6.1

- Basé sur MyElectricalData 2.6.1 : [notes de version amont](https://github.com/MyElectricalData/myelectricaldata_new/releases/tag/2.6.1).

## 2.5.6

- Basé sur MyElectricalData 2.5.6 : [notes de version amont](https://github.com/MyElectricalData/myelectricaldata_new/releases/tag/2.5.6).

## 2.5.5

- Basé sur MyElectricalData 2.5.5 : gestion du HTTP 429 pendant la synchro, pas par relevé dans tous les calculs (kWh, Euro, exports, comparaisons).
- Bouton « Exécuter » via la barre latérale corrigé en amont (PR #146) : le correctif propre à l’add-on est retiré.

## 2.5.3

- Basé sur MyElectricalData 2.5.3 : import des statistiques compatible Home Assistant 2025.11 et suivants (mean_type, unit_class), export MQTT planifié complété (Zen Flex).

## 2.5.1

- Basé sur MyElectricalData 2.5.1 : cache de la passerelle activé par défaut, calculs corrects pour les courbes au pas de 15 ou 30 min.
- Export MQTT planifié désormais corrigé en amont : le correctif propre à l'add-on est retiré.
- Conservé : correctif du bouton « Exécuter » via la barre latérale (en attente de la PR amont #146).

## 2.4.4.11

- Bouton « Exécuter » des exports (et import des statistiques HA) : corrige « Connexion perdue » via la barre latérale de HA.

## 2.4.4.10

- Export MQTT : il se lance aussi depuis le planificateur (PR amont #119, issue #134).

## 2.4.4.9

- Version de l'add-on vérifiée toutes les 15 minutes au lieu d'une heure : la ligne passe en orange plus vite quand une mise à jour est publiée.

## 2.4.4.8

- Retard de version : seules les versions réellement publiées pour ce canal (stable ou bêta) sont comptées, au lieu de toutes les entrées du journal.

## 2.4.4.7

- Version de l'add-on affichée en bas à gauche du menu, sous « Préférences » : verte si à jour, orange avec 1 version de retard, rouge à partir de 2 versions de retard (survol : comment mettre à jour, clic : journal des modifications).

## 2.4.4.6

- Lien du menu renommé « Passerelle » (tient sur une ligne dans la barre latérale de Home Assistant).

## 2.4.4.5

- Menu de l'interface : lien « Site MyElectricalData » vers la passerelle (simulateur, contributions de prix, compte, quotas).

## 2.4.4.4

- Interface accessible dans Home Assistant (Ingress) : bouton « Afficher dans la barre latérale », accès à distance en https sans ouvrir le port 8100.
- L'accès direct par le port 8100 reste disponible.

## 2.4.4.3

- Compatible Raspberry Pi 4 et 5 (aarch64, HAOS 64 bits) : le backend est désormais reconstruit depuis les sources officielles, l'image amont n'existant qu'en amd64.
- Infobulle du badge de version : « Paramètres > Applications ».

## 2.4.4.2

- Passage en version stable : retrait du statut « Expérimental » et de la mention dans la description.
- Aucun changement fonctionnel : image identique à la 2.4.4.1.

## 2.4.4.1

Version propre à l'add-on, toujours basée sur MyElectricalData 2.4.4 :

- Badge en bas de l'interface web : version installée de l'add-on, pastille verte « à jour », orange « mise à jour disponible », rouge à partir de 2 versions de retard (vérifié toutes les heures auprès du Supervisor, utile si l'interface reste ouverte en permanence).
- L'add-on accède à l'API du Supervisor (`hassio_api`) uniquement pour lire ses propres informations de version.

## 2.4.4

Basé sur [MyElectricalData 2.4.4](https://github.com/MyElectricalData/myelectricaldata_new/releases/tag/2.4.4) :

- Une plage de dates refusée par Enedis (erreur ADAM-ERR0123) est mémorisée 24 h au lieu d'être redemandée à chaque synchro.
- Comprend l'accès PostgreSQL en lecture seule pour Grafana de la 2.4.3.1.

## 2.4.3.1

Version propre à l'add-on, toujours basée sur MyElectricalData 2.4.3 :

- Accès PostgreSQL **en lecture seule** pour Grafana : définir l'option `grafana_password`, puis ouvrir le port 5432 dans l'onglet Réseau. Le rôle `grafana_ro` ne peut lire que les tables de mesures, de tarifs et de calendriers.
- Documentation : options Consommation/Production à cocher sur le site, lien « Visitez la page » vers le dossier de l'add-on, description de l'option Période d'analyse mise à jour.

## 2.4.3

Basé sur [MyElectricalData 2.4.3](https://github.com/MyElectricalData/myelectricaldata_new/releases/tag/2.4.3) :

- Statistiques Home Assistant importées de façon incrémentale, avec des sommes cumulées continues et sans rejeu (2.4.2, issue #111).
- Cache jour par jour de la production (2.4.3).

## 2.4.1

Basé sur [MyElectricalData 2.4.1](https://github.com/MyElectricalData/myelectricaldata_new/releases/tag/2.4.1) :

- La page Préférences (période d'analyse) fait désormais partie de MyElectricalData (2.4.0, PR #118, et ses corrections en 2.4.1, PR #131) : le correctif local de l'add-on est retiré.

## 2.3.0

Basé sur [MyElectricalData 2.3.0](https://github.com/MyElectricalData/myelectricaldata_new/releases/tag/2.3.0) (inclut 2.1.2 et 2.2.0) :

- Calendrier EDF Zen Flex et capteurs associés, coût au calendrier.
- Puissance maximale stockée localement, synchronisation plus économe.
- Jours Tempo restants corrigés, préfixe des entités Home Assistant configurable.
- Add-on : valeurs par défaut des exports adaptées à Home Assistant (URL http://homeassistant:8123, broker MQTT core-mosquitto).

## 2.1.1

Basé sur [MyElectricalData 2.1.1](https://github.com/MyElectricalData/myelectricaldata_new/releases/tag/2.1.1) :

- Puissance maximale mise en cache jour par jour (moins d'appels à la passerelle).
- Les jours sans mesure ne sont plus redemandés à chaque synchronisation.
- Fin de période exclue des requêtes (un jour en trop corrigé).
- La page Préférences de l'add-on reste incluse.

## 2.1.0.3

- Page « Préférences » dans l'interface (menu en bas à gauche) pour choisir la période d'analyse, en attendant la fusion de la PR correspondante chez MyElectricalData. L'interface est désormais compilée par l'add-on à partir du code officiel de la version suivie, avec ce correctif.

## 2.1.0.2

- Nouvelle option « Période d'analyse » : année Tempo, glissante, calendaire ou date personnalisée (ex. 13/10 pour une facture à date anniversaire). Appliquée automatiquement dans chaque navigateur, de nouveau si l'interface l'efface ou si l'option change ; un réglage fait dans l'interface reste prioritaire.

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
