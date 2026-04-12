# EMAIL SYSTEM - CILIA

## Architecture

```
CILIA App
    ↓
User triggers (signup, alert, payment)
    ↓
API Call to email service
    ↓
Transactional email sent
```

## Email Service Options

| Service | Free Tier | Price |
|---------|-----------|-------|
| Resend | 100/mo | $20/3000 |
| SendGrid | 100/mo | $15/50000 |
| Brevo | 300/mo | €25/50000 |
| Postmark | 100/mo | $15/10000 |

**Recommandation:** Resend (API moderne, bon pricing)

## Email Templates

### 1. Welcome (inscription)
```
Subject: Bienvenue sur CILIA 🏠

Bonjour,

Merci de rejoindre CILIA !

Votre Carnet d'Information Logement est maintenant prêt.
Commencez par ajouter votre premier bien.

[Accéder à CILIA]

L'équipe CILIA
```

### 2. Alert Maintenance (Pro)
```
Subject: 🔔 Entretien à prévoir - {equipment_name}

Bonjour {name},

L'entretien de votre {equipment_name} à {address} 
est à prévoir dans {days} jours.

Date: {maintenance_date}

[Gérer dans CILIA]

CILIA - Votre CIL à jour
```

### 3. Alert Diagnostic Expiring
```
Subject: ⚠️ Diagnostic {type} expire bientôt

Bonjour,

Votre diagnostic {type} pour {address} 
expire dans {days} jours.

Date d'expiration: {expiry_date}

[Planifier un nouveau diagnostic]

CILIA
```

### 4. Payment Confirmation
```
Subject: ✅ Merci pour votre abonnement CILIA Pro

Bonjour,

Merci pour votre abonnement CILIA Pro !

Vous avez maintenant accès à :
- Biens illimités
- Documents illimités
- Export PDF
- Alertes email

[Accéder à CILIA Pro]

Facture: {invoice_url}

L'équipe CILIA
```

## Implementation

### Backend Required

Pour les emails, il faut un backend. Options:

1. **Serverless (Vercel/Netlify Functions)**
   - Facile à déployer
   - Free tier généreux

2. **API Route sur serveur existant**
   - Ajouter sur 84.247.161.15

3. **Webhook vers service externe**
   - Make.com / Zapier

### Endpoint Structure

```
POST /api/email/welcome
POST /api/email/alert
POST /api/email/payment
```

## Prochaine étape

1. Choisir service email (Resend recommandé)
2. Créer compte et obtenir API key
3. Déployer fonction serverless
4. Intégrer dans app.html

---
*Créé: 2026-04-12*
