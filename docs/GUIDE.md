# Guide Utilisateur CILIA

## Qu'est-ce que CILIA ?

CILIA est une application web progressive (PWA) pour gérer votre **Carnet d'Information Logement (CIL)**, obligatoire en France depuis 2023.

## Fonctionnalités

### 🏠 Gestion des biens
- Créer plusieurs biens (appartements, maisons)
- Associer un rôle (propriétaire, locataire, mandataire)
- Modifier les informations du bien

### 🔧 Équipements
- Ajouter des équipements (chaudière, VMC, PAC, etc.)
- Types personnalisés disponibles
- Date d'achat et calcul automatique de la garantie
- Responsable entretien (propriétaire/locataire)
- Alertes d'entretien automatiques

### 📄 Documents
- Upload par glisser-déposer
- Types: diagnostics, factures, notices, attestations
- Association à un équipement
- Téléchargement à tout moment

### 🔔 Alertes
- Entretien en retard ou à venir
- Garantie expirée ou expirant bientôt
- Diagnostics non valides
- Filtrage par responsabilité

## Comment utiliser

### 1. Créer un bien
1. Cliquez sur "Biens" dans la navigation
2. Cliquez sur "+ Ajouter"
3. Remplissez l'adresse et vos informations
4. Validez

### 2. Ajouter un équipement
1. Depuis l'accueil, cliquez sur "🔧 Ajouter un équipement"
2. Sélectionnez le type
3. Remplissez les informations (marque, date d'achat, garantie)
4. Définissez le responsable de l'entretien
5. Enregistrez

### 3. Ajouter un document
1. Cliquez sur "📤 Ajouter un document"
2. Glissez votre fichier ou cliquez pour sélectionner
3. Choisissez le type de document
4. Pour les diagnostics: sélectionnez le type (DPE, électricité, etc.)
5. Indiquez la date du document
6. Enregistrez

### 4. Exporter le CIL
1. Depuis l'accueil, cliquez sur "📄 Exporter le CIL"
2. Un fichier texte est téléchargé avec toutes vos informations

## Validité des diagnostics

| Diagnostic | Vente | Location |
|------------|-------|----------|
| DPE | 10 ans | 10 ans |
| Électricité | 3 ans | 6 ans |
| Gaz | 3 ans | 6 ans |
| Plomb (CREP) | 1 an | 6 ans |
| Amiante | Illimité (si négatif) | Illimité |
| Termites | 6 ans | 6 ans |

## Stockage des données

Vos données sont stockées **localement** dans votre navigateur (localStorage). Aucune donnée n'est envoyée sur un serveur.

⚠️ **Important**: Vider le cache du navigateur supprimera vos données. Pensez à exporter régulièrement votre CIL.

## Dépannage

### L'application ne charge pas
- Rafraîchissez la page (F5)
- Videz le cache du navigateur
- Vérifiez que JavaScript est activé

### Fichier trop volumineux
- Les fichiers sont stockés en base64
- Limitez la taille des documents (max 5-10 Mo par fichier)
- Exportez et supprimez les anciens documents

### Données perdues
- Les données sont dans le localStorage
- Si vous videz le cache, tout est perdu
- Sauvegardez régulièrement via l'export

---

*CILIA - Carnet d'Information Logement*
*Version MVP - 2026*
