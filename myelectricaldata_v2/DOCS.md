# Documentation

## Configuration

| Option | Description |
|---|---|
| `med_client_id` | Client ID (format `cli_...`), dans Paramètres > API sur www.v2.myelectricaldata.fr |
| `med_client_secret` | Client Secret associé |
| `med_api_url` | URL de la passerelle. Ne la modifiez que pour un serveur auto-hébergé |
| `debug` | Logs détaillés du backend |

## Interface web

Bouton **Ouvrir l'interface utilisateur web**, ou `http://<ip-de-home-assistant>:8100`.
La connexion est automatique (utilisateur local). N'exposez pas le port 8100 sur Internet : utilisez un VPN pour un accès distant.

## Export vers Home Assistant

Dans l'interface web, onglet **Export > Home Assistant** :
- URL : `http://homeassistant:8123`
- Token : un jeton d'accès longue durée (Profil > Sécurité dans Home Assistant)

## Synchronisation

Les données sont synchronisées toutes les 30 minutes. Les périodes manquantes sont récupérées automatiquement.

## Sauvegarde

La base PostgreSQL et les secrets sont dans le dossier `/data` de l'add-on, inclus dans les sauvegardes Home Assistant.

## Dépannage

- La première ligne du **Journal** indique la version amont utilisée.
- Activez l'option `debug` pour plus de détails.
- Les problèmes liés à MyElectricalData lui-même se signalent sur [myelectricaldata_new](https://github.com/MyElectricalData/myelectricaldata_new/issues).

## Migration depuis la v1

L'add-on peut reprendre l'historique de consommation de l'add-on MyElectricalData v1, sans rien redemander à la passerelle (et donc sans consommer de quota).

1. Laissez l'add-on v1 en place : sa base est lue en lecture seule, sur une copie.
2. Dans l'onglet **Configuration**, activez **Importer l'historique de la v1**.
   - Si la v1 tourne sur ce Home Assistant, gardez le chemin par défaut.
   - Sinon, copiez son fichier `cache.db` dans `/share` et indiquez `/share/cache.db`.
3. Démarrez l'add-on. Le **Journal** affiche le bilan de l'import (`[import-v1]`) : données déjà présentes, écarts éventuels, données ajoutées.
4. Désactivez ensuite l'option.

Seule la consommation (journalière et courbe de charge) est importée. Tempo et EcoWatt sont récupérés par la v2 elle-même. Une sauvegarde de la base est faite avant l'import dans `/data/backup-avant-import-v1.sql`, et l'import est annulé en bloc en cas d'erreur.
