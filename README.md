# Add-ons Home Assistant de Marlboro62

Add-ons non officiels, maintenus par Marlboro62.

| Add-on | Description |
| --- | --- |
| [MyElectricalData new](https://github.com/Marlboro62/hassio-addons/blob/master/myelectricaldata_new) | Mode client de [MyElectricalData new](https://github.com/MyElectricalData/myelectricaldata_new) : interface web, synchro Linky/Tempo, PostgreSQL intégré (expérimental). |
| [MyElectricalData (v1)](https://github.com/Marlboro62/hassio-addons/blob/master/enedisgateway2mqtt) | Version patchée de l'add-on MyElectricalData v1, issue du dépôt d'[alexbelgium](https://github.com/alexbelgium/hassio-addons). |

## 🧩 Fait partie de l'écosystème MyElectricalData new

Ces projets sont **non officiels**, maintenus par Marlboro62, sans lien avec l'équipe MyElectricalData. Ils s'appuient sur le [mode client de MyElectricalData new](https://github.com/MyElectricalData/myelectricaldata_new).

| Projet | Rôle |
| --- | --- |
| **Add-on Home Assistant (ce dépôt)** | Installe le mode client new dans Home Assistant (interface web, synchro Linky/Tempo, PostgreSQL intégré) |
| [Script Proxmox (LXC)](https://github.com/Marlboro62/myelectricaldata-proxmox) | Déploie le mode client new dans un conteneur LXC Proxmox, sans Docker |
| [Carte Lovelace](https://github.com/Marlboro62/content-card-linky-new) | Affiche conso, Tempo, coût et puissance max dans un tableau de bord Home Assistant |
| [Dashboards Grafana](https://github.com/Marlboro62/myelectricaldata-new-grafana) | Analyse la base PostgreSQL de l'add-on (Linky, Tempo, coûts) |

## Installation

Dans Home Assistant : **Paramètres → Modules complémentaires → Boutique → ⋮ → Dépôts**, puis ajouter :

- `https://github.com/Marlboro62/hassio-addons` (version publiée) ;
- `https://github.com/Marlboro62/hassio-addons#test-myelectricaldata-new` (branche de test).

À l'origine, ce dépôt est un fork de [alexbelgium/hassio-addons](https://github.com/alexbelgium/hassio-addons), allégé pour ne garder que ces add-ons.

## Quelle version installer ?

Si vous ajoutez les deux dépôts, la boutique affiche deux sections : « Add-ons Marlboro62 » (version publiée) et « Marlboro62 – branche de test (MyElectricalData new) ». Installez MyElectricalData new depuis **une seule** de ces sections, et évitez de faire tourner les deux en même temps. Avant de passer de la branche de test à la version publiée, faites une sauvegarde Home Assistant.

## Soutenir

Si cet add-on vous fait gagner du temps ou vous rend service, vous pouvez soutenir son développement :

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-d32f2f?logo=buymeacoffee&logoColor=white&style=flat)](https://buymeacoffee.com/marlboro62)
