# Add-ons Home Assistant de Marlboro62

Add-ons non officiels, maintenus par Marlboro62.

| Add-on | Description |
| --- | --- |
| [MyElectricalData new](https://github.com/Marlboro62/hassio-addons/tree/master/myelectricaldata_new) | Mode client de [MyElectricalData new](https://github.com/MyElectricalData/myelectricaldata_new) : interface web, synchro Linky/Tempo, PostgreSQL intégré. |
| [MyElectricalData (v1)](https://github.com/Marlboro62/hassio-addons/tree/master/enedisgateway2mqtt) | Version patchée de l'add-on MyElectricalData v1, issue du dépôt d'[alexbelgium](https://github.com/alexbelgium/hassio-addons). |

## 🧩 Fait partie de l'écosystème MyElectricalData new

Ces projets sont **non officiels**, maintenus par Marlboro62, sans lien avec l'équipe MyElectricalData. Ils s'appuient sur le [mode client de MyElectricalData new](https://github.com/MyElectricalData/myelectricaldata_new), relié à la passerelle [www.v2.myelectricaldata.fr](https://www.v2.myelectricaldata.fr).

| Projet | Rôle |
| --- | --- |
| **Add-on Home Assistant (ce dépôt)** | Installe le mode client dans Home Assistant (interface web, synchro Linky/Tempo, PostgreSQL intégré) |
| [Script Proxmox (LXC)](https://github.com/Marlboro62/myelectricaldata-proxmox) | Déploie le mode client dans un conteneur LXC Proxmox, sans Docker |
| [Carte Lovelace](https://github.com/Marlboro62/content-card-linky-new) | Affiche conso, Tempo, coût et puissance max dans un tableau de bord Home Assistant |
| [Dashboards Grafana](https://github.com/Marlboro62/myelectricaldata-new-grafana) | Analyse la base PostgreSQL de l'add-on (Linky, Tempo, coûts) |

## Installation

Dans Home Assistant : **Paramètres → Applications → Boutique → ⋮ → Dépôts**, puis ajouter :

- `https://github.com/Marlboro62/hassio-addons` : version stable, add-on « MyElectricalData new » ;
- `https://github.com/Marlboro62/hassio-addons#test-myelectricaldata-new` (facultatif) : version bêta, add-on « MyElectricalData New Beta ».

À l'origine, ce dépôt est un fork de [alexbelgium/hassio-addons](https://github.com/alexbelgium/hassio-addons), allégé pour ne garder que ces add-ons.

## Quelle version installer ?

Si vous ajoutez les deux dépôts, la boutique affiche deux sections : « Add-ons Marlboro62 » (version stable) et « Marlboro62 – branche de test (MyElectricalData New Beta) ».

| | MyElectricalData new | MyElectricalData New Beta |
| --- | --- | --- |
| Statut | Stable | Expérimental, pour tester les nouveautés |
| Matériel | PC (amd64) | PC (amd64) et Raspberry Pi 4 ou 5 (aarch64, HAOS 64 bits, 2 Go de RAM minimum) |
| Interface web | port 8100 | port 8101 |
| Données | base propre à l'add-on | base séparée |

Les deux peuvent être installés côte à côte, mais **évitez de les faire tourner en même temps en continu** : ils utilisent le même compte et se partagent le quota journalier de la passerelle. Pour la plupart des utilisateurs, la version stable suffit.

## Soutenir

Si ces add-ons vous font gagner du temps ou vous rendent service, vous pouvez soutenir leur développement :

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-d32f2f?logo=buymeacoffee&logoColor=white&style=flat)](https://buymeacoffee.com/marlboro62) [![Ko-fi](https://img.shields.io/badge/Ko--fi-ff5e5b?logo=kofi&logoColor=white&style=flat)](https://ko-fi.com/nothing_one)
