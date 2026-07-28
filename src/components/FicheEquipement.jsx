import React, { useState, useEffect } from 'react';

const FicheEquipement = () => {
  const [equipments, setEquipments] = useState([]);
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    type: '',
    manufacturer: '',
    model: '',
    purchaseDate: '',
    maintenanceDate: '',
    nextMaintenanceDate: '',
    status: 'bon',
    notes: ''
  });
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    maintenanceDue: false,
    search: ''
  });

  useEffect(() => {
    // Fetch equipments from localStorage
    const storedEquipments = JSON.parse(localStorage.getItem('equipments')) || [];
    setEquipments(storedEquipments);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEquipment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Calculate next maintenance date (default to 1 year from last maintenance if not specified)
    const equipmentWithMaintenance = {
      ...newEquipment,
      id: Date.now(),
      nextMaintenanceDate: newEquipment.nextMaintenanceDate || 
        (newEquipment.maintenanceDate ? 
          new Date(new Date(newEquipment.maintenanceDate).setFullYear(new Date(newEquipment.maintenanceDate).getFullYear() + 1)).toISOString().split('T')[0] : ''
    };
    const updatedEquipments = [...equipments, equipmentWithMaintenance];
    setEquipments(updatedEquipments);
    localStorage.setItem('equipments', JSON.stringify(updatedEquipments));
    setNewEquipment({
      name: '',
      type: '',
      manufacturer: '',
      model: '',
      purchaseDate: '',
      maintenanceDate: '',
      nextMaintenanceDate: '',
      status: 'bon',
      notes: ''
    });
  };

  const filteredEquipments = equipments.filter(equipment => {
    if (filters.type && equipment.type !== filters.type) return false;
    if (filters.status && equipment.status !== filters.status) return false;
    if (filters.maintenanceDue) {
      const today = new Date();
      const maintenanceDate = new Date(equipment.nextMaintenanceDate);
      const daysUntilMaintenance = Math.ceil((maintenanceDate - today) / (1000 * 60 * 60 * 24));
      if (daysUntilMaintenance > 30) return false;
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return equipment.name.toLowerCase().includes(searchTerm) ||
             equipment.type.toLowerCase().includes(searchTerm) ||
             equipment.manufacturer.toLowerCase().includes(searchTerm);
    }
    return true;
  });

  const getMaintenanceStatus = (equipment) => {
    if (!equipment.nextMaintenanceDate) return 'Aucune date définie';
    const today = new Date();
    const maintenanceDate = new Date(equipment.nextMaintenanceDate);
    const daysUntilMaintenance = Math.ceil((maintenanceDate - today) / (1000 * 60 * 60 * 24));
    if (daysUntilMaintenance < 0) return `En retard de ${Math.abs(daysUntilMaintenance)} jours`;
    if (daysUntilMaintenance <= 7) return `Dans ${daysUntilMaintenance} jours (Urgent)`;
    if (daysUntilMaintenance <= 30) return `Dans ${daysUntilMaintenance} jours`;
    return 'À terme';
  };

  return (
    <div>
      <h2>Fiche Équipement</h2>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom de l'équipement:</label>
          <input
            type="text"
            name="name"
            value={newEquipment.name}
            onChange={handleInputChange}
            placeholder="Ex: Climatiseur"
            required
          />
        </div>
        
        <div>
          <label>Type:</label>
          <input
            type="text"
            name="type"
            value={newEquipment.type}
            onChange={handleInputChange}
            placeholder="Ex: Équipement HVAC"
            required
          />
        </div>
        
        <div>
          <label>Marque:</label>
          <input
            type="text"
            name="manufacturer"
            value={newEquipment.manufacturer}
            onChange={handleInputChange}
            placeholder="Ex: Daikin"
          />
        </div>
        
        <div>
          <label>Modèle:</label>
          <input
            type="text"
            name="model"
            value={newEquipment.model}
            onChange={handleInputChange}
            placeholder="Ex: FTKA"
          />
        </div>
        
        <div>
          <label>Date d'achat:</label>
          <input
            type="date"
            name="purchaseDate"
            value={newEquipment.purchaseDate}
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <label>Date de dernière maintenance:</label>
          <input
            type="date"
            name="maintenanceDate"
            value={newEquipment.maintenanceDate}
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <label>Date de prochaine maintenance:</label>
          <input
            type="date"
            name="nextMaintenanceDate"
            value={newEquipment.nextMaintenanceDate}
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <label>Statut:</label>
          <select
            name="status"
            value={newEquipment.status}
            onChange={handleInputChange}
          >
            <option value="bon">Bon état</option>
            <option value="moyen">État moyen</option>
            <option value="mauvais">Mauvais état</option>
            <option value:"en_panne">En panne</option>
          </select>
        </div>
        
        <div>
          <label>Notes:</label>
          <textarea
            name="notes"
            value={newEquipment.notes}
            onChange={handleInputChange}
            placeholder="Notes sur l'équipement"
          />
        </div>
        
        <button type="submit">Ajouter Équipement</button>
      </form>
      
      <div>
        <h3>Filters:</h3>
        <select
          value={filters.type}
          onChange={(e) => setFilters({...filters, type: e.target.value})}
        >
          <option value="">Tous les types</option>
          {[...new Set(equipments.map(e => e.type))].map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        
        <select
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="">Tous les statuts</option>
          <option value="bon">Bon</option>
          <option value="moyen">Moyen</option>
          <option value="mauvais">Mauvais</option>
          <option value:"en_panne">En panne</option>
        </select>
        
        <label>
          <input
            type="checkbox"
            checked={filters.maintenanceDue}
            onChange={(e) => setFilters({...filters, maintenanceDue: e.target.checked})}
          />
          Maintenance due dans 30 jours
        </label>
        
        <input
          type="text"
          placeholder="Rechercher par nom, type, marque"
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
        />
      </div>
      
      <div>
        <h3>Liste des Équipements</h3>
        {filteredEquipments.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Marque/Modèle</th>
                <th>Statut</th>
                <th>Prochaine Maintenance</th>
                <th>Statut Maintenance</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipments.map(equipment => (
                <tr key={equipment.id}>
                  <td>{equipment.name}</td>
                  <td>{equipment.type}</td>
                  <td>{equipment.manufacturer} {equipment.model}</td>
                  <td>{equipment.status}</td>
                  <td>{equipment.nextMaintenanceDate ? new Date(equipment.nextMaintenanceDate).toLocaleDateString() : 'Non définie'}</td>
                  <td>{getMaintenanceStatus(equipment)}</td>
                  <td>{equipment.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Aucun équipement enregistré pour le moment.</p>
        )}
      </div>
    </div>
  );
};

export default FicheEquipement;