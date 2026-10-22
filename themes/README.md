# Thème Home Assistant « MyElectricalData »

Thème **non officiel** aux couleurs de la [carte Linky](https://github.com/Marlboro62/content-card-linky-new) : bleu ardoise, accent bleu MyElectricalData, vert Linky, cartes arrondies. Il suit le mode **clair** ou **sombre** choisi dans le profil Home Assistant (Automatique, Clair ou Sombre).

Démo : [aperçu en ligne, en clair et en sombre](https://marlboro62.github.io/hassio-addons/theme/) (tableau Énergie avec les couleurs Tempo, cartes, interrupteurs…). Elle lit directement le fichier du thème : elle est toujours à jour.

## Couleurs Tempo dans le tableau Énergie

Le thème donne une couleur à chacun des **6 postes Tempo** dans le tableau Énergie (graphique de consommation et tableau « Totaux »), avec les mêmes couleurs que la [carte Linky Appareils](https://github.com/Marlboro62/linky-appareils-card) : HC en clair, HP en soutenu.

| Position | Poste | Couleur |
| --- | --- | --- |
| 1re source | HC Bleu | `#8fb0f0` |
| 2e source | HP Bleu | `#3f7ff0` |
| 3e source | HC Blanc | `#f2f5f9` (`#dbe2ec` en mode clair) |
| 4e source | HP Blanc | `#aab3c0` |
| 5e source | HC Rouge | `#f39a9a` |
| 6e source | HP Rouge | `#ee4a4a` |

Home Assistant attribue les couleurs selon la **position** des sources, pas selon leur nom : dans **Paramètres → Tableaux de bord → Énergie → Consommation du réseau**, rangez vos 6 sources Tempo dans l'ordre ci-dessus. La carte de distribution et le diagramme de flux gardent une seule couleur pour tout le réseau.

## Installation

1. Copier [`myelectricaldata.yaml`](myelectricaldata.yaml) dans `/config/themes/`.
2. Dans `configuration.yaml`, si ce n'est pas déjà fait :
   ```yaml
   frontend:
     themes: !include_dir_merge_named themes
   ```
3. Redémarrer Home Assistant la première fois. Ensuite, après chaque modification du fichier : **Outils de développement → Actions → `frontend.reload_themes`**.
4. **Profil → Thème** : choisir « MyElectricalData ».

Les couleurs ne changent pas ? Le thème n'a sans doute pas été rechargé (étape 3), ou une autre copie du fichier dans `/config/themes/` définit aussi `MyElectricalData`.
