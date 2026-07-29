# FICHE ÉQUIPEMENT — INTERFACE PRINCIPALE

## 🎯 Objectif
Cette interface remplace l'écran d'accueil par une **fiche équipement dédiée** pour chaque équipement dans un bien. Elle fournit les informations essentielles et actions rapides en une page.

## 📊 Vue d'ensemble

### 📋 En-tête
```
┌─────────────────────────────────────────────────────────┐
│ [Logo CILIA]  Bien : Appartement Paris 17e               │
├─────────────────────────────────────────────────────────┤
│ 🏠 Équipement : Chaudière (type_personnalise)              │
│ 📍 Propriétaire (vous) ↔  Locataire (lochaî)            │
└─────────────────────────────────────────────────────────┘
```

### 📝 Section principale – Fiche technique

#### Bloc gauche – Identification
```
┌─────────────────────────────────────────────────┐
│ 🏷️ TYPE : chaudière         [🖉Modifier]          │
│ 🏭 MARQUE : Viessmann       [🖉Modifier]          │
│ 📋 MODÈLE : Vitodens 200-W  [🖉Modifier]          │
│ 🔢 NUMÉRO SÉRIE : V125001    [🖉Modifier]          │
│ 🏷️ RÉFÉRENCE : VIESS200     [🖉Modifier]          │
└─────────────────────────────────────────────────┘
```

#### Bloc droit – Dates importantes
```
┌─────────────────────────────────────────────────┐
│ 📅 DATE ACHAT : 15/03/2018   [▼]                │
│ 🕐 GARANTIE : 2 ans (jusqu'au 15/03/2020)        │
│ 🔔 ENTRETIEN PÉRIODE : Annuel                      │
│ 📅 PROCHAIN ENTRETIEN : 15/09/2026                │
│ 🗓️ DERNIER ENTRETIEN : 15/09/2025                │
└─────────────────────────────────────────────────┘
```

### 📊 Section documents – Pièces jointes et diagnostics

#### 🔧 Documents équipements
```
┌─────────────────────────────────────────────────┐
│ 📁 DOCUMENTS FICHE ÉQUIPEMENT                   │
├─────────────────────────────────────────────────┤
│ 📄 Notice d'utilisation (PDF)  ▢                │
│ 📄 Facture (PDF)              ▢                │
│ 📄 Photo équipement (JPG)      ▢                │
│ 📄 Attestation garantie (PDF)   ▢               │
├─────────────────────────────────────────────────┤
│ ➕ [Ajouter un document...]                       │
└─────────────────────────────────────────────────┘
```

#### 🏠 Documents techniques bien
```
┌─────────────────────────────────────────────────┐
│ 📁 DIAGNOSTICS DU BIEN                            │
├─────────────────────────────────────────────────┤
│ 🌡️ DPE (performance énergétique)                 │
│ ⚡ Électricité                                     │
│ 🟡 Gaz                                           │
│ 🟤 Plomb                                          │
│ ⚫ Amiante                                        │
│ ❓ Autres diagnostics                              │
└─────────────────────────────────────────────────┘
```

### 🔔 Section alertes – Rappels et échéances

```
┌─────────────────────────────────────────────────┐
│ 🚨 ALERTES ET ÉCHÉANCES                         │
├─────────────────────────────────────────────────┤
│ ⚠️ Garantie expire : 15/03/2020  →  //jours      │
│ 🔔 Entretien à faire : 15/09/2026 (dans 30 jours) │
│ 📋 Diagnostic à renouveler : DPE dans 333 jours   │
│ ⚠️ Locataire retard : entretien VMC (depuis 10 jours)│
├─────────────────────────────────────────────────┤
│ 🔄 [Actualiser]  |  📅 [Voir tous les rappels]      │
└─────────────────────────────────────────────────┘
```

### 🎮 Actions rapides / bas de page

```
┌─────────────────────────────────────────────────┐
│ 🎯 ACTIONS RAPIDES                             │
├─────────────────────────────────────────────────┤
│ ➕ [Ajout équipement]  |  📋 [liste tous]         │
│ 📞 [Contacter mandataire] | 📧 [Envoyer messagerie] │
│ 📊 [Historique]      |  ⚙️ [Paramètres]        │
└─────────────────────────────────────────────────┘
```

## 🔧 Fonctionnalités clés

### 1️⃣ Interface adaptative
- **Responsive mobile-first** – tablette, téléphone, desktop
- **Vue fenêtrée** – maintien état sur raccourcis **Ctrl+1 / Ctrl+2 / Ctrl+3**
- **Le même écran partout** – naviguez entre équipements sans perdre état

### 2️⃣ CRUD matériel
- **Visualisation** avec détails rich – marque, modèle, série
- **Modification** inline – mode édition avec validation
- **Création** nouvelle – formulaire modal/lightbox réutilisable
- **Suppression** → suppression complète avec confirmations

### 3️⃣ Gestion par responsabilité
- **Filtre rapide** entre mes équipements / sous-responsabilités locataire
- **Vue séparée** des alertes par tâche (propre vs locataire)
- **Possibilité d'identifier** la responsabilité

### 4️⃣ Recherche rapide et actions
- **Recherche dans fiche** (type, marque, numéro série)
- **Actions par raccourci clavier** (E=modifier, D=supprimer, + = créer)
- **Export** vers PDF, CSV, email

### 5️⃣ Intégration backend
- **Textures** avec API équipement
- **Upload** fichiers avec IA automatique d'extraction des données
- **Alertes en temps réel** via websockets
- **Persistance** IndexedDB pour performance offline

### 6️⃣ Accessibilité et performance
- **WCAG 2.1 AA** complet – contraste, navigation clavier
- **Transitions fluides** 60fps avec Framer Motion
- **Optimisation images** et chargement PA
- **Chargement différé** des sections secondaires

### 7️⃣ Sécurité et intégrité des données
- **Contrôle accès** basé sur rôle Propriétaire/Locataire/Mandataire
- **Protection intégrité** données du bien (pas de suppression)
- **Audit trail** pour toutes actions importantes
- **Sauvegarde automatique** localStorage/IndexedDB

### 8️⃣ Design et ergonomie UI
- **Charte graphique CILIA** bleu/blanc/gris
- **Micro-terriens** animations subtiles, feedbacks haptiques
- **Design avec úri** évite sourds couleur, indique clarté maintenant
- **Champs requis** mise en évidence claire et navigation logique

## 🔌 Prérequis d'intégration

### Endpoints API
- GET `/api/equipment` – liste paginée, filtrée
- GET `/api/equipment/:id` – détails complets
- PUT `/api/equipment/:id` – mise à jour
- DELETE `/api/equipment/:id` – suppression (avec sécurité)
- POST `/api/equipment` – création

### Mock services pour maquettage
```
classe MockEquipmentService {
  GET(id) { retourner fiche équipement mock avec données d'exemple }
  PUT(id, données) { retourner données mises à jour }
  DELETE(id) { retourner succès / { erreur } }
  POST(nouveau) { retourner nouvel équipement mock }
}
```

### Environnement de développement
```bash
# Installation
dépot git://github.com/Cecile-S/cil-vault-feature
echo "source .env.equipment.local" >> ~/.bashrc
# Afficher pour présenteur (diapos 1-30) pour start-screen
```

### Maquettage et animation
- **Outillage principal** Figma (artistique + maquettes) + Figma Plugins
- **Plugins animés** Framer + Lottie + GSAP
- **Vérification d'ux** Kaiser et Nielsen pour chaque version
- **Composants clés** React Adopter + Chromatic Storybook

## 🧪 Test et validation

### Tests unitaires
- **Couverture >=80%** avec Jest + RTL
- **Suivi visuel** avec Chromatic sur maquettes

### Tests utilisateur
- **7 scénarios clés en début de sprint** (créer/éditer/supprimer équipement)
- **Performance** Web Vitals finales < 2.5s first-contentful-paint
- **Accessibilité** Lighthouse >= 90% score d'emblée

### Validation fonctionnelle
- **Toutes données sauvegardées** app/persistance browser
- **Synchronisation responsive** entre fenêtres
- **Suivi de 3 illustrations profondes** de chaque scénario (
  1. Parcouru toutes toutes sections (fiche, documents, alertes)
  2. Complété modifications et sauvegardées
  3. Navigué entre équipements, retrouvé après refresh
)

## 🚀 Déploiement et mise en œuvre

### Étapes de déploiement MVP 2026-08-25
1. Déployer sur staging Cécile/galleries
2. Passer aux développeurs pour fermer recette
3. Valider l'expérience end-to-end intégrée avec documents de test
4. Fermer recette + clôture de l'itération feature/equipment-sheet

### TL;DR Impact sur sprint
- **Valeur émergente principale** – interface principale pour équipements
- **Guy de base principal** – un bien → une fiche équipement → une fiche principale
- **Résolution facile et rapide** – user story US-1 activités principales validées
- **Intégration correcte** responsable – preprod-local, main sensible, UI adaptable
- **Changement visuel principal** – charte CILIA, design avec úri, contraste correct depuis l'écran d'accueil

### 📅 Timeline MVP 2026-08-25
- **Aujourd'hui 07:18** — **Planifier entrée sur fiche équipement, actions rapides, accès **Ctrl+1/2/3** sur commande 
- **La suite** — écrire **fiche équipement rapide** scrollée, gérer **passe d'endpoint mock API**, **prototype d'UX Populaire** sur la version de maquettage Figma, **vérifier les 3 illustrations profondes**
- **Livrable** — **prêt pour branche feature/equipment-sheet complète et logique**