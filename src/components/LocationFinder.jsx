import React, { useState, useEffect } from 'react';
import { FaLocationArrow, FaMapMarkerAlt, FaTimesCircle } from 'react-icons/fa';

const LocationFinder = ({ onLocationFound, onLocationError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Funções para tratamento da geolocalização
  const handleSuccess = (position) => {
    const { latitude, longitude } = position.coords;
    setLoading(false);
    setError(null);
    setPermissionDenied(false);
    
    console.log('Localização encontrada:', latitude, longitude);
    onLocationFound({ lat: latitude, lng: longitude });
  };

  const handleError = (error) => {
    setLoading(false);
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setPermissionDenied(true);
        setError('Permissão para localização negada. Por favor, permita o acesso à sua localização nas configurações do navegador.');
        break;
      case error.POSITION_UNAVAILABLE:
        setError('Não foi possível determinar sua localização. Verifique se o GPS está ativado.');
        break;
      case error.TIMEOUT:
        setError('Tempo esgotado ao tentar obter sua localização. Tente novamente.');
        break;
      default:
        setError('Erro ao buscar localização. Tente novamente.');
    }
    
    onLocationError && onLocationError(error);
  };

  // Função para buscar a localização atual do usuário
  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada pelo seu navegador');
      return;
    }

    setLoading(true);
    setError(null);
    setPermissionDenied(false);
    
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
      setLoading(false);
      setError('Erro ao iniciar busca de localização');
      console.error('Erro ao buscar localização:', error);
    }
  };

  // Tentar obter a localização automaticamente ao carregar o componente
  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <FaMapMarkerAlt className="text-blue-600" />
        Sua localização
      </h3>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-3 flex items-center">
          <FaTimesCircle className="mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      <button
        onClick={getLocation}
        disabled={loading}
        className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-white 
          ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
        `}
      >
        <FaLocationArrow />
        {loading ? 'Buscando sua localização...' : 'Usar minha localização atual'}
      </button>
      
      {permissionDenied && (
        <p className="text-sm text-gray-600 mt-2">
          Para usar esta funcionalidade, você precisa permitir o acesso à sua localização nas configurações do seu navegador.
        </p>
      )}
    </div>
  );
};

export default LocationFinder; 