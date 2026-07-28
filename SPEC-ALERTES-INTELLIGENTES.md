# Alertes Intelligentes - Specification

## Contexte

Les alertes doivent etre contextuelles et non anxiogenes. Elles s'adaptent selon:
- Le projet du proprietaire (vente, location, occupation)
- Le statut du bien (occupe, Airbnb, vacant)
- L'urgence reelle

STATUT (verifie 28/07/2026): specification complete, RIEN n'est implemente
dans le code actuel. Aucun concept de "profil d'usage du bien" n'existe
aujourd'hui (occupant/locataire/airbnb/vacant/vente). C'est un vrai backlog
a construire, pas un doublon de l'existant.

---

## Taxation du Logement Vacant

### TLV (Taxe sur Logements Vacants)
Zone: Communes > 50 000 habitants avec desequilibre offre/demande
Seuil: Vacance > 1 an au 1er janvier
Taux: 17% (1ere annee), 34% (annees suivantes)
Base: Valeur locative

### THLV (Taxe d'Habitation sur Logements Vacants)
Zone: Communes ayant vote la THLV (pas en zone TLV)
Seuil: Vacance > 2 ans
Taux: Variable selon commune

### Exonerations
- Logement en vente/location au prix du marche
- Logement inoccupe independamment de la volonte du proprietaire
- Occupe > 90 jours consecutifs dans l'annee
- Travaux > 25% valeur venale

---

## Systeme d'Alertes Intelligentes

### Profil d'utilisation du bien

```javascript
const PROPERTY_PROFILES = {
  OCCUPANT: 'occupant',
  LOCATAIRE: 'locataire',
  AIRBNB: 'airbnb',
  VACANT: 'vacant',
  VENTE: 'vente'
};
```

### Alertes contextuelles par profil

OCCUPANT (proprietaire occupant):
- Priorite BASSE: PV AG (rappel simple, pas anxiogene), appel charges (info seulement)
- Priorite HAUTE: DPE expire (seulement si travaux prevus)
- PAS d'alerte: "manque documents" (il a le temps)

LOCATAIRE (en location):
- Priorite MOYENNE: PV AG (important pour le locataire), appel charges (verifier paiement)
- Priorite HAUTE: DPE (obligatoire pour le bail), equipements locataire (entretiens a jour)
- PAS d'alerte: documents non partages avec le locataire

AIRBNB (location courte duree):
- Priorite MOYENNE: assurance (couverture location courte duree), equipements fonctionnels
- Priorite HAUTE: reglementation locale (declaration obligatoire selon commune)

VACANT (inoccupe):
- Priorite HAUTE: taxe logement vacant (si > 1 an zone TLV), securite (alarme, assurance vacance), entretien (chauffage/eau, risque gel)
- Information: exonerations possibles

VENTE (en cours de vente):
- Priorite HAUTE: documents obligatoires vente (checklist), DPE valide, diagnostics a jour
- PAS d'alerte: PV AG (pas prioritaire vs vente)

---

## Interface Utilisateur (maquettes texte)

### Question initiale (creation du bien)
Titre: "Comment utilisez-vous ce bien ?"
Options: J'y habite / En location (bail) / En Airbnb / Inoccupe-vacant / En cours de vente
Note: "Ces informations nous aident a adapter vos alertes a votre situation."

### Alerte logement vacant (si concerne)
Titre: "Logement vacant depuis + d'1 an"
Contenu: zone TLV, exonerations possibles (mise en location/vente au prix du marche, travaux majeurs)
Actions: Marquer "En vente" / Marquer "En location" / Voir les exonerations

### Alerte contextuelle (exemple occupant)
Titre: "Assemblee Generale"
Contenu: rappel PV AG a consulter sur l'extranet syndic
Actions: Marquer comme fait / Rappeler plus tard

---

## Logique de calcul (reference)

```javascript
function getSmartAlerts(profile, property, documents) {
  const alerts = [];

  if (profile === 'VACANT') {
    if (isInTLVZone(property.address)) {
      alerts.push({
        type: 'warning',
        title: 'Taxe logement vacant',
        message: 'Zone TLV. Si vacant > 1 an, taxe de 17% de la valeur locative.',
        priority: 'high',
        actions: ['Mettre en location', 'Mettre en vente', 'Voir exonerations']
      });
    }
    alerts.push({ type: 'info', title: 'Assurance vacance', message: 'Verifier la couverture vacance.', priority: 'medium' });
  }

  if (profile === 'VENTE') {
    const missingDocs = checkSaleDocuments(property, documents);
    if (missingDocs.length > 0) {
      alerts.push({ type: 'error', title: 'Documents manquants pour la vente', message: missingDocs.join(', '), priority: 'high', actions: ['Ajouter les documents'] });
    }
  }

  if (profile === 'LOCATAIRE') {
    const dpe = documents.find(d => d.diagType === 'dpe');
    if (!dpe || isExpired(dpe, 10)) {
      alerts.push({ type: 'error', title: 'DPE obligatoire pour le bail', message: 'Validite: 10 ans.', priority: 'high' });
    }
  }

  if (profile === 'OCCUPANT') {
    const lastPV = getLastPV(documents);
    if (lastPV && isYearOld(lastPV)) {
      alerts.push({ type: 'info', title: 'Nouveau PV probablement disponible', message: 'Consultez votre extranet syndic.', priority: 'low' });
    }
  }

  return alerts;
}
```

Note: isInTLVZone, checkSaleDocuments, isExpired, getLastPV, isYearOld sont
des fonctions a implementer (non definies dans cette spec d'origine).

---

## UX des alertes

Niveaux visuels:
- Info: bleu, icone info, pas de son
- Warning: ambre, icone avertissement, pas de son
- Error: rouge, icone erreur, son optionnel

Actions possibles: Marquer comme fait (disparait) / Rappeler dans X jours (reapparait) / Ignorer (ne plus afficher) / Voir details (ouvre la page)

---

## Prochaines etapes (backlog, aucune commencee au 28/07/2026)

1. Implementer la question de profil a la creation du bien
2. Adapter les alertes selon le profil
3. Ajouter le calcul de zone TLV (geocodage)
4. Creer les alertes specifiques "vacant"
5. UX: regrouper les alertes par priorite

---

*Specification originale: 2026-04-13. Ajoutee au depot et verifiee le 28/07/2026 (Claude + Cecile).*
