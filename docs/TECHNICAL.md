# Documentation Technique CILIA

## Architecture

```
CILIA PWA
├── docs/
│   ├── index.html      # Application complète
│   ├── manifest.json   # Manifest PWA
│   ├── sw.js          # Service Worker
│   └── GUIDE.md       # Guide utilisateur
├── src/               # (non utilisé en production)
└── README.md
```

## Stack technique

- **HTML5** + **Tailwind CSS** (CDN)
- **JavaScript vanilla** (pas de framework)
- **localStorage** pour le stockage
- **PWA** : manifest.json + service worker

## Modèle de données

### State

```javascript
{
  currentPropertyId: string | null,
  properties: Property[],
  equipment: { [propertyId]: Equipment[] },
  documents: { [propertyId]: Document[] }
}
```

### Property

```javascript
{
  id: string,
  address: string,
  type: 'Appartement' | 'Maison' | ...,
  surface: number | null,
  rooms: number | null,
  role: 'proprietaire' | 'locataire' | 'mandataire',
  createdAt: ISO8601,
  updatedAt?: ISO8601
}
```

### Equipment

```javascript
{
  id: string,
  type: string,
  name: string,
  brand?: string,
  model?: string,
  purchaseDate?: ISO8601,
  warrantyMonths: number,
  warrantyEnd?: ISO8601,  // calculé: purchaseDate + warrantyMonths
  responsable: 'proprietaire' | 'locataire',
  nextMaintenance?: ISO8601,
  periodMonths: number,
  notes?: string,
  icon: string,
  createdAt: ISO8601,
  updatedAt?: ISO8601
}
```

### Document

```javascript
{
  id: string,
  type: 'diagnostic' | 'facture' | 'notice' | 'attestation' | 'travaux' | 'autre',
  diagType?: 'dpe' | 'electricite' | 'gaz' | 'plomb' | 'amiante' | ...,
  equipmentId?: string,  // association à un équipement
  date?: ISO8601,
  amount?: number,
  notes?: string,
  filename: string,
  filedata: string,     // base64
  createdAt: ISO8601,
  updatedAt?: ISO8601
}
```

## Fonctionnalités clés

### Calcul automatique garantie

```javascript
warrantyEnd = purchaseDate + warrantyMonths mois
```

### Alertes

- **Entretien**: `daysUntil(nextMaintenance) <= 30`
- **Garantie**: `daysUntil(warrantyEnd) <= 30`
- **Diagnostic**: `daysUntil(expiry) <= 90`

### Validité diagnostics

```javascript
const DIAG_VALIDITY = {
  dpe: 10, electricite: 3, gaz: 3, plomb: 1, ...
};
const DIAG_VALIDITY_RENT = {
  dpe: 10, electricite: 6, gaz: 6, plomb: 6, ...
};
```

## Stockage

- Clé: `cilia-v2`
- Migration automatique depuis `cil-state` (v1)
- Limite: ~5 Mo (localStorage)

## Déploiement

```bash
# Build: pas de build, les fichiers sont servis directement
git add docs/ && git commit -m "message" && git push

# GitHub Pages: https://cecile-s.github.io/cil-vault/
```

## Problèmes connus

1. **API IA bloquée**: L'API (http://84.247.161.15:8001) est en HTTP, GitHub Pages est en HTTPS → Mixed Content bloqué
   - Solution: Configurer HTTPS sur le serveur API ou utiliser un proxy

2. **Stockage limité**: localStorage ~5 Mo
   - Solution: Exporter régulièrement, limiter la taille des fichiers

3. **Pas de sync**: Données uniquement locales
   - Solution future: Backend avec auth

## Tests

Tests headless via OpenClaw browser tool:
```javascript
// Naviguer
browser({action: 'open', url: 'https://...'})

// Capturer
browser({action: 'snapshot'})

// Interagir
browser({action: 'act', request: {kind: 'click', ref: 'e1'}})
```

## Roadmap technique

- [ ] Service Worker offline complet
- [ ] Push notifications
- [ ] Backend avec auth
- [ ] API IA en HTTPS
- [ ] OCR automatique
- [ ] Multi-utilisateur

---
*Documentation technique CILIA - 2026-04-12*
