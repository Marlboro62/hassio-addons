# Blueprints Home Assistant

Blueprints **non officiels** pour [MyElectricalData new](https://github.com/MyElectricalData/myelectricaldata_new) (mode client), à utiliser avec l'[add-on Home Assistant](../myelectricaldata_new), le [script Proxmox](https://github.com/Marlboro62/myelectricaldata-proxmox) ou une installation Docker, une fois l'**export Home Assistant** activé dans l'interface MyElectricalData.

## Tempo : alerte et actions les jours rouges

[![Importer le blueprint dans Home Assistant](https://my.home-assistant.io/badges/blueprint_import.svg)](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2FMarlboro62%2Fhassio-addons%2Fblob%2Fmaster%2Fblueprints%2Fautomation%2Fmarlboro62%2Ftempo_jours_rouges.yaml)

- **Notification dès l'annonce** de la couleur du lendemain (RTE la publie en général en fin de matinée ; MyElectricalData la récupère dans l'heure), et **rappel le soir** si vous le souhaitez.
- Le message indique le jour, la couleur et le **nombre de jours restants** dans la saison :
  > 🔴 Tempo : demain jour rouge
  > Demain, vendredi 16 octobre, est un jour ROUGE (heures pleines de 6 h à 22 h). Il restera 18 jours rouges sur 22 cette saison.
- **Vos actions** au début (6 h) et à la fin (22 h) des heures pleines des jours concernés : couper le chauffe-eau, passer des radiateurs en éco, décaler une recharge…
- Couleurs au choix : **rouge** par défaut, **blanc** en option.

### Installation

1. Cliquez sur le bouton ci-dessus, ou **Paramètres → Automatisations et scènes → Blueprints → Importer un blueprint** avec l'adresse :
   `https://github.com/Marlboro62/hassio-addons/blob/master/blueprints/automation/marlboro62/tempo_jours_rouges.yaml`
2. **Créer une automatisation** à partir du blueprint.
3. Renseignez l'**action de notification** (par exemple `notify.mobile_app_mon_telephone` : **Outils de développement → Actions**, tapez « notify » pour voir les vôtres), puis vos actions.

Les capteurs Tempo sont préremplis (`sensor.rte_tempo_today`, `sensor.rte_tempo_tomorrow`, `sensor.edf_tempo_info`). Selon l'installation, le capteur des jours restants peut aussi s'appeler `sensor.edf_tempo_tempo_info` : le blueprint essaie les deux. Si vos capteurs portent un autre nom, changez-les dans la section **Capteurs Tempo**.

### Exemple : radiateurs sur fil pilote

Avec des radiateurs pilotés par fil pilote via un relais (Sonoff, etc.), où le relais coupé laisse le radiateur en confort et le relais fermé le passe en éco ou hors-gel :

```yaml
# Actions au début (6 h)
- action: switch.turn_on
  target:
    entity_id:
      - switch.fil_pilote_salon
      - switch.fil_pilote_chambres
# Actions à la fin (22 h)
- action: switch.turn_off
  target:
    entity_id:
      - switch.fil_pilote_salon
      - switch.fil_pilote_chambres
```

Le sens dépend de votre montage : vérifiez quel état du relais correspond au mode réduit avant d'automatiser.

### Bon à savoir

- Un jour Tempo va de 6 h à 6 h le lendemain : les heures pleines (6 h à 22 h) sont la période chère, d'où les horaires par défaut.
- Si deux jours rouges se suivent, les actions de fin (22 h) puis de début (6 h) s'enchaînent normalement.
- Le blueprint ne fait rien les jours bleus, ni quand la couleur du lendemain n'est pas encore publiée.

Une question, un bug ? Les [Issues](https://github.com/Marlboro62/hassio-addons/issues) sont là pour ça.
