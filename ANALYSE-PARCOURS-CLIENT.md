# Parcours Client: Vente et Location - Analyse

## Notre positionnement confirme

**HORS CIBLE:**
- Suivi conso energie (pas notre cible)
- Gestion locative (peut-etre plus tard: quittances, appels loyer)
- Version papier (pas notre cible)
- App native (nous sommes PWA)

**NOTRE CIBLE:**
- Proprietaires vendeurs/proprietaires
- Mandataires immobiliers
- Focus transaction (vente/location)

NOTE IMPORTANTE (verifie le 28/07/2026) : plusieurs items de ce document
marques comme deja implementes (acces notaire, transfert acquereur TRF-XXXXX,
espace locataire par code, partage mandataire) N'EXISTENT PAS dans le code
actuel (verifie par recherche exhaustive dans le depot GitHub). Ce sont donc
de vraies fonctionnalites a construire, pas des reliquats a retrouver.

---

## Parcours VENTE IMMOBILIERE

### Phase 1: Estimation (Avant mise en vente)

Acteur: Proprietaire / Mandataire

| Besoin | Fonctionnalite CILIA | Priorite |
|--------|---------------------|----------|
| Identifier les documents manquants | Checklist CIL vente | HAUTE |
| Preparer les diagnostics obligatoires | Liste DPE, elec, gaz | HAUTE |
| Valoriser les travaux effectues | Historique travaux | MOYENNE |
| Calculer les aides MaPrimeRenov' | Simulateur aides | MOYENNE |

Fonctionnalites a developper:
1. Checklist vente - "Documents obligatoires pour vendre" (DPE valide, diagnostic elec, gaz, ERP, Carrez), indicateur "Pret a vendre"
2. Score CIL - Note de completude du carnet (0-100%)
3. Section "Valorisation" - Travaux effectues, impact sur classe DPE estimee

### Phase 2: Mise en vente

Acteur: Mandataire / Proprietaire

| Besoin | Fonctionnalite CILIA | Priorite |
|--------|---------------------|----------|
| Partager le CIL a l'agence | Code partage mandataire | HAUTE |
| Generer un dossier de vente | Export PDF CIL complet | HAUTE |
| Donner acces aux acquereurs | Lien visiteur | MOYENNE |
| Montrer l'historique | Timeline du logement | MOYENNE |

Fonctionnalites a developper:
1. Acces mandataire - code d'acces temporaire (30 jours), voir sans modifier, badge "Mandataire"
2. Export PDF de vente - format professionnel, page de garde avec photo, tous les diagnostics, historique equipements
3. Lien visiteur - code unique par visiteur, valable 48h, infos essentielles

### Phase 3: Compromis

Acteur: Notaire / Proprietaire / Acquereur

| Besoin | Fonctionnalite CILIA | Priorite |
|--------|---------------------|----------|
| Verifier le CIL | Acces notaire (7 jours) | HAUTE |
| Transferer le CIL | Code transfert acquereur | HAUTE |
| Archiver les diagnostics | Stockage documents | HAUTE |
| Tracer le transfert | Historique | HAUTE |

Fonctionnalites a developper (A CONSTRUIRE, non implementees) :
1. Acces notaire - lien lecture seule (7 jours), verification complete
2. Transfert definitif - code TRF-XXXXX, historique conserve

### Phase 4: Acte de vente

Acteur: Notaire / Acquereur

| Besoin | Fonctionnalite CILIA | Priorite |
|--------|---------------------|----------|
| Recevoir le CIL | Transfert automatique | HAUTE |
| Devenir proprietaire | Changement de role | HAUTE |
| Archiver la vente | Date dans historique | MOYENNE |

---

## Parcours LOCATION

### Phase 1: Preparation du bien

Acteur: Proprietaire / Mandataire

| Besoin | Fonctionnalite CILIA | Priorite |
|--------|---------------------|----------|
| Documents obligatoires location | Checklist location | HAUTE |
| DPE valide (obligatoire) | Rappel expiration | HAUTE |
| Partager au futur locataire | Code partage | HAUTE |

Fonctionnalites a developper:
1. Checklist location - DPE (obligatoire depuis 2007), diagnostic electricite (si > 15 ans), diagnostic gaz (si > 15 ans), ERP, mesurage loi Boutin
2. Indicateur "Pret a louer" - documents OK, equipements identifies, responsabilites definies

### Phase 2: Signature du bail

Acteur: Proprietaire / Locataire

| Besoin | Fonctionnalite CILIA | Priorite |
|--------|---------------------|----------|
| Donner acces au CIL | Code locataire | HAUTE |
| Definir les responsabilites | Equipements par role | HAUTE |
| Partager les diagnostics | Filtrage auto | HAUTE |

Fonctionnalites a developper (A CONSTRUIRE, non implementees) :
1. Espace locataire - acces via code, documents filtres, equipements dont il est responsable
2. Repartition des responsabilites - qui entretient quoi, qui paie quoi, document de reference

### Phase 3: Pendant la location

Acteur: Proprietaire / Locataire

| Besoin | Fonctionnalite CILIA | Priorite |
|--------|---------------------|----------|
| Rappels entretien | Alertes automatiques | HAUTE |
| Communication p/r | A developper | MOYENNE |
| Tracer les interventions | Historique | MOYENNE |

Fonctionnalites a developper (plus tard, pas prioritaire):
1. Espace d'echange securise - messagerie proprietaire-locataire, quittances, appels de loyer, etat des lieux
2. Alertes partagees - proprietaire voit les alertes locataire, notif avant intervention

---

## Fonctionnalites a implementer (priorisees, mises a jour 28/07/2026)

### P0 - Critique
1. Checklist vente/location
2. Score CIL (completude)
3. Acces mandataire (code temporaire)

### P1 - Haute priorite
1. Export PDF professionnel
2. Lien visiteur (48h)
3. Acces notaire (code temporaire lecture seule)
4. Transfert acquereur (code TRF-XXXXX)
5. Espace locataire par code (partage externe, distinct du simple filtre de role actuel)

### P2 - Moyenne priorite
1. Historique timeline
2. Section "Valorisation travaux"
3. Simulateur aides MaPrimeRenov'

### P3 - Plus tard (retours utilisateurs)
1. Espace d'echange proprietaire-locataire
2. Generation quittances
3. Integration gestionnaires locatifs

---

## Differenciation concurrentielle

| Fonctionnalite | CILIA | MSL | HOME ID | MCL |
|---------------|-------|-----|---------|-----|
| Partage locataire | a construire | oui | non | oui |
| Transfert acquereur | a construire | non | non | non |
| Acces notaire | a construire | non | non | non |
| Checklist vente | a construire | non | non | non |
| Score CIL | a construire | non | non | non |
| Focus transaction | oui | non | non | oui |

Notre avantage vise : etre les seuls a couvrir le parcours complet de transaction (vente + location) avec transfert securise.

---

*Analyse originale: 2026-04-13. Verifiee et mise a jour le 28/07/2026 (Claude + Cecile).*
