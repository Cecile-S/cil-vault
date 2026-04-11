# ROADMAP — CIL Vault

## ✅ JOUR 1 (11/04/2026) — FONDATIONS

### Infrastructure
- [x] Bot Telegram @CilliaVaultBot
- [x] Chat ID Cécile : 6629958501
- [x] API Backend : http://84.247.161.15:8001 ✓
- [x] Classification IA fonctionnelle

### PWA
- [x] Structure projet (React + Vite)
- [x] Version statique HTML fonctionnelle
- [x] Manifest PWA installable
- [x] Service Worker (offline)
- [x] 4 pages : Accueil, Équipements, Documents, Alertes

### Git & Déploiement
- [x] Repo GitHub : https://github.com/Cecile-S/cil-vault
- [x] GitHub Pages activé
- [x] URL live : https://cecile-s.github.io/cil-vault/

### Fonctionnalités
- [x] localStorage (persistant offline)
- [x] Classification IA (bouton)
- [x] Export CIL (fichier texte)
- [x] Settings (adresse, surface)
- [x] Alertes maintenance (30 jours)

---

## 🔜 SEMAINE 1 — CARNET COMPLET

### Priorité 1 : Documents
- [ ] Upload fichiers (drag & drop)
- [ ] Stockage IndexedDB (plus robuste)
- [ ] Aperçu PDF/image
- [ ] OCR PDF (Tesseract.js)
- [ ] Parsing DPE automatique
- [ ] Parsing factures automatique

### Priorité 2 : Équipements
- [ ] Types prédéfinis avec maintenance auto
  - Chaudière : annuel
  - VMC : 3 ans
  - PAC : annuel
  - Chauffe-eau : 2 ans
- [ ] Photos équipements
- [ ] Historique entretien
- [ ] Contrat d'entretien (PDF)

### Priorité 3 : UI/UX
- [ ] Design polish (vrai UX)
- [ ] Animations fluides
- [ ] Dark mode
- [ ] Onboarding nouveau utilisateur
- [ ] Guide intéractif

---

## 🎯 SEMAINE 2 — IA AVANCÉE

### Classification
- [ ] Classification auto à l'upload
- [ ] Suggestions type document
- [ ] Extraction entités (montant, date, fournisseur)
- [ ] Détection doublons

### DPE
- [ ] OCR DPE complet
- [ ] Extraction classe énergétique
- [ ] Recommandations amélioration
- [ ] Calcul économies potentielles

### Aides
- [ ] API MaPrimeRénov' (si dispo)
- [ ] API CEE (si dispo)
- [ ] Calcul éligibilité
- [ ] Simulation aides

---

## 🚀 MOIS 1 — PRODUCTION

### Technique
- [ ] Backend persistant (DB)
- [ ] Authentification (compte utilisateur)
- [ ] Sync cloud (optionnel)
- [ ] API REST complète

### Légal
- [ ] CGU conformes
- [ ] Mentions légales
- [ ] RGPD (droit oubli, export)
- [ ] Hébergement France

### Marketing
- [ ] Landing page
- [ ] SEO
- [ ] Blog articles CIL
- [ ] Témoignages beta

---

## 💼 MOIS 2+ — BUSINESS

### Monétisation (optionnel)
- [ ] Version gratuite (1 logement)
- [ ] Version payante (multi-logements)
- [ ] Fonctionnalités premium
- [ ] API pour notaires/agences

### Partenariats
- [ ] Intégration notaires
- [ ] Intégration agences
- [ ] Intégration diagnostiqueurs
- [ ] Webhook pour tiers

---

## 🔧 BACKLOG IDEES

### Fonctionnalités futures
- [ ] Multi-logements
- [ ] Partage famille/notaire
- [ ] Signature électronique
- [ ] Intégration calendrier (rappels)
- [ ] Notifications push
- [ ] Export PDF officiel
- [ ] Import données existantes
- [ ] API publique
- [ ] Webhook n8n
- [ ] Intégration comptabilité

### Intégrations potentielles
- [ ] Notion (existant Cécile)
- [ ] n8n (existant)
- [ ] Google Drive / iCloud
- [ ] EDF ENR (API consommation)
- [ ] Diagnostiqueurs DPE
- [ ] Notaires (transfert vente)

### Améliorations techniques
- [ ] Tests unitaires
- [ ] CI/CD GitHub Actions
- [ ] Monitoring erreur (Sentry)
- [ ] Analytics privacy-first
- [ ] Performance optimisation
- [ ] PWA badges iOS

---

## 📊 KPIs

| Métrique | Cible | Actuel |
|----------|-------|--------|
| PWA installs | 80% visiteurs | 0 |
| Documents classés | 95% accuracy | - |
| Alertes ouvertes | 70% | - |
| Score DPE suivi | 100% utilisateurs | 0 |
| MaPrimeRénov' détectée | 50% logements | 0 |

---

## 🎨 DESIGN SYSTEM

### Couleurs
- Primary : `#1e40af` (bleu)
- Secondary : `#64748b` (slate)
- Success : `#10b981` (green)
- Warning : `#f59e0b` (orange)
- Danger : `#ef4444` (red)

### Typographie
- Font : Inter, system-ui
- Titres : bold, tracking tight
- Corps : normal, lisible

### Espacements
- Card : `p-4 rounded-xl shadow`
- Gap : `gap-3` (0.75rem)
- Section : `mb-6`

---

## 📝 NOTES

### Principes
- Privacy-first : données locales d'abord
- France-first : aides françaises uniquement
- Mobile-first : penser smartphone
- Offline-first : fonctionne sans réseau

### Priorités
1. Fonctionnel > Beau
2. Simple > Complexe
3. Local > Cloud
4. Gratuit > Payant

---

*Dernière mise à jour : 11/04/2026*
