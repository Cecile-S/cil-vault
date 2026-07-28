# GESTIONNAIRES LOCATIFS ET API

Date: 2026-04-12

## Question 1: Gestionnaires locatifs comme prescripteurs

### Analyse du marche

Qui sont les gestionnaires locatifs ? Administrateurs de biens, syndics de copropriete, agents immobiliers avec gestion locative, plateformes (Locservice, SeLoger, etc.)

### Leurs outils actuels

| Outil | Fonctionnalite CIL ? |
|-------|---------------------|
| LogiExcel | Pas de CIL |
| Hoomy | Pas de CIL |
| PAP | Pas de CIL |
| MeilleurAgent | Pas de CIL |
| SeLoger | DPE uniquement |
| Locservice | Pas de CIL |

Conclusion: le CIL n'est PAS une fonctionnalite standard de leurs outils. C'est une opportunite.

### Modele prescripteur

Proposition: gestionnaire = prescripteur (comme mandataire), offre Pro gratuit an 1 pour ses clients, marque blanche possible, integration API pour leurs outils.

---

## Question 2: API pour applications pro

### Pourquoi une API ?

Probleme: multiplication d'outils, double saisie pour les gestionnaires, donnees dispersees.
Solution: API REST CILIA, integration dans leurs outils existants, sync automatique.

### Endpoints proposes

```
GET    /api/v1/properties
POST   /api/v1/properties
GET    /api/v1/properties/:id
PUT    /api/v1/properties/:id
GET    /api/v1/properties/:id/documents
POST   /api/v1/properties/:id/documents
GET    /api/v1/documents/:id
GET    /api/v1/properties/:id/equipment
POST   /api/v1/properties/:id/equipment
GET    /api/v1/properties/:id/alerts
GET    /api/v1/properties/:id/cil
```

### Authentification
- API Key (header X-CILIA-API-Key)
- OAuth2 pour SSO (optionnel)

### Pricing API

| Plan | Appels/mois | Prix |
|------|-------------|------|
| Starter | 1 000 | Inclus Agency |
| Pro | 10 000 | +29 euros/mois |
| Enterprise | Illimite | Sur devis |

### Integrations prevues

Phase 1: webhooks (notifications), export PDF via API, sync automatique
Phase 2: plugins WordPress/Wix, integration LogiExcel, integration CRM immobiliers

---

## Plan d'action
1. Corriger bugs iOS (fait)
2. Consulter expert-comptable (deductibilite) - voir DEDUCTIBILITE-FISCALE.md
3. Specifier API v1
4. Contacter gestionnaires locatifs
5. Developper integration API

STATUT (verifie 28/07/2026) : aucune API n'existe dans le code actuel.
Idee strategique moyen terme, pas prioritaire vs le coeur produit CIL.

---
*Note suite aux questions de Cecile - 2026-04-12*
