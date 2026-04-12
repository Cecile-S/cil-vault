# AUDIT UX/UI - CILIA

Date: 2026-04-12
Auditeur: Cillia
Référence: Skill ux-ui-theorie

---

## Évaluation Heuristique (Nielsen)

| # | Heuristique | Score | Problèmes |
|---|-------------|-------|-----------|
| 1 | Visibilité statut | 2/4 | Pas de loading state sur upload |
| 2 | Monde réel | 3/4 | Icônes claires, termes simples |
| 3 | Contrôle utilisateur | 2/4 | Pas de undo après suppression |
| 4 | Cohérence | 3/4 | Styles consistants |
| 5 | Prévention erreurs | 2/4 | Validation basique |
| 6 | Reconnaissance | 3/4 | Menus visibles, icônes |
| 7 | Flexibilité | 1/4 | Pas de raccourcis |
| 8 | Minimalisme | 2/4 | Trop de boutons sur home |
| 9 | Récupération erreurs | 1/4 | Alert() génériques |
| 10 | Aide | 2/4 | Onboarding OK, pas de tooltips |

**Score total: 21/40** (insuffisant)

---

## Problèmes Critiques

### 1. Charge Cognitive (Home page)
- **Problème**: 6 boutons d'action sur la home
- **Solution**: Réduire à 3 actions principales
- **Loi de Hick**: Trop de choix = paralysie

### 2. Touch Targets (iOS)
- **Problème**: Boutons < 44×44px
- **Solution**: Augmenter taille des boutons
- **Fitts Law**: Cibles petites = temps d'interaction long

### 3. Feedback (Upload)
- **Problème**: Pas de progression visible
- **Solution**: Ajouter barre de progression animée
- **Nielsen #1**: Statut système visible

### 4. Erreurs (Alert)
- **Problème**: alert() natifs, pas actionnables
- **Solution**: Toast notifications avec action
- **Nielsen #9**: Récupération erreurs

### 5. Annulation
- **Problème**: Suppression sans undo
- **Solution**: "Annuler" pendant 5 secondes
- **Nielsen #3**: Contrôle utilisateur

---

## Recommandations Prioritaires

### P0 - Critique (iOS)
1. **Touch targets 48×48px minimum**
2. **Feedback haptique sur actions**
3. **Loading states animés**

### P1 - Important
4. **Réduire choix home (3 max)**
5. **Toast notifications**
6. **Confirmation élégante (pas alert)**

### P2 - Amélioration
7. **Tooltips sur icônes**
8. **Raccourcis clavier (Pro)**
9. **Dark mode**

---

## Application Sciences Cognitives

### Charge Cognitive
- **Intrinsèque**: CIL complexe → simplifier par onboarding progressif
- **Extrinsèque**: Réduire à 3 choix par écran
- **Germinale**: Favoriser avec icônes et couleurs

### Loi de Fitts
- Bouton principal: 56×56px (grand)
- Boutons secondaires: 48×48px
- Coins écran: CTA "Commencer"

### Loi de Hick
- Navigation: 5 items max ✓
- Formulaires: 1 action principale
- Modals: 2 boutons max

---

## Prochaines Actions

1. Augmenter taille boutons (48px min)
2. Réduire home à 3 actions
3. Ajouter loading spinner
4. Remplacer alert() par toasts
5. Ajouter undo suppression

---
*Audit complet avec skill ux-ui-theorie*
