import React, { useRef, useState } from 'react';
import { FaSearch, FaListUl, FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa';
import { Autocomplete } from '@react-google-maps/api';

const libraries = ['places']; // Biblioteca necessária para Autocomplete

const SearchSection = ({ onSearch, onViewChange, onDistanceChange, currentView, currentDistance, mapsApiLoaded, mapsLoadError }) => {
  const [address, setAddress] = useState('');
  const autocompleteRef = useRef(null);

  // Usa flags de carregamento vindas do App
  const isLoaded = mapsApiLoaded;
  const loadError = mapsLoadError;

  const handlePlaceSelect = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        onSearch(location);
      }
    }
  };

  // Lida com erros no carregamento da API do Google Maps
  if (loadError) {
    console.error("Google Maps API load error:", loadError);
    return <div className="text-red-500 text-center p-4 max-w-4xl mx-auto my-8">Erro ao carregar a API do Google Maps. Verifique sua chave e conexão.</div>;
  }

  return (
    // Container principal com arredondamento de 36px
    <div className="max-w-4xl mx-auto my-8 shadow-lg rounded-[36px] overflow-hidden">
      {/* Parte Superior Escura */}
      <div className="bg-[#1C1C1C] py-8 md:py-12 px-4 md:px-10">
        <div className="text-center">
          <h1 className="text-3xl min-[430px]:text-4xl md:text-5xl lg:text-5xl font-bold mb-6">
            <span className="text-white">Encontre o </span>
            <span className="bg-gradient-to-b from-[#F8E7BF] to-[#E5C884] text-transparent bg-clip-text">
              Distribuidor
            </span>
            <span className="text-white"> mais<br />próximo de você.</span>
          </h1>
          
          <div className="relative max-w-xl mx-auto">
            {isLoaded ? (
              <Autocomplete
                onLoad={ref => (autocompleteRef.current = ref)}
                onPlaceChanged={handlePlaceSelect}
                options={{
                  types: ['geocode', 'establishment'],
                  componentRestrictions: { country: 'br' }
                }}
              >
                <input
                  type="text"
                  placeholder="Digite um endereço..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePlaceSelect()}
                  className="w-full px-4 md:px-6 py-2.5 md:py-3 rounded-[36px] text-base min-[430px]:text-lg text-gray-800 bg-gray-100 focus:outline-none border border-gray-300"
                />
              </Autocomplete>
            ) : (
              <input
                type="text"
                placeholder="Carregando busca..."
                disabled
                className="w-full px-6 py-3 rounded-[36px] text-gray-500 bg-gray-200 text-lg cursor-not-allowed"
              />
            )}
            <button 
              onClick={handlePlaceSelect}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Buscar"
              disabled={!isLoaded}
            >
              <FaSearch size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Parte Inferior Clara */}
      <div className="bg-white px-4 md:px-10 py-4 md:py-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          {/* Seletor de Distância */}
          <div className="relative w-full sm:w-64">
            <select
              value={currentDistance}
              onChange={(e) => onDistanceChange(e.target.value)}
              className="appearance-none w-full bg-gray-100 text-gray-500 py-2.5 md:py-3 px-4 md:px-6 rounded-[36px] focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer border-0 text-center text-base min-[430px]:text-lg"
            >
              <option value="todos">Todos</option>
              <option value="10km">10km</option>
              <option value="25km">25km</option>
              <option value="50km">50km</option>
              <option value="100km">100km</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <FaChevronDown className="text-gray-400" />
            </div>
          </div>

          {/* Botões de Visualização */}
          <div className="flex gap-2 w-full sm:w-auto justify-center">
            <button
              onClick={() => onViewChange('list')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-[36px] text-base min-[430px]:text-lg transition-colors ${
                currentView === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <FaListUl />
              <span>Lista</span>
            </button>
            <button
              onClick={() => onViewChange('map')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-[36px] text-base min-[430px]:text-lg transition-colors ${
                currentView === 'map'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <FaMapMarkerAlt />
              <span>Mapa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSection; 