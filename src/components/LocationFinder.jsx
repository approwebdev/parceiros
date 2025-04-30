import React, { useEffect } from 'react';

const LocationFinder = ({ onLocationFound, onLocationError }) => {
  // Funções para tratamento da geolocalização
  const handleSuccess = (position) => {
    const { latitude, longitude } = position.coords;
    console.log('Localização encontrada:', latitude, longitude);
    onLocationFound({ lat: latitude, lng: longitude });
  };

  const handleError = (error) => {
    console.error('Erro ao obter localização:', error);
    onLocationError && onLocationError(error);
  };

  // Função para buscar a localização atual do usuário
  const getLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocalização não é suportada pelo seu navegador');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };
    
    try {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        options
      );
    } catch (error) {
      console.error('Erro ao buscar localização:', error);
      onLocationError && onLocationError(error);
    }
  };

  // Tentar obter a localização automaticamente ao carregar o componente
  useEffect(() => {
    getLocation();
  }, []);

  // Não renderiza nada visualmente
  return null;
};

export default LocationFinder; 