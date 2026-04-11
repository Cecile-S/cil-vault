# USER STORIES MVP v2 — CILIA

## 📋 Référence CIL Officielle

### Documents obligatoires dans le CIL
1. **Dates et descriptions des travaux** réalisés
2. **Matériaux isolants** (marque, réf., R thermique, épaisseur, surface)
3. **Notices équipements** (chauffage, ECS, ventilation, ENR)
   - Marque, modèle, énergie, n° série, puissance
   - Étiquetage énergétique
4. **DPE** (Diagnostic Performance Énergétique)
5. **Attestations labels** (HQE, BBC, etc.)
6. **Audit énergétique** (si réalisé)
7. **Attestations entretien** (chaudière, etc.)

⚠️ **Note importante:** Le DPE est généralement regroupé avec les autres diagnostics (électricité, gaz, plomb, amiante, etc.) dans un **PDF unique** "Diagnostic Immobilier".

---

## 🎯 Sprint: Évolutions Équipements & Documents

### US-1: Types d'équipements personnalisés
**En tant que** propriétaire / locataire / mandataire  
**Je veux** pouvoir ajouter des types d'équipements  
**Afin de** couvrir tous les équipements spécifiques à mon logement  

**Critères d'acceptation:**
- [ ] Liste prédéfinie : chaudière, VMC, PAC, chauffe-eau, poêle, climatisation, adoucisseur, piscine, etc.
- [ ] Possibilité d'ajouter un type personnalisé
- [ ] Icône associée au type
- [ ] Périodicité d'entretien par défaut (modifiable)

---

### US-2: Facture d'achat équipement
**En tant que** propriétaire / locataire  
**Je veux** pouvoir ajouter la facture d'achat d'un équipement  
**Afin de** conserver la preuve d'achat et les infos garantie  

**Critères d'acceptation:**
- [ ] Upload facture dans l'équipement
- [ ] Extraction automatique: date achat, montant, fournisseur, n° facture
- [ ] Association automatique à l'équipement

---

### US-3: Calcul automatique fin de garantie
**En tant que** propriétaire / locataire  
**Je veux** qu'une date de fin de garantie me soit proposée  
**Afin de** savoir jusqu'à quand je suis couvert  

**Critères d'acceptation:**
- [ ] Extraction durée garantie depuis facture (ex: "garantie 2 ans")
- [ ] Calcul automatique: date achat + durée garantie
- [ ] Proposition de validation (modifiable)
- [ ] Alerte 30 jours avant expiration

---

### US-4: Documentation du bien
**En tant que** propriétaire / locataire / mandataire  
**Je veux** ajouter la documentation du bien  
**Afin de** centraliser notices et modes d'emploi  

**Critères d'acceptation:**
- [ ] Upload PDF/images pour chaque équipement
- [ ] Recherche automatique de la notice via référence (API fabricant?)
- [ ] Base de notices unique (pas de doublons)
- [ ] Fallback: lien fabricant + copie locale

---

### US-5: Alertes diagnostics expirés
**En tant que** propriétaire / mandataire  
**Je veux** être prévenu quand un diagnostic n'est plus valable  
**Afin de** le mettre à jour avant vente/location  

**Critères d'acceptation:**
- [ ] Parsing automatique des dates de validité depuis le PDF diagnostic
- [ ] DPE : 10 ans
- [ ] Électricité : 3 ans (vente) / 6 ans (location)
- [ ] Gaz : 3 ans (vente) / 6 ans (location)
- [ ] Plomb : 1 an (vente) / 6 ans (location)
- [ ] Amiante : illimité si négatif
- [ ] Alerte 3 mois avant expiration

---

### US-6: Diagnostic unique (PDF groupé)
**En tant que** utilisateur  
**Je veux** uploader le PDF diagnostic complet  
**Afin de** ne pas séparer les diagnostics manuellement  

**Critères d'acceptation:**
- [ ] Upload unique pour DPE + électricité + gaz + plomb + amiante
- [ ] Extraction automatique de chaque diagnostic
- [ ] Parsing dates validité par diagnostic
- [ ] Association automatique au bien

---

### US-7: Facture associée à équipement
**En tant que** propriétaire / locataire  
**Je veux** qu'une facture soit associée à un équipement  
**Afin de** retrouver facilement la preuve liée  

**Critères d'acceptation:**
- [ ] Obligation d'associer une facture à un équipement existant
- [ ] Ou création équipement depuis la facture
- [ ] Lien bidirectionnel: équipement ↔ factures

---

### US-8: Téléchargement documents
**En tant que** propriétaire / locataire / mandataire  
**Je veux** pouvoir télécharger les documents  
**Afin de** les transmettre ou les archiver  

**Critères d'acceptation:**
- [ ] Bouton téléchargement sur chaque document
- [ ] Téléchargement multiple (sélection)
- [ ] Export ZIP du CIL complet
- [ ] Nom de fichier lisible: `[type]_[date]_[bien].pdf`

---

### US-9: Analyse IA automatique
**En tant que** utilisateur  
**Je veux** que chaque document soit analysé à l'upload  
**Afin de** éviter la saisie manuelle  

**Critères d'acceptation:**
- [ ] Analyse automatique dès le téléchargement
- [ ] Extraction: dates, montants, garanties, validités, références
- [ ] Proposition de classification (type, catégorie)
- [ ] Extraction points clés (résumé)
- [ ] Suggestions trucs & astuces liés

---

### US-10: Alertes par responsabilité
**En tant que** propriétaire / locataire  
**Je veux** voir uniquement les alertes dont je suis responsable  
**Afin de** ne pas être pollué par les alertes de l'autre partie  

**Critères d'acceptation:**
- [ ] Filtre par rôle (propriétaire vs locataire)
- [ ] Chaque équipement a un responsable défini
- [ ] Vue filtrée par défaut selon mon rôle
- [ ] Possibilité de voir toutes les alertes (option)

---

### US-11: Alerte retard entretien locataire
**En tant que** propriétaire  
**Je veux** être alerté si mon locataire n'a pas entretenu ses équipements  
**Afin de** intervenir si nécessaire  

**Critères d'acceptation:**
- [ ] Équipements sous responsabilité locataire identifiés
- [ ] Alerte propriétaire si entretien en retard > 30 jours
- [ ] Notification: email ou push
- [ ] Suivi des relances

---

### US-12: Vérification adresse
**En tant que** chef de projet  
**Je veux** que l'adresse soit vérifiée  
**Afin de** proposer des artisans à proximité  

**Critères d'acceptation:**
- [ ] API Adresse (geo.api.gouv.fr) pour standardiser
- [ ] Validation format + coordonnées GPS
- [ ] Stockage: adresse normalisée + lat/lng
- [ ] Préparation pour futur: géolocalisation artisans

---

### US-13: Association bien obligatoire
**En tant que** utilisateur  
**Je veux** que tout soit associé à un bien  
**Afin de** structurer correctement le CIL  

**Critères d'acceptation:**
- [ ] Création d'un bien obligatoire avant tout ajout
- [ ] Tous les équipements sont liés à un bien
- [ ] Tous les documents sont liés à un bien
- [ ] Vue par bien (dashboard)
- [ ] Multi-biens possible (1 utilisateur = plusieurs biens)

---

## 🗄️ Modèle de Données Mis à Jour

```sql
Bien
├── id_bien
├── adresse (normalisée)
├── adresse_lat
├── adresse_lng
├── type (appartement|maison|...)
├── surface
├── nb_pieces
├── id_proprietaire
├── id_mandataire (optionnel)
└── created_at

Equipement
├── id_equipement
├── id_bien (FK)
├── type (prédéfini ou personnalisé)
├── type_personnalise (si type='autre')
├── nom
├── marque
├── modele
├── reference
├── numero_serie
├── responsable_entretien (proprietaire|locataire)
├── date_achat
├── date_fin_garantie
├── periodicite_entretien_mois
├── dernier_entretien
├── prochain_entretien
├── created_at
└── updated_at

Document
├── id_document
├── id_bien (FK)
├── id_equipement (FK, optionnel)
├── type (facture|diagnostic|notice|attestation|travaux|autre)
├── sous_type (DPE|electricite|gaz|plomb|amiante|...)
├── nom_fichier
├── chemin_stockage
├── date_document
├── date_validite_debut
├── date_validite_fin
├── montant_ttc
├── numero_facture
├── fournisseur
├── ia_classification
├── ia_points_cles (JSON)
├── ia_astuces (JSON)
├── created_at
└── updated_at

Alerte
├── id_alerte
├── id_bien (FK)
├── id_equipement (FK, optionnel)
├── id_document (FK, optionnel)
├── type (entretien|garantie|diagnostic|...)
├── message
├── destinataire (proprietaire|locataire|mandataire)
├── date_echeance
├── severite (info|warning|urgent)
├── status (active|acquittée|expirée)
├── created_at
└── acquittée_at
```

---

## 🎯 Priorisation Sprint

### P0 (MVP+)
1. US-13: Association bien obligatoire
2. US-9: Analyse IA automatique
3. US-1: Types d'équipements personnalisés
4. US-7: Facture associée à équipement
5. US-6: Diagnostic unique (PDF groupé)

### P1 (Sprint suivant)
6. US-3: Calcul fin de garantie
7. US-5: Alertes diagnostics expirés
8. US-10: Alertes par responsabilité
9. US-8: Téléchargement documents

### P2 (Itérations futures)
10. US-2: Facture d'achat
11. US-4: Documentation du bien
12. US-11: Alerte retard locataire
13. US-12: Vérification adresse

---

*User Stories v2 — 11/04/2026*
