import React, { useRef, useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { Autocomplete } from '@react-google-maps/api';

const libraries = ['places']; // Biblioteca necessária para Autocomplete

const SearchSection = ({ onSearch, mapsApiLoaded, mapsLoadError }) => {
  const [address, setAddress] = useState('');
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  // Usa flags de carregamento vindas do App
  const isLoaded = mapsApiLoaded;
  const loadError = mapsLoadError;

  const handlePlaceSelect = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (place) {
        // Atualiza o valor do input com o endereço completo selecionado
        if (place.formatted_address) {
          setAddress(place.formatted_address);
        } else if (place.name) {
          setAddress(place.name);
        }
        
        // Verifica se tem geometria e envia a localização
        if (place.geometry && place.geometry.location) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          onSearch(location);
        }
      }
    }
  };

  // Quando o autocomplete é carregado, configura o evento para detectar mudanças na seleção
  const onAutocompleteLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
    
    // Adiciona um ouvinte para quando o usuário selecionar uma sugestão com o mouse ou teclado
    if (window.google && autocomplete) {
      window.google.maps.event.addListener(autocomplete, 'place_changed', () => {
        handlePlaceSelect();
      });
    }
  };

  // Lida com erros no carregamento da API do Google Maps
  if (loadError) {
    console.error("Google Maps API load error:", loadError);
    return <div className="text-red-500 text-center p-4 max-w-4xl mx-auto my-8">Erro ao carregar a API do Google Maps. Verifique sua chave e conexão.</div>;
  }

  return (
    // Container principal com arredondamento de 36px
    <div className="max-w-4xl mx-auto shadow-lg rounded-[10px] overflow-hidden">
      {/* Parte Superior Escura */}
      <div className="bg-[#1C1C1C] py-6 md:py-12 px-3 md:px-10">
        <div className="text-center">
          <h1 className="text-4xl min-[430px]:text-4xl md:text-5xl lg:text-5xl font-bold mb-6 md:mb-6">
            <span className="text-white">Encontre o </span>
            <span className="bg-gradient-to-b from-[#F8E7BF] to-[#E5C884] text-transparent bg-clip-text">
              Parceiro
            </span>
            <span className="text-white"> mais<br />próximo de você.</span>
          </h1>
          
          <div className="relative max-w-full mx-auto">
            {isLoaded ? (
              <Autocomplete
                onLoad={onAutocompleteLoad}
                options={{
                  types: ['geocode', 'establishment'],
                  componentRestrictions: { country: 'br' },
                  fields: ['formatted_address', 'geometry', 'name']
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Digite um endereço..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePlaceSelect()}
                  className="w-full px-3 md:px-6 py-2.5 md:py-3 rounded-[36px] text-base min-[430px]:text-lg text-gray-800 bg-gray-100 focus:outline-none border border-gray-300"
                />
              </Autocomplete>
            ) : (
              <input
                type="text"
                placeholder="Carregando busca..."
                disabled
                className="w-full px-3 md:px-6 py-2.5 md:py-3 rounded-[36px] text-gray-500 bg-gray-200 text-base min-[430px]:text-lg cursor-not-allowed"
              />
            )}
            <button 
              onClick={handlePlaceSelect}
              className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Buscar"
              disabled={!isLoaded}
            >
              <FaSearch size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSection; 