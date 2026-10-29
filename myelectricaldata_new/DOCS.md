# Documentation

## Configuration

| Option | Défaut | Description |
|---|---|---|
| `med_client_id` | vide | Client ID (format `cli_...`), dans Paramètres > API sur www.v2.myelectricaldata.fr |
| `med_client_secret` | vide | Client Secret associé |
| `med_api_url` | `https://www.v2.myelectricaldata.fr/api` | URL de la passerelle. Ne la modifiez que pour un serveur auto-hébergé |
| `debug` | `false` | Logs détaillés du backend |
| `import_v1` | `false` | Importe l'historique de l'add-on v1 au démarrage. Voir [Migration depuis la v1](#migration-depuis-la-v1) |
| `import_v1_path` | `/homeassistant/myelectricaldata/cache.db` | Chemin de la base `cache.db` de la v1 |
| `import_v1_dry_run` | `false` | Simulation : compte ce qui serait importé, sans rien écrire |
| `periode_analyse` | `defaut` | Période des statistiques annuelles : `defaut`, `tempo`, `glissante`, `calendaire` ou `personnalisee`. Voir [Période d'analyse](#période-danalyse) |
| `periode_debut` | `1/9` | Date de début de la période, au format `jj/mm` (par exemple `13/10`). Utilisée pour la période personnalisée |
| `grafana_password` | vide | Mot de passe de l'utilisateur PostgreSQL en lecture seule. Voir [Accès Grafana](#accès-grafana-optionnel) |

## Interface web

Bouton **Ouvrir l'interface utilisateur web**, ou `http://<ip-de-home-assistant>:8100`.
La connexion est automatique (utilisateur local). N'exposez pas le port 8100 sur Internet : utilisez un VPN pour un accès distant.

## Export vers Home Assistant

Dans l'interface web, onglet **Export > Home Assistant** :
- URL : `http://homeassistant:8123`
- Token : un jeton d'accès longue durée (Profil > Sécurité dans Home Assistant)

Cet export alimente notamment la [carte Lovelace](https://github.com/Marlboro62/content-card-linky-new).

## Accès Grafana (optionnel)

L'add-on peut ouvrir sa base PostgreSQL en **lecture seule** pour Grafana.

1. Dans l'onglet **Configuration**, définissez `grafana_password` (choisissez un mot de passe solide), puis redémarrez l'add-on.
2. Dans la section **Réseau** de l'add-on, renseignez un port pour `5432/tcp` (par exemple `5432`). Par défaut, il n'est pas exposé.
3. Dans Grafana (version 11 ou plus récente), ajoutez une source de données **PostgreSQL** :
   - Host : `<ip-de-home-assistant>:5432`
   - Database : `myelectricaldata_client`
   - User : `grafana_ro`
   - Password : la valeur de `grafana_password`
   - TLS/SSL Mode : `disable`
4. Importez les [dashboards prêts à l'emploi](https://github.com/Marlboro62/myelectricaldata-new-grafana).

⚠️ La connexion PostgreSQL n'est **pas chiffrée** (pas de SSL). Comme pour le port 8100, n'exposez jamais le port 5432 sur Internet : réservez-le à votre réseau local, ou limitez-le à l'adresse de votre serveur Grafana avec votre pare-feu.

## Synchronisation

Les données sont synchronisées toutes les 30 minutes. Les périodes manquantes sont récupérées automatiquement.

## Sauvegarde

La base PostgreSQL et les secrets sont dans le dossier `/data` de l'add-on, inclus dans les sauvegardes Home Assistant.

## Dépannage

- La première ligne du **Journal** indique la version amont utilisée.
- Activez l'option `debug` pour plus de détails.
- Les problèmes liés à l'add-on se signalent sur [ce dépôt](https://github.com/Marlboro62/hassio-addons/issues).
- Les problèmes liés à MyElectricalData lui-même se signalent sur [myelectricaldata_new](https://github.com/MyElectricalData/myelectricaldata_new/issues).

## Période d'analyse

La page **Préférences** (menu en bas à gauche de l'interface) permet de choisir la période des statistiques annuelles : année Tempo, glissante, calendaire ou date personnalisée (par exemple le 13 octobre pour une facture annuelle du 13/10 au 12/10). L'option « Période d'analyse » de l'onglet Configuration permet aussi de l'imposer à tous les navigateurs ; laissez-la sur « defaut » si vous préférez régler depuis l'interface.

## Migration depuis la v1

L'add-on reprend l'historique de l'add-on MyElectricalData v1 avec l'**outil d'import officiel** de MyElectricalData (2.7.0 et suivantes), sans rien redemander à la passerelle (et donc sans consommer de quota). Il importe, pour chaque PDL présent à la fois dans la v1 et dans la new :

- la consommation et la production journalières ;
- les courbes de charge de consommation et de production ;
- la puissance maximale de chaque jour.

Les lignes que la v1 avait enregistrées sans vraie donnée (consommation ou puissance à 0, échecs, journées de courbe incomplètes encore récupérables par la new) sont écartées. Tempo et EcoWatt sont récupérés par MyElectricalData new lui-même.

1. Laissez l'add-on v1 en place, **sans modifier sa configuration** (retirer un PDL de la v1 efface ses données). Sa base est lue sur une copie, jamais modifiée.
2. Dans l'onglet **Configuration**, activez **Importer l'historique de la v1** et **Simulation de l'import**.
   - Si la v1 tourne sur ce Home Assistant, gardez le chemin par défaut.
   - Sinon, copiez son fichier `cache.db` dans `/share` et indiquez `/share/cache.db`.
3. Démarrez l'add-on. L'import attend que vos PDL soient récupérés (quelques minutes au premier démarrage), puis le **Journal** affiche le bilan (`[import-v1]`) : données à ajouter, déjà présentes, lignes écartées.
4. Si le bilan vous convient, désactivez **Simulation de l'import** et redémarrez l'add-on pour l'import réel.
5. Désactivez ensuite **Importer l'historique de la v1**.

Aucune donnée de la new n'est écrasée : seules les dates manquantes sont complétées, et l'import peut être relancé sans risque. Une sauvegarde de la base est faite avant l'import réel ; elle est incluse dans les sauvegardes Home Assistant de l'add-on (**Paramètres → Système → Sauvegardes**).

Une base v1 issue d'une version modifiée de la v1, avec une révision Alembic inconnue (par exemple `d4f21c9a8b6e`, qui ajoute une colonne), est acceptée tant que les colonnes lues par l'import sont présentes : l'outil officiel le gère depuis MyElectricalData 2.12.0 ([issue #164](https://github.com/MyElectricalData/myelectricaldata_new/issues/164)), et le bilan de l'import indique la révision lue.

Si le bilan indique « PDL ignorés, absents de ce client », lancez une synchronisation depuis le Tableau de bord, attendez qu'elle se termine, puis redémarrez l'add-on.
