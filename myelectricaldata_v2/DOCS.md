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

Cet export alimente notamment la [carte Lovelace](https://github.com/Marlboro62/content-card-linky-v2).

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
4. Importez les [dashboards prêts à l'emploi](https://github.com/Marlboro62/myelectricaldata-v2-grafana).

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

L'add-on peut reprendre l'historique de consommation de l'add-on MyElectricalData v1, sans rien redemander à la passerelle (et donc sans consommer de quota).

1. Laissez l'add-on v1 en place : sa base est lue en lecture seule, sur une copie.
2. Dans l'onglet **Configuration**, activez **Importer l'historique de la v1**.
   - Si la v1 tourne sur ce Home Assistant, gardez le chemin par défaut.
   - Sinon, copiez son fichier `cache.db` dans `/share` et indiquez `/share/cache.db`.
3. Démarrez l'add-on. Le **Journal** affiche le bilan de l'import (`[import-v1]`) : données déjà présentes, écarts éventuels, données ajoutées.
4. Désactivez ensuite l'option.

Seule la consommation (journalière et courbe de charge) est importée. Tempo et EcoWatt sont récupérés par MyElectricalData new lui-même. Une sauvegarde de la base est faite avant l'import dans `/data/backup-avant-import-v1.sql`, et l'import est annulé en bloc en cas d'erreur.
