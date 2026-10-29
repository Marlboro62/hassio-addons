<p>
  ☕ <strong>Si ces add-ons vous sont utiles, vous pouvez soutenir le projet :</strong>
</p>

<div style="white-space: nowrap; line-height: 0;">
  <a
    href="https://www.buymeacoffee.com/Marlboro62"
    target="_blank"
    rel="noopener noreferrer"
    style="display: inline-block; text-decoration: none; vertical-align: middle;"
  ><img
    src="https://img.buymeacoffee.com/button-api/?text=Offrir%20un%20caf%C3%A9&emoji=%E2%98%95&slug=Marlboro62&button_colour=FF5F5F&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00"
    alt="Offrir un café sur Buy Me a Coffee"
    height="45"
    style="display: block; border: 0;"
  ></a>&nbsp;&nbsp;<a
    href="https://ko-fi.com/M4M2QL45X"
    target="_blank"
    rel="noopener noreferrer"
    style="display: inline-block; text-decoration: none; vertical-align: middle;"
  ><img
    src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
    alt="Soutenir le projet sur Ko-fi"
    height="45"
    style="display: block; border: 0;"
  ></a>
</div>

# Add-ons Home Assistant de Marlboro62

Add-ons non officiels, maintenus par Marlboro62.

| Add-on | Description |
| --- | --- |
| [MyElectricalData new](https://github.com/Marlboro62/hassio-addons/tree/master/myelectricaldata_new) | Mode client de [MyElectricalData new](https://github.com/MyElectricalData/myelectricaldata_new) : interface web, synchro Linky/Tempo, PostgreSQL intégré. |
| [MyElectricalData (v1)](https://github.com/Marlboro62/hassio-addons/tree/master/enedisgateway2mqtt) | ⚠️ **Obsolète** : la v1 est abandonnée en amont. Migrez vers MyElectricalData new, dont l'option `import_v1` reprend l'historique. Version patchée de l'add-on v1 d'[alexbelgium](https://github.com/alexbelgium/hassio-addons). |

## 🧩 Fait partie de l'écosystème MyElectricalData new

Ces projets sont **non officiels**, maintenus par Marlboro62, sans lien avec l'équipe MyElectricalData. Ils s'appuient sur le [mode client de MyElectricalData new](https://github.com/MyElectricalData/myelectricaldata_new), relié à la passerelle [www.v2.myelectricaldata.fr](https://www.v2.myelectricaldata.fr).

| Projet | Rôle |
| --- | --- |
| **Add-on Home Assistant (ce dépôt)** | Installe le mode client dans Home Assistant (interface web, synchro Linky/Tempo, PostgreSQL intégré) |
| [Script Proxmox (LXC)](https://github.com/Marlboro62/myelectricaldata-proxmox) | Déploie le mode client dans un conteneur LXC Proxmox, sans Docker |
| [Carte Lovelace](https://github.com/Marlboro62/content-card-linky-new) | Affiche conso, Tempo, coût et puissance max dans un tableau de bord Home Assistant |
| [Carte Linky Appareils](https://github.com/Marlboro62/linky-appareils-card) | Coûts par circuit et par appareil (jour, mois, cycle), au tarif en cours |
| [Carte Linky Solaire](https://github.com/Marlboro62/linky-solaire-card) | Produit, importé et exporté jour par jour, autoconsommation |
| [Dashboards Grafana](https://github.com/Marlboro62/myelectricaldata-new-grafana) | Analyse la base PostgreSQL de l'add-on (Linky, Tempo, coûts) |
| [Thème Home Assistant](https://github.com/Marlboro62/hassio-addons/tree/master/themes) | Couleurs de la carte Linky en clair et sombre, et les 6 couleurs Tempo dans le tableau Énergie ([démo](https://marlboro62.github.io/hassio-addons/theme/)) |

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
| Matériel | PC (amd64) et Raspberry Pi 4 ou 5 | PC (amd64) et Raspberry Pi 4 ou 5 (aarch64, HAOS 64 bits, 2 Go de RAM minimum) |
| Interface web | port 8100 | port 8101 |
| Données | base propre à l'add-on | base séparée |

Les deux peuvent être installés côte à côte, mais **évitez de les faire tourner en même temps en continu** : ils utilisent le même compte et se partagent le quota journalier de la passerelle. Pour la plupart des utilisateurs, la version stable suffit.

## Soutenir

Si ces add-ons vous font gagner du temps ou vous rendent service, vous pouvez soutenir leur développement :

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-d32f2f?logo=buymeacoffee&logoColor=white&style=flat)](https://buymeacoffee.com/marlboro62) [![Ko-fi](https://img.shields.io/badge/Ko--fi-ff5e5b?logo=kofi&logoColor=white&style=flat)](https://ko-fi.com/M4M2QL45X)
