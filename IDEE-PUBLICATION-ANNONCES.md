# Publication Annonces Immo - Idee V3+

## Contexte
Cecile suggere de pouvoir publier des annonces de vente/location directement depuis CILIA vers les plateformes immobilieres.

## Analyse de l'idee

Valeur pour le proprietaire: un seul point d'entree, plus besoin de recreer l'annonce sur chaque site, donnees du CIL reutilisees automatiquement, gain de temps considerable.
Valeur pour CILIA: differenciation forte vs concurrents, boucle CIL -> Annonce -> Vente -> Transfert, donnees enrichies.

### APIs disponibles

| Portail | API publique |
|---------|--------------|
| SeLoger | Non, a negocier |
| LeBonCoin | Oui, API Pro disponible |
| Logic-Immo | Non, a negocier |
| PAP | Oui, API disponible |
| Green Rent | Inconnu, a contacter |

## Workflow propose

Proprietaire a son CIL complet -> clique "Publier une annonce" -> CILIA pre-remplit avec les donnees du CIL (adresse, surface, pieces, type, DPE, equipements, photos) -> proprietaire complete (prix, description, photos supplementaires, disponibilite) -> selection des portails -> publication multi-plateformes en un clic -> gestion des contacts dans CILIA.

## Business Model (options a trancher)
- Option A Freemium: gratuit PAP (1 annonce), Pro (9,99e/an) multi-plateformes
- Option B Commission: gratuit proprietaire, commission sur honoraires si agent
- Option C Par annonce: 29e/annonce multi-plateformes, illimite pour abonnes Pro

## Roadmap
- V1 (MVP): publication PAP uniquement, pre-remplissage auto, photos upload (~40h, necessite API PAP)
- V2: LeBonCoin Pro, Logic-Immo, gestion des contacts (~60h + partenariats)
- V3: tous les portails, visite virtuelle 360, CRM integree

## Concurrents
| Produit | Fonctionnalite | Prix |
|---------|----------------|------|
| Rentila | Publication multi-sites | 49e/mois |
| Hipaye | Gestion locative + annonces | 29e/mois |
| Immo-Scanner | Diffusion annonces | 19e/annonce |

Avantage CILIA vise : integre au CIL, pas besoin de ressaisir, boucle complete.

## Prochaines etapes
1. Contacter API LeBonCoin Pro
2. Contacter PAP pour partenariat
3. Maquetter l'interface
4. Implementer V1 (PAP uniquement)

STATUT (verifie 28/07/2026): rien implemente, idee explicitement classee V3+
par Cecile elle-meme des l'origine. Ne pas prioriser avant le coeur produit CIL.

---
*Idee enregistree: 2026-04-13*
*Priorite: V3+ (apres Pre-Etat Date et integrations syndics)*
