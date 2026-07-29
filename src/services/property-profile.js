// Property Profile & Smart Alerts Service
// Implements SPEC-ALERTES-INTELLIGENTES.md specification

// Property usage profiles
export const PROPERTY_PROFILES = {
  OCCUPANT: 'occupant',        // Propriétaire occupant
  LOCATAIRE: 'locataire',      // En location
  AIRBNB: 'airbnb',            // Location courte durée
  VACANT: 'vacant',            // Inoccupé
  VENTE: 'vente',              // En cours de vente
};

// Profile labels for display
export const PROFILE_LABELS = {
  [PROPERTY_PROFILES.OCCUPANT]: 'J\'y habite (propriétaire occupant)',
  [PROPERTY_PROFILES.LOCATAIRE]: 'En location (bail)',
  [PROPERTY_PROFILES.AIRBNB]: 'Airbnb / location courte durée',
  [PROPERTY_PROFILES.VACANT]: 'Inoccupé / vacant',
  [PROPERTY_PROFILES.VENTE]: 'En cours de vente',
};

// Profile icons for display
export const PROFILE_ICONS = {
  [PROPERTY_PROFILES.OCCUPANT]: '🏠',
  [PROPERTY_PROFILES.LOCATAIRE]: '🔑',
  [PROPERTY_PROFILES.AIRBNB]: '🏠💰',
  [PROPERTY_PROFILES.VACANT]: '🏚️',
  [PROPERTY_PROFILES.VENTE]: '🏷️',
};

/**
 * Check if property is in TLV zone (Taxe sur Logements Vacants)
 * Zone: Communes > 50,000 habitants avec déséquilibre offre/demande
 * This is a simplified check - in production would use geocoding API
 * @param {string} address - Property address
 * @returns {boolean}
 */
export function isInTLVZone(address) {
  if (!address) return false;
  
  const tlvCities = [
    'paris', 'lyon', 'marseille', 'toulouse', 'nice', 'nantes',
    'strasbourg', 'montpellier', 'bordeaux', 'lille', 'rennes',
    'reims', 'le havre', 'saint-etienne', 'toulon', 'grenoble',
    'dijon', 'angers', 'nimes', 'villeurbanne', 'levallois-perret',
    'vincennes', 'levallois', 'courbevoie', 'neuilly-sur-seine',
    'levallois-perret', 'issy-les-moulineaux', 'bagneux', 'fontenay-sous-bois',
    'creteil', 'vitry-sur-seine', 'ivry-sur-seine', 'choisy-le-roi',
    'alfortville', 'villejuif', 'l\'hay-les-roses', 'fresnes', 'antony',
    'bourg-la-reine', 'sceaux', 'fontenay-aux-roses', 'le plessis-robinson',
    'clichy', 'levallois', 'asnieres-sur-seine', 'genevilliers', 'epinay-sur-seine',
    'saint-ouen', 'saint-denis', 'aubervilliers', 'la courneuve', 'drancy',
    'bobigny', 'noisy-le-sec', 'romainville', 'les lilas', 'pantin',
    'pre-saint-gervais', 'bondy', 'livry-gargan', 'aubagne', 'martigues',
    'aixen-provence', 'marignane', 'vitrolles', 'marseille', 'allauch',
    'plan-de-cuques', 'cassis', 'la ciotat', 'aubagne', 'carnoux-en-provence',
  ];
  
  const lowerAddress = address.toLowerCase();
  return tlvCities.some(city => lowerAddress.includes(city));
}

/**
 * Check if DPE is expired (10 years validity)
 * @param {Object} document - Document object
 * @returns {boolean}
 */
export function isDPEExpired(document) {
  if (!document || document.diagType !== 'dpe') return false;
  if (!document.date) return true;
  
  const docDate = new Date(document.date);
  const now = new Date();
  const diffYears = (now - docDate) / (1000 * 60 * 60 * 24 * 365.25);
  return diffYears >= 10;
}

/**
 * Get last PV (Procès-Verbal AG) from documents
 * @param {Array} documents - Array of documents
 * @returns {Object|null}
 */
export function getLastPV(documents) {
  if (!documents || !documents.length) return null;
  const pvs = documents.filter(d => d.diagType === 'pv_ag' || d.name?.toLowerCase().includes('pv') || d.name?.toLowerCase().includes('proces-verbal') || d.name?.toLowerCase().includes('assemblee'));
  if (!pvs.length) return null;
  return pvs.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))[0];
}

/**
 * Check if document is older than 1 year
 * @param {Object} document - Document object
 * @returns {boolean}
 */
export function isYearOld(document) {
  if (!document || !document.date) return false;
  const docDate = new Date(document.date);
  const now = new Date();
  const diffYears = (now - docDate) / (1000 * 60 * 60 * 24 * 365.25);
  return diffYears >= 1;
}

/**
 * Check sale documents completeness
 * @param {Object} property - Property object
 * @param {Array} documents - Array of documents
 * @returns {Array} Missing documents
 */
export function checkSaleDocuments(property, documents) {
  const requiredForSale = [
    { type: 'dpe', label: 'DPE' },
    { type: 'electricite', label: 'Diagnostic électricité' },
    { type: 'gaz', label: 'Diagnostic gaz' },
    { type: 'erp', label: 'ERP' },
    { type: 'carrez', label: 'Loi Carrez (surface)' },
    { type: 'amiante', label: 'Diagnostic amiante' },
    { type: 'plomb', label: 'Diagnostic plomb' },
    { type: 'termites', label: 'Diagnostic termites' },
  ];
  
  const missing = [];
  for (const req of requiredForSale) {
    const found = documents.find(d => d.diagType === req.type);
    if (!found || (req.type === 'dpe' && isDPEExpired(found))) {
      missing.push(req.label);
    }
  }
  return missing;
}

/**
 * Check rental documents completeness
 * @param {Object} property - Property object
 * @param {Array} documents - Array of documents
 * @returns {Array} Missing documents
 */
export function checkRentalDocuments(property, documents) {
  const requiredForRental = [
    { type: 'dpe', label: 'DPE' },
    { type: 'electricite', label: 'Diagnostic électricité' },
    { type: 'gaz', label: 'Diagnostic gaz' },
    { type: 'erp', label: 'ERP' },
    { type: 'boutin', label: 'Loi Boutin (surface)' },
    { type: 'plomb', label: 'Diagnostic plomb' },
  ];
  
  const missing = [];
  for (const req of requiredForRental) {
    const found = documents.find(d => d.diagType === req.type);
    if (!found || (req.type === 'dpe' && isDPEExpired(found))) {
      missing.push(req.label);
    }
  }
  return missing;
}

/**
 * Generate smart alerts based on property profile
 * @param {string} profile - Property profile (from PROPERTY_PROFILES)
 * @param {Object} property - Property object
 * @param {Array} documents - Array of documents
 * @param {Array} equipment - Array of equipment
 * @returns {Array} Array of alert objects
 */
export function getSmartAlerts(profile, property, documents, equipment) {
  const alerts = [];
  const now = new Date();
  
  // Get relevant documents for this property
  const propDocuments = documents?.filter(d => d.propertyId === property?.id) || [];
  const propEquipment = equipment?.filter(e => e.propertyId === property?.id) || [];
  
  // === VACANT (Inoccupé) ===
  if (profile === PROPERTY_PROFILES.VACANT) {
    // Taxe logement vacant (TLV) - check if in TLV zone
    if (isInTLVZone(property?.address)) {
      alerts.push({
        id: `alert-tlv-${property?.id}`,
        type: 'warning',
        title: '⚠️ Taxe sur Logements Vacants (TLV)',
        message: 'Votre logement est en zone TLV. Si vacant > 1 an au 1er janvier : taxe 17% valeur locative (1ère année), 34% années suivantes.',
        priority: 'high',
        category: 'vacant',
        actions: [
          { label: 'Marquer "En vente"', action: 'setProfile', payload: PROPERTY_PROFILES.VENTE },
          { label: 'Marquer "En location"', action: 'setProfile', payload: PROPERTY_PROFILES.LOCATAIRE },
          { label: 'Voir exonérations', action: 'showExemptions' },
        ],
      });
    }
    
    // THLV (Taxe d'Habitation sur Logements Vacants)
    if (!isInTLVZone(property?.address)) {
      alerts.push({
        id: `alert-thlv-${property?.id}`,
        type: 'info',
        title: 'ℹ️ Taxe d\'Habitation Logements Vacants (THLV)',
        message: 'Votre commune peut avoir voté la THLV. Si vacant > 2 ans : taxe au taux TH résidences secondaires.',
        priority: 'medium',
        category: 'vacant',
        actions: [
          { label: 'Vérifier ma commune', action: 'checkTHLV' },
          { label: 'Marquer "En vente"', action: 'setProfile', payload: PROPERTY_PROFILES.VENTE },
          { label: 'Marquer "En location"', action: 'setProfile', payload: PROPERTY_PROFILES.LOCATAIRE },
        ],
      });
    }
    
    // Assurance vacance
    alerts.push({
      id: `alert-insurance-${property?.id}`,
      type: 'info',
      title: '🏠 Assurance vacance',
      message: 'Vérifiez que votre assurance couvre la vacance prolongée (gel, dégât des eaux, vol).',
      priority: 'medium',
      category: 'vacant',
      actions: [
        { label: 'Contacter mon assureur', action: 'contactInsurer' },
      ],
    });
    
    // Entretien préventif (gel, chauffage)
    alerts.push({
      id: `alert-maintenance-${property?.id}`,
      type: 'info',
      title: '🌡️ Entretien préventif',
      message: 'Logement inoccupé : maintenez le chauffage hors gel, purgez l\'eau si absence prolongée.',
      priority: 'medium',
      category: 'vacant',
    });
    
    // Exonérations info
    alerts.push({
      id: `alert-exemptions-${property?.id}`,
      type: 'info',
      title: '💡 Exonérations possibles',
      message: 'Exonération TLV/THLV si : mis en location/vente prix marché, travaux > 25% valeur, occupé > 90j/an, indépendant de votre volonté.',
      priority: 'low',
      category: 'vacant',
      actions: [
        { label: 'Voir détail exonérations', action: 'showExemptions' },
      ],
    });
  }
  
  // === VENTE (En cours de vente) ===
  if (profile === PROPERTY_PROFILES.VENTE) {
    const missingSaleDocs = checkSaleDocuments(property, propDocuments);
    if (missingSaleDocs.length > 0) {
      alerts.push({
        id: `alert-sale-docs-${property?.id}`,
        type: 'error',
        title: '📋 Documents manquants pour la vente',
        message: `Diagnostics obligatoires absents ou expirés : ${missingSaleDocs.join(', ')}`,
        priority: 'high',
        category: 'sale',
        actions: [
          { label: 'Ajouter les documents', action: 'addDocuments', payload: missingSaleDocs },
        ],
      });
    }
    
    // DPE validity for sale
    const dpe = propDocuments.find(d => d.diagType === 'dpe');
    if (!dpe || isDPEExpired(dpe)) {
      alerts.push({
        id: `alert-sale-dpe-${property?.id}`,
        type: 'error',
        title: '📊 DPE obligatoire pour la vente',
        message: 'Le DPE doit être valide (< 10 ans) pour vendre. Sans DPE valide : pas de compromis possible.',
        priority: 'high',
        category: 'sale',
        actions: [
          { label: 'Ajouter DPE', action: 'addDocument', payload: { type: 'dpe' } },
        ],
      });
    }
  }
  
  // === LOCATAIRE (En location) ===
  if (profile === PROPERTY_PROFILES.LOCATAIRE) {
    // DPE obligatoire pour bail
    const dpe = propDocuments.find(d => d.diagType === 'dpe');
    if (!dpe || isDPEExpired(dpe)) {
      alerts.push({
        id: `alert-rental-dpe-${property?.id}`,
        type: 'error',
        title: '📊 DPE obligatoire pour le bail',
        message: 'Le DPE est obligatoire pour louer. Validité : 10 ans. Sans DPE valide : bail non conforme.',
        priority: 'high',
        category: 'rental',
        actions: [
          { label: 'Ajouter DPE', action: 'addDocument', payload: { type: 'dpe' } },
        ],
      });
    }
    
    // Documents location
    const missingRentalDocs = checkRentalDocuments(property, propDocuments);
    if (missingRentalDocs.length > 0) {
      alerts.push({
        id: `alert-rental-docs-${property?.id}`,
        type: 'warning',
        title: '📋 Diagnostics location à vérifier',
        message: `Documents recommandés : ${missingRentalDocs.join(', ')}`,
        priority: 'medium',
        category: 'rental',
        actions: [
          { label: 'Ajouter documents', action: 'addDocuments', payload: missingRentalDocs },
        ],
      });
    }
    
    // Équipements locataire - entretiens à jour
    const tenantEquipment = propEquipment.filter(e => e.responsible === 'tenant' || (e.type && ['vmc', 'chaudiere_gaz', 'chaudiere_fuel', 'chauffe_eau'].includes(e.type)));
    const overdueTenantEquip = tenantEquipment.filter(eq => {
      if (!eq.nextMaintenance) return false;
      const next = new Date(eq.nextMaintenance);
      return next < now;
    });
    
    if (overdueTenantEquip.length > 0) {
      alerts.push({
        id: `alert-tenant-equip-${property?.id}`,
        type: 'warning',
        title: '🔧 Entretiens locataire en retard',
        message: `${overdueTenantEquip.length} équipement(s) sous responsabilité locataire en retard d'entretien.`,
        priority: 'medium',
        category: 'rental',
        actions: [
          { label: 'Voir équipements', action: 'viewEquipment' },
        ],
      });
    }
    
    // PV AG - important pour locataire
    const lastPV = getLastPV(propDocuments);
    if (lastPV && isYearOld(lastPV)) {
      alerts.push({
        id: `alert-rental-pv-${property?.id}`,
        type: 'info',
        title: '📄 Nouveau PV AG probable',
        message: 'L\'AG annuelle a probablement eu lieu. Le PV est important pour le locataire (charges, travaux votés).',
        priority: 'medium',
        category: 'rental',
        actions: [
          { label: 'Télécharger PV', action: 'downloadPV' },
        ],
      });
    }
  }
  
  // === AIRBNB (Location courte durée) ===
  if (profile === PROPERTY_PROFILES.AIRBNB) {
    // Réglementation locale - déclaration mairie
    if (isInTLVZone(property?.address)) {
      alerts.push({
        id: `alert-airbnb-declaration-${property?.id}`,
        type: 'warning',
        title: '📋 Déclaration mairie obligatoire',
        message: 'En zone tendue (TLV), la location courte durée nécessite une déclaration en mairie et un numéro d\'enregistrement.',
        priority: 'high',
        category: 'airbnb',
        actions: [
          { label: 'Voir démarches', action: 'viewAirbnbSteps' },
        ],
      });
    }
    
    // Assurance spécifique
    alerts.push({
      id: `alert-airbnb-insurance-${property?.id}`,
      type: 'info',
      title: '🛡️ Assurance location courte durée',
      message: 'Vérifiez que votre assurance couvre la location de courte durée (responsabilité civile voyageurs, dommages).',
      priority: 'medium',
      category: 'airbnb',
      actions: [
        { label: 'Contacter assureur', action: 'contactInsurer' },
      ],
    });
    
    // Équipements fonctionnels pour voyageurs
    const essentialEquip = propEquipment.filter(e => e.type && ['chaudiere_gaz', 'chaudiere_fuel', 'chauffe_eau', 'vmc', 'climatisation'].includes(e.type));
    const overdueEssential = essentialEquip.filter(eq => {
      if (!eq.nextMaintenance) return false;
      const next = new Date(eq.nextMaintenance);
      return next < now;
    });
    
    if (overdueEssential.length > 0) {
      alerts.push({
        id: `alert-airbnb-equip-${property?.id}`,
        type: 'warning',
        title: '🔧 Équipements essentiels à vérifier',
        message: `${overdueEssential.length} équipement(s) clé(s) en retard d'entretien. Risque de mauvaise expérience voyageur.`,
        priority: 'medium',
        category: 'airbnb',
        actions: [
          { label: 'Planifier entretiens', action: 'scheduleMaintenance' },
        ],
      });
    }
  }
  
  // === OCCUPANT (Propriétaire occupant) ===
  if (profile === PROPERTY_PROFILES.OCCUPANT) {
    // Alertes minimales - info seulement
    const lastPV = getLastPV(propDocuments);
    if (lastPV && isYearOld(lastPV)) {
      alerts.push({
        id: `alert-occupant-pv-${property?.id}`,
        type: 'info',
        title: '📄 Nouveau PV AG probablement disponible',
        message: 'L\'AG annuelle a eu lieu. Consultez votre extranet syndic pour télécharger le nouveau PV.',
        priority: 'low',
        category: 'occupant',
        actions: [
          { label: 'Extranet syndic', action: 'openSyndicExtranet' },
          { label: 'Rappeler plus tard', action: 'snooze', payload: { days: 30 } },
        ],
      });
    }
    
    // DPE expiré seulement si travaux prévus (info seulement)
    const dpe = propDocuments.find(d => d.diagType === 'dpe');
    if (dpe && isDPEExpired(dpe)) {
      alerts.push({
        id: `alert-occupant-dpe-${property?.id}`,
        type: 'info',
        title: '📊 DPE expiré',
        message: 'Votre DPE a plus de 10 ans. Renouvellement utile si travaux de rénovation prévus.',
        priority: 'low',
        category: 'occupant',
        actions: [
          { label: 'Renouveler DPE', action: 'addDocument', payload: { type: 'dpe' } },
        ],
      });
    }
  }
  
  // Sort by priority: high > medium > low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return alerts;
}

/**
 * Get profile-specific required documents
 * @param {string} profile - Property profile
 * @returns {Array} Required document types
 */
export function getRequiredDocsForProfile(profile) {
  switch (profile) {
    case PROPERTY_PROFILES.VENTE:
      return ['dpe', 'electricite', 'gaz', 'erp', 'carrez', 'amiante', 'plomb', 'termites'];
    case PROPERTY_PROFILES.LOCATAIRE:
      return ['dpe', 'electricite', 'gaz', 'erp', 'boutin', 'plomb'];
    case PROPERTY_PROFILES.AIRBNB:
      return ['dpe', 'erp', 'declaration_mairie'];
    case PROPERTY_PROFILES.VACANT:
      return ['dpe', 'assurance_vacance'];
    case PROPERTY_PROFILES.OCCUPANT:
    default:
      return ['dpe'];
  }
}

/**
 * Get profile display info
 * @param {string} profile - Property profile
 * @returns {Object} Profile info with label, icon, description
 */
export function getProfileInfo(profile) {
  return {
    value: profile,
    label: PROFILE_LABELS[profile] || profile,
    icon: PROFILE_ICONS[profile] || '🏠',
    description: getProfileDescription(profile),
  };
}

function getProfileDescription(profile) {
  const descriptions = {
    [PROPERTY_PROFILES.OCCUPANT]: 'Vous vivez dans ce bien. Alertes minimales : PV AG, DPE si travaux.',
    [PROPERTY_PROFILES.LOCATAIRE]: 'Bien loué à un locataire. Alertes : DPE obligatoire, diagnostics bail, entretiens locataire.',
    [PROPERTY_PROFILES.AIRBNB]: 'Location courte durée. Alertes : déclaration mairie, assurance adaptée, équipements voyageurs.',
    [PROPERTY_PROFILES.VACANT]: 'Bien inoccupé. Alertes prioritaires : taxe logement vacant (TLV/THLV), assurance, entretien préventif.',
    [PROPERTY_PROFILES.VENTE]: 'Bien en vente. Alertes : checklist diagnostics vente, DPE valide, documents notaire.',
  };
  return descriptions[profile] || '';
}