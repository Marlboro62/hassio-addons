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
