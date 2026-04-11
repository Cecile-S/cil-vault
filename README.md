# CIL Vault PWA — Carnet d'Information Logement

PWA française pour le CIL obligatoire (loi 2023).

## Stack
- React 18 + Vite
- PWA (manifest + service worker)
- TailwindCSS
- Offline-first

## Démarrage

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Structure

```
src/
├── components/
│   ├── Dashboard.jsx      # Score énergétique
│   ├── EquipmentList.jsx  # Chaudière, VMC, PAC
│   ├── DocumentUpload.jsx # Upload factures/DPE
│   └── Alerts.jsx         # Rappels entretien
├── pages/
│   ├── Home.jsx
│   ├── Equipment.jsx
│   ├── Documents.jsx
│   └── Alerts.jsx
├── hooks/
│   └── useLocalStorage.js # Offline storage
├── services/
│   └── api.js             # Backend 84.247.161.15:8001
├── App.jsx
└── main.jsx

public/
├── manifest.json          # PWA installable
├── sw.js                  # Service Worker offline
└── icons/                 # iOS/Android icons
```

## API Backend

- URL: `http://84.247.161.15:8001`
- Classification: `POST /ai/classify`
- Health: `GET /`

## Fonctionnalités

✅ PWA installable (iOS/Android)
✅ Offline documents
✅ Classification IA automatique
✅ Alertes entretien (chaudière annuelle, VMC 3 ans)
🚧 Export PDF CIL
🚧 Aides MaPrimeRénov' / CEE
