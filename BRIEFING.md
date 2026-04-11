# BRIEFING CILIA v2.2 — Vision Produit Complète

## 🎯 Mission

Développer la PWA "Carnet d'Information Logement IA" (CILIA) pour qu'elle devienne le référent de la gestion documentaire du logement en France, en combinant :

- Carnet d'Information du Logement complet et durable
- Parcours simple et sécurisé dès l'estimation
- Intelligence artificielle pour classification et complétion
- Modèle de croissance via mandataires immobiliers

---

## 🏗️ Infrastructure

| Service | URL | Usage |
|---------|-----|-------|
| Frontend PWA | http://84.247.161.15:3001 | Interface utilisateur |
| Backend IA | http://localhost:8001/ai/classify | Classification documents |
| MinIO | http://localhost:9002 | Stockage documents |
| Ollama | http://localhost:11435 | IA locale (Mistral-nemo / Sonar Large / Llama 3.1) |

---

## 🎯 Positionnement Produit

### Cibles principales
1. **Propriétaires particuliers**
2. **Petits bailleurs**
3. **Mandataires immobiliers** (apporteurs d'affaires)

### Positionnement unique
- CILIA au service du **mandataire immobilier**
- Création CIL dès l'estimation ou signature du mandat
- Remise au propriétaire comme service gratuit supplémentaire
- Le futur propriétaire reçoit un CIL pré-rempli
- Abonnement après 1 an pour pérenniser

---

## ✅ MVP — Fonctionnalités Prioritaires

### 1. PWA Foundation
- [x] Manifest.json installable
- [x] Service Worker offline
- [ ] Drag & drop → IA classify

### 2. CIL dès l'estimation
- [ ] Création dossier CILIA lié au bien
- [ ] Espace sécurisé propriétaire
- [ ] Upload documents (DPE, diagnostics, titres, plans, factures, travaux, PV copro)
- [ ] Documents réutilisables : estimation → mandat → compromis → notaire

### 3. Gestion propriété & location
- [ ] CIL unique par bien avec historique
- [ ] DPE, diagnostics, travaux, factures, équipements, entretiens
- [ ] Séparation responsabilités (propriétaire vs locataire)
- [ ] Accès locataire limité (notices, rappels, trucs & astuces)

### 4. Dashboard propriétaire
- [ ] Vue DPE
- [ ] Vue équipements
- [ ] Vue entretien
- [ ] Coûts prévus

### 5. IA & Classification
- [ ] Drag & drop factures → /ai/classify
- [ ] Extraction + catégorisation + complétion
- [ ] Détection références appareils
- [ ] Recherche notices (base unique, fallback fabricant)

### 6. Rappels & Notifications
- [ ] Plan d'entretien par type/appareil
- [ ] Calendrier visuel (dernier, fréquence, responsable)
- [ ] Notifications (email, push) :
  - Prochain entretien
  - Échéance DPE
  - Fin période gratuite

### 7. Gestion des rôles
- [ ] Rôles : propriétaire, locataire, mandataire, notaire, admin
- [ ] Permissions fines (factures, équipements, rapports)

### 8. Rapports & Export
- [ ] "Résumé réglementaire"
- [ ] "Bon état du logement" (vente/location)
- [ ] PDF exportable
- [ ] Branding mandataire (logo, signature)

---

## 🔮 HORS MVP (Version Future)

### Connexion plateformes syndic
⚠️ **Ne pas implémenter dans le MVP**

- Connecteurs : VILOGI, Gercop, Crypto, etc.
- Récupération automatique documents copropriété
- Synchronisation périodique
- Badge "synchronisé avec le syndic"

---

## 💰 Modèle Économique

### Mandataire
- CILIA gratuit (ou offre légère/partenariat)
- Crée le CIL dès estimation/mandat
- Remet le CIL comme service gratuit

### Propriétaire
- Reçoit CIL pré-rempli
- 1 an "offert par le mandataire"
- Abonnement ensuite (IA, rappels, etc.)

### Tarification envisagée
- Freemium / 1er an partiellement gratuit
- Abonnement mensuel/annuel
- Programme "Réseau Partenaire CILIA"

---

## 🛤️ Parcours Utilisateur

```
Estimation → Mandat → Compromis → Vente → Post-vente
    ↓           ↓          ↓         ↓          ↓
 Création   Consolidation  Export   Remise    IA + Rappels
  CIL         documents     PDF      futur    Abonnement
                                                propriétaire
```

---

## 📝 User Stories MVP

### Mandataire
- [ ] Créer dossier CILIA dès estimation
- [ ] Reprendre documents sans ré-saisie
- [ ] Personnaliser CIL (logo, coordonnées)
- [ ] Dashboard ventes avec CIL générés

### Propriétaire
- [ ] Importer documents dès estimation
- [ ] Recevoir CIL accessible à la vente
- [ ] Rappel fin 1ère année
- [ ] Télécharger PDF CIL

### Locataire
- [ ] Voir documentation appareils
- [ ] Voir rappels entretien à ma charge
- [ ] Accéder trucs & astuces

### Notaire/Partenaire
- [ ] Accès CIL partiellement sécurisé
- [ ] Dashboard réseau (mandataires)

---

## 🗄️ Modèle de Données

```sql
DossierCIL
├── id_dossier
├── id_bien
├── id_proprietaire
├── id_mandataire
├── type_dossier (estimation|mandat|compromis|propriété)
├── date_creation
└── date_expiration_estimation

Bien
├── id_bien
├── adresse
├── type
├── surface
└── ...

Facture
├── id_facture
├── id_dossier
├── type (entretien|réparation|consommation|travaux_énergie)
├── categorie_ia
└── ...

Appareil
├── id_appareil
├── id_bien
├── reference
├── notice_pdf_url (unique)
├── responsable_entretien (propriétaire|locataire)
└── date_prochaine_entretien

TacheEntretien
├── id_tache
├── id_appareil
├── type (ramonage|purge|chauffe-eau|...)
├── responsable
└── date_prochaine
```

---

## 🎨 UX/UI Guidelines

### Principes
- Simple > Complexe
- Mobile-first
- Offline-first
- Privacy-first

### Design tokens
- Primary: `#1e40af`
- Secondary: `#64748b`
- Success: `#10b981`
- Warning: `#f59e0b`
- Danger: `#ef4444`

---

## 📊 Format de Réponse Scrum

À chaque interaction :

1. **Statut sprint** (1-3 phrases)
2. **Prochaine tâche** (objectif + valeur + livrable)
3. **User stories** (proposer/compléter)
4. **Code/modèle** (si pertinent)

---

## ⚠️ Rappels Importants

- **Connexion syndic = HORS MVP**
- Concentrer sur : moteur IA, drag & drop, dashboard DPE/équipements
- Modèle croissance = mandataires comme apporteurs
- Poser questions ciblées si élément non précisé
- Vision produit globale (UX + technique + business)

---

*Version: 2.2 | Dernière mise à jour: 11/04/2026*
