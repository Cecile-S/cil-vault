import { createContext, useContext, useState } from 'react';

// Default property object
const defaultProperty = {
  id: null,
  adresse: '',
  adresse_lat: null,
  adresse_lng: null,
  type: '',
  surface: null,
  nb_pieces: null,
  id_proprietaire: null,
  id_mandataire: null,
  created_at: null,
};

const PropertyContext = createContext({
  property: defaultProperty,
  setProperty: () => {},
});

export const useProperty = () => {
  return useContext(PropertyContext);
};

export const PropertyProvider = ({ children }) => {
  const [property, setProperty] = useState(defaultProperty);

  return (
    <PropertyContext.Provider value={{ property, setProperty }}>
      {children}
    </PropertyContext.Provider>
  );
};