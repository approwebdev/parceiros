import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { FaStoreAlt, FaInstagram, FaWhatsapp, FaMapMarkedAlt } from 'react-icons/fa';

// Configurações do mapa
const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '16px',
};

const defaultOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  gestureHandling: 'greedy'
};

// Configurações do Google Maps
const googleMapsOptions = {
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  libraries: ['places', 'geometry'],
  version: 'weekly'
};

const MapView = ({ distribuidores, userLocation, onDistribuidorClick, mapsApiLoaded, mapsLoadError, distanceFilter }) => {
  const [selectedDistribuidor, setSelectedDistribuidor] = useState(null);
  const [map, setMap] = useState(null);
  const [distribuidoresGeo, setDistribuidoresGeo] = useState([]);

  // Função para obter o nome do plano baseado no plan_id
  const getNomePlano = (planId) => {
    console.log("Plan ID recebido:", planId, typeof planId);
    console.log("Distribuidor completo:", selectedDistribuidor);
    
    // Verificar diretamente o ID que vemos na tela
    if (planId === '7bba2a12-aa37-45e9-943e-60303026394d') {
      return 'Business';
    }
    
    const planos = {
      '0a27bbe3-87ab-4e37-9713-28dbb616a293': 'Pro',
      '7961c2e1-8b33-4134-bdc9-4b3f4412a196': 'Starter',
      '7bba2a12-aa37-45e9-943e-60303026394d': 'Business',
      'a610653e-f2f4-418f-b142-167629bac2a3': 'Master'
    };
    
    const nomePlano = planos[planId] || planId;
    console.log("Nome do plano:", nomePlano);
    return nomePlano;
  };

  // Converter o filtro de distância para metros
  const getRadiusInMeters = () => {
    if (distanceFilter === 'todos') return 100000; // 100km default
    return parseInt(distanceFilter.replace('km', '')) * 1000;
  };

  // Usa flags de carregamento vindas do App
  const isLoaded = mapsApiLoaded;
  const loadError = mapsLoadError;

  // Centro do mapa
  const mapCenter = useMemo(() => {
    if (userLocation?.lat && userLocation?.lng) {
      return { lat: userLocation.lat, lng: userLocation.lng };
    }
    
    if (distribuidoresGeo.length > 0) {
      const primeiroComCoordenadas = distribuidoresGeo.find(d => d.lat && d.lng);
      if (primeiroComCoordenadas) {
        return { 
          lat: primeiroComCoordenadas.lat, 
          lng: primeiroComCoordenadas.lng 
        };
      }
    }
    
    return { lat: -15.77972, lng: -47.92972 }; // Centro do Brasil
  }, [userLocation, distribuidoresGeo]);

  // Geocodificar endereços
  useEffect(() => {
    if (!isLoaded || !distribuidores.length || !window.google) {
      console.log('Aguardando carregamento do Google Maps...');
      return;
    }

    const geocodificarDistribuidores = async () => {
      try {
        console.log('Iniciando geocodificação...');
        const geocoder = new window.google.maps.Geocoder();
        const lista = [];

        for (const dist of distribuidores) {
          const endereco = dist.enderecoCompleto || [dist.address, dist.cidade, dist.estado, 'Brasil']
            .filter(Boolean).join(', ');

          try {
            console.log(`Geocodificando endereço: ${endereco}`);
            const result = await new Promise((resolve, reject) => {
              geocoder.geocode({ address: endereco }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                  resolve(results[0]);
                } else {
                  reject(new Error(`Geocoding falhou: ${status}`));
                }
              });
            });

            const location = result.geometry.location;
            lista.push({
              ...dist,
              lat: location.lat(),
              lng: location.lng(),
              enderecoCompleto: endereco
            });
            console.log(`Geocodificação bem sucedida para: ${dist.name}`);
          } catch (error) {
            console.warn(`Erro ao geocodificar ${dist.name}:`, error);
          }
        }

        setDistribuidoresGeo(lista);
        console.log('Geocodificação concluída.');
      } catch (error) {
        console.error('Erro ao geocodificar distribuidores:', error);
      }
    };

    geocodificarDistribuidores();
  }, [isLoaded, distribuidores]);

  // Ajusta o zoom do mapa
  const onMapLoad = useCallback((mapInstance) => {
    console.log('Mapa carregado, ajustando zoom...');
    setMap(mapInstance);
    
    try {
      if (userLocation?.lat && userLocation?.lng) {
        // Centraliza no usuário
        mapInstance.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
        
        // Ajusta zoom baseado na distância
        let zoom = 11; // zoom padrão
        
        if (distanceFilter === 'todos') {
          zoom = 8;
        } else {
          const distance = parseInt(distanceFilter);
          if (distance <= 10) zoom = 12;
          else if (distance <= 25) zoom = 11;
          else if (distance <= 50) zoom = 10;
          else if (distance <= 100) zoom = 9;
          else zoom = 8;
        }
        
        console.log(`Ajustando zoom para: ${zoom} (distância: ${distanceFilter})`);
        mapInstance.setZoom(zoom);
      } else {
        // Se não tiver localização do usuário, ajusta para mostrar todos os distribuidores
        if (distribuidoresGeo.length) {
          const bounds = new window.google.maps.LatLngBounds();
          distribuidoresGeo.forEach(distribuidor => {
            if (distribuidor.lat && distribuidor.lng) {
              bounds.extend({ lat: distribuidor.lat, lng: distribuidor.lng });
            }
          });
          mapInstance.fitBounds(bounds);
          
          // Limita o zoom máximo
          if (mapInstance.getZoom() > 12) {
            mapInstance.setZoom(12);
          }
        } else {
          // Centraliza no Brasil se não houver distribuidores
          mapInstance.setCenter({ lat: -15.77972, lng: -47.92972 });
          mapInstance.setZoom(4);
        }
      }

      console.log('Zoom ajustado com sucesso');
    } catch (error) {
      console.error('Erro ao ajustar bounds do mapa:', error);
    }
  }, [distribuidoresGeo, userLocation, distanceFilter]);

  const handleMarkerClick = (distribuidor) => {
    setSelectedDistribuidor(distribuidor);
  };

  const openWhatsApp = (phone) => {
    const formattedPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${formattedPhone}`, '_blank');
  };

  const openInstagram = (instagram) => {
    const instagramUrl = instagram.startsWith('http') 
      ? instagram 
      : `https://instagram.com/${instagram.replace('@', '')}`;
    window.open(instagramUrl, '_blank');
  };

  const openMapLink = (endereco) => {
    const query = encodeURIComponent(endereco);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  // Função para obter as classes do badge baseado no plano
  const getBadgeClasses = () => {
    const planName = selectedDistribuidor?.plans?.name?.toLowerCase() || 'starter';
    
    switch (planName) {
      case 'master':
        return {
          container: 'bg-[#8B0000] rounded-full px-3 py-1.5 flex flex-col items-center w-[100px] ml-auto',
          distribuidor: 'text-white text-xs font-medium font-figtree',
          plano: 'text-[#B8860B] text-xs font-medium font-figtree'
        };
      case 'business':
        return {
          container: 'bg-black rounded-full px-3 py-1.5 flex flex-col items-center w-[100px] ml-auto',
          distribuidor: 'text-white text-xs font-medium font-figtree',
          plano: 'text-[#B8860B] text-xs font-medium font-figtree'
        };
      case 'pro':
        return {
          container: 'bg-gray-700 rounded-full px-3 py-1.5 flex flex-col items-center w-[100px] ml-auto',
          distribuidor: 'text-white text-xs font-medium font-figtree',
          plano: 'text-[#B8860B] text-xs font-medium font-figtree'
        };
      case 'starter':
        return {
          container: 'bg-white rounded-full px-3 py-1.5 flex flex-col items-center w-[100px] ml-auto border border-black',
          distribuidor: 'text-black text-xs font-medium font-figtree',
          plano: 'text-black text-xs font-medium font-figtree'
        };
      default:
        return {
          container: 'bg-gray-200 rounded-full px-3 py-1.5 flex flex-col items-center w-[100px] ml-auto',
          distribuidor: 'text-gray-700 text-xs font-medium font-figtree',
          plano: 'text-gray-700 text-xs font-medium font-figtree'
        };
    }
  };

  if (loadError) {
    console.error('Erro ao carregar Google Maps:', loadError);
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-xl">
        <p>Erro ao carregar o Google Maps. Por favor, verifique:</p>
        <ul className="list-disc ml-4 mt-2">
          <li>Sua conexão com a internet</li>
          <li>Se a chave da API está correta</li>
          <li>Se as APIs necessárias estão ativadas no Console do Google</li>
        </ul>
        <p className="mt-2 text-sm">Detalhes do erro: {loadError.message}</p>
      </div>
    );
  }
  
  if (!isLoaded || !window.google) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="animate-pulse">Carregando mapa...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={4}
        options={defaultOptions}
        onLoad={onMapLoad}
      >
        {userLocation?.lat && userLocation?.lng && (
          <Marker
            position={{ lat: userLocation.lat, lng: userLocation.lng }}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(40, 40)
            }}
          />
        )}

        {distribuidoresGeo.map(distribuidor => {
          if (!distribuidor.lat || !distribuidor.lng) return null;

          return (
            <Marker
              key={distribuidor.id}
              position={{ lat: distribuidor.lat, lng: distribuidor.lng }}
              onClick={() => handleMarkerClick(distribuidor)}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new window.google.maps.Size(30, 30)
              }}
            />
          );
        })}

        {selectedDistribuidor && (
          <InfoWindow
            position={{ lat: selectedDistribuidor.lat, lng: selectedDistribuidor.lng }}
            onCloseClick={() => setSelectedDistribuidor(null)}
          >
            <div className="w-[240px] sm:w-[320px] p-2 sm:p-4 bg-white rounded-lg shadow-lg font-figtree">
              {/* Badge do tipo de distribuidor */}
              <div>
                <div className={`${getBadgeClasses().container} scale-90 sm:scale-100`}>
                  <span className={getBadgeClasses().distribuidor}>
                    DISTRIBUIDOR
                  </span>
                  <span className={getBadgeClasses().plano}>
                    Business
                  </span>
                </div>
              </div>
              
              {/* Informações do distribuidor com imagem */}
              <div className="flex items-center gap-1.5 sm:gap-3 mb-2 sm:mb-4 mt-2 sm:mt-4">
                {selectedDistribuidor.logo_url ? (
                  <img 
                    src={selectedDistribuidor.logo_url} 
                    alt={selectedDistribuidor.name}
                    className="w-10 h-10 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <FaStoreAlt className="text-gray-400 text-base sm:text-2xl" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 font-figtree truncate">
                    {selectedDistribuidor.name}
                  </h3>
                  <h2 className="text-xs sm:text-base text-gray-600 font-figtree truncate">
                    {selectedDistribuidor.cidade} - {selectedDistribuidor.estado}
                  </h2>
                </div>
              </div>
              
              {/* Lista de contatos */}
              <div className="space-y-1.5 sm:space-y-3 mb-2 sm:mb-4">
                {selectedDistribuidor.telefone && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
                    <FaWhatsapp className="text-base sm:text-xl text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-base font-figtree truncate">{selectedDistribuidor.telefone}</span>
                  </div>
                )}
                
                {selectedDistribuidor.email && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs sm:text-base font-figtree truncate">{selectedDistribuidor.email}</span>
                  </div>
                )}

                {selectedDistribuidor.instagram && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
                    <FaInstagram className="text-base sm:text-xl text-purple-500 flex-shrink-0" />
                    <span className="text-xs sm:text-base font-figtree truncate">{selectedDistribuidor.instagram}</span>
                  </div>
                )}

                <div className="flex items-start gap-1.5 sm:gap-2 text-gray-700">
                  <FaMapMarkedAlt className="text-base sm:text-xl text-[#1F7EB5] flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-base font-figtree line-clamp-2">{selectedDistribuidor.enderecoCompleto}</span>
                </div>
              </div>
              
              {/* Botões de ação */}
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-4">
                <button
                  className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-1 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-figtree text-xs sm:text-base"
                  onClick={() => openWhatsApp(selectedDistribuidor.telefone)}
                >
                  <FaWhatsapp className="text-base sm:text-xl" />
                  WhatsApp
                </button>
                {selectedDistribuidor.instagram && (
                  <button
                    className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-1 sm:py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-figtree text-xs sm:text-base"
                    onClick={() => openInstagram(selectedDistribuidor.instagram)}
                  >
                    <FaInstagram className="text-base sm:text-xl" />
                    Instagram
                  </button>
                )}
                <button
                  className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-1 sm:py-2 bg-[#1F7EB5] text-white rounded-lg hover:bg-[#1a6b99] transition-colors font-figtree text-xs sm:text-base"
                  onClick={() => openMapLink(selectedDistribuidor.enderecoCompleto)}
                >
                  <FaMapMarkedAlt className="text-base sm:text-xl" />
                  Ver no Mapa
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default MapView; 