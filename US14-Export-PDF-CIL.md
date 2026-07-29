# US-14 Export PDF CIL

## Objectif
Implémenter la fonctionnalité essentielle d'export PDF pour le CIL (Carnet d'Information Logement) - le cœur du business de la PWA française.

## Description
Permettre aux utilisateurs de générer des documents CIL officiels au format PDF contenant toutes les données immobilières obligatoires pour la conformité légale en France (loi 2023).

## Valeur métier
- **Compliance legale**: Permet la conformité avec la loi française 2023 sur le CIL
- **Génération de revenus**: Service premium essentiel pour les agents immobiliers
- **Valeur principale**: Transforme les données en documents officiels utilisables
- **Différenciation**: Outil de génération de documents CIL unique en France

## Scénarios

### 1. Export de bien unique
**Utilisateur**: Propriétaire avec biens multiples
**Action**: Sélectionne un bien → Clique sur "Exporter CIL" → PDF généré avec toutes les données du bien
**Résultat**: PDF sécurisé, signé numériquement, avec tampon officiel

### 2. Export de tous les biens (commandité par le syndic)
**Utilisateur**: Agent immobilier/gestionnaire de syndic
**Action**: Génère toutes les données du client → Export PDF en masse pour tous les biens sous gestion
**Résultat**: Dossier de compliance complet avec couverture multi-biens

### 3. Export pour transaction d'achat-vente
**Utilisateur**: Agent immobilier
**Action**: Prépare une transaction spécifique → Export PDF du bien ciblé pour transaction
**Résultat**: Documentation de transaction conforme

## Critères d'acceptation

### Technique
- [ ] Export PDF généré avec succès pour chaque bien immobilier
- [ ] Tous les champs CIL obligatoires inclus : adresse, type, surface, équipements, diagnostics, alertes
- [ ] Format PDF respecte les normes d'impression françaises (ISO 32000-1)
- [ ] Données correctement formatées pour validation légale
- [ ] La résponsabilité d'impression est assignable
- [ ] Les codes barres/Données structurées intégrés optionnellement
- [ ] Disponible hors ligne pour situation sans connectivité
- [ ] Version PDF A-2 (PDF/A-2) pour validité légale à long terme
- [ ] Configuration juridiquement valable et partage sécurisé des signatures
- [ ] Option d'inscription partielle pour brouillons non officiels
- [ ] Version PDF générée en 24h pour des raisons de rapidité

### Usabilité
- [ ] Bouton "Exporter CIL" proéminent sur la page de détails du bien
- [ ] La légende du bouton inclut le format "PDF - [Taille du fichier]"
- [ ] Interface claire affichant la taille et les contenus du fichier
- [ ] La taille du fichier limite la taille du PDF < aux normes légales
- [ ] Notification claire affichant le succès/échec de l'export
- [ ] Option d'assistant guidé pour les documents non techniques
- [ ] Barres d'état simplifiées indiquant la progression
- [ ] Avertissements basés sur les regles françaises standards réglementaires

### Règles métier (CIL)
- [ ] Toutes les données des diagnostics incluses (DPE, amiante, plomb, gaz, électricité, état des risques)
- [ ] Les calendriers d'entretien des équipements ajoutés (chaudière, VMC, PAC)
- [ ] Tous les documents uploadés (fixations d'assurance, factures) inclus
- [ ] Les alertes de maintenance et échéances ajoutées
- [ ] La classification IA cohérente avec les règlements français normalisés
- [ ] Taille de fichier PDF < à 10 MB (norme French land loi 2023)
- [ ] Champ de données autorisé pour réflexion des signatures d'installateurs
- [ ] Exporter vers preuve légale validée par DGFIP

## Spécifications d'implémentation

### Composants principaux
1. **Endpoint d'export API**
   - URL : `/api/export/cil/{id_bien}` (GET/POST)
   - Résultat : PDF binaire ou URL de téléchargement
   - Authentification : token/JWT existant

2. **Vue d'export PDF**
   - Composant React : `PropertyCILExport.jsx`
   - Intégré avec les composants existants Property.jsx
   - Style conforme aux components/buttons/components existants

3. **Service de génération PDF**
   - Utilise jsPDF + styles CSS existants
   - Intègre images, logos, données réglementaires françaises
   - Crée PDF A-2 qualifié pour validité légale

4. **Service d'assistance**
   - Téléchargement de preuves d'export PDF sur backend
   - Suivi des traces d'audit pour réclamations juridiques
   - Support de téléchargement par API pour signatures multiples

### Workflow
```
1. Utilisateur clique sur "Exporter CIL" sur la fiche propriété
2. Front-end valide et récupère toutes les données du bien (équipements, documents, alertes)
3. Front-end appelle /api/export/cil/{id_bien}
4. API récupère toutes les données de propriété, équipements, documents, alertes
5. API appelle le service PDF avec les données et templates
6. Service PDF génère le document PDF A-2 final
7. API sauvegarde la preuve d'export et l'envoie à l'utilisateur
8. PDF téléchargé avec nom de fichier pour validation légale
```

### UI/UX
- **Localisation** : Texte en français uniquement
- **Formattage** : Conforme aux standards d'impression français
- **Style** : Les components utilisent un style cohérent et spécifique au projet
- **Responsive** : Fonctionne sur desktop + mobile

### Tests de conformité légale
- [ ] Utilisation des styles français standard /Facture
- [ ] Numérotation du document conforme aux normes CERTA
- [ ] Métadonnées correctes et lignes de validité légale
- [ ] Dissociation précise des faits / du texte juridiquement valide
- [ ] Conformité avec l'article R111-22-13 et R111-22-14

## Équipe et ressources
- **Frontend**: Développeur React/Next.js
- **Backend**: Développeur Node/Express
- **Validation**: Recette fonctionnelle avec spécialiste juridique
- **Documentation** : Testeur manuel avec playbooks de compliancce

## Ordre de livraison
- Phase 1 (2 jours) : API + réponse de base, Wireframes d'interface utilisateur
- Phase 2 (2 jours) : Vue d'interface utilisateur + composant d'export
- Phase 3 (1 jour) : Service de génération PDF + conformité légale
- Phase 4 (1 jour) : Validation des tests de conformité + recette finale