import React, { useState, useEffect, useCallback } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import SearchSection from './components/SearchSection';
import InfoSection from './components/InfoSection';
import Footer from './components/Footer';
import { getDistribuidores, getDistribuidoresPorDistancia } from './services/distribuidoresService';
import DistributorCard from './components/DistributorCard';
import LocationFinder from './components/LocationFinder';
import MapView from './components/MapView';
import fotoAna from './assets/fotoana.jpg';
import DistanceFilter from './components/DistanceFilter';
import config from './config';
import './App.css';

function App() {
  const [distribuidores, setDistribuidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [view, setView] = useState('list'); // 'list' ou 'map'
  const [distanceFilter, setDistanceFilter] = useState(config.defaultDistance);
  const [selectedDistribuidor, setSelectedDistribuidor] = useState(null);
  
  // Carregar script do Google Maps para usar Geocoder
  const { isLoaded: mapsApiLoaded, loadError: mapsLoadError } = useJsApiLoader({
    googleMapsApiKey: config.googleMapsApiKey,
    libraries: ['places', 'geometry'],
  });
  
  // Log de debug
  useEffect(() => {
    console.log("Google Maps API:", { 
      apiKey: config.googleMapsApiKey ? "Definida" : "Não definida",
      carregada: mapsApiLoaded,
      erro: mapsLoadError ? mapsLoadError.message : "Nenhum"
    });
  }, [mapsApiLoaded, mapsLoadError]);

  // Converter o filtro de distância para km
  const parseDistanceFilter = (filter) => {
    if (filter === 'todos') return Infinity;
    return parseInt(filter.replace('km', ''));
  };

  // Função para buscar todos os distribuidores
  const fetchAllDistribuidores = async () => {
    try {
      setLoading(true);
      const data = await getDistribuidores();
      console.log("Dados do Supabase:", data);
      setDistribuidores(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setError(`Erro ao buscar dados: ${error.message}`);
      setLoading(false);
    }
  };

  // Função para buscar distribuidores com distância simulada quando temos localização
  const fetchDistribuidoresPorDistancia = async () => {
    console.log('Iniciando busca por distância...');
    console.log('Localização:', userLocation);
    console.log('Filtro:', distanceFilter);

    if (!userLocation || !userLocation.lat || !userLocation.lng) {
      console.log('Localização do usuário não disponível, buscando todos os distribuidores');
      await fetchAllDistribuidores();
      return;
    }

    try {
      setLoading(true);
      const maxDistance = parseDistanceFilter(distanceFilter);
      console.log("Buscando distribuidores com distância máxima de:", maxDistance, "km");
      
      const data = await getDistribuidoresPorDistancia(
        userLocation.lat,
        userLocation.lng,
        maxDistance
      );
      
      console.log("Distribuidores encontrados:", data.length);
      setDistribuidores(data || []);
      setError(null);
    } catch (error) {
      console.error("Erro ao buscar distribuidores por distância:", error);
      setError(`Erro ao buscar distribuidores: ${error.message}`);
      await fetchAllDistribuidores();
    } finally {
      setLoading(false);
    }
  };

  // Efeito para buscar os distribuidores no carregamento inicial
  useEffect(() => {
    fetchAllDistribuidores();
  }, []);

  // Efeito para atualizar os distribuidores quando a localização ou distância mudar
  useEffect(() => {
    if (!mapsApiLoaded) {
      console.log('Aguardando carregamento da API do Maps...');
      return;
    }
    
    if (loading) {
      console.log('Aguardando carregamento anterior terminar...');
      return;
    }

    console.log('Atualizando distribuidores...');
    console.log('Localização:', userLocation);
    console.log('Filtro:', distanceFilter);
    
    const timeoutId = setTimeout(() => {
      fetchDistribuidoresPorDistancia();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [userLocation, distanceFilter, mapsApiLoaded]);

  // Se houve erro ao carregar Maps API, mostra erro
  if (mapsLoadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Erro ao carregar Google Maps: {mapsLoadError.message}</div>
      </div>
    );
  }

  // Função para lidar com a localização encontrada
  const handleLocationFound = (location) => {
    console.log("Localização encontrada:", location);
    setUserLocation(location);
  };

  // Função para lidar com erros de localização
  const handleLocationError = (error) => {
    console.error("Erro ao obter localização:", error);
    // Não definir o erro no estado para não bloquear a interface
  };

  // Função para alternar entre visualizações
  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Função para alterar o filtro de distância
  const handleDistanceChange = (newDistance) => {
    setDistanceFilter(newDistance);
  };

  // Função para lidar com o clique em um distribuidor no mapa
  const handleDistribuidorClick = (distribuidor) => {
    setSelectedDistribuidor(distribuidor);
    setView('list'); // Mudar para a visualização de lista para mostrar os detalhes
    
    // Rolar até o distribuidor selecionado
    const element = document.getElementById(`distribuidor-${distribuidor.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Adicionar classe de destaque temporariamente
      element.classList.add('bg-[#1F7EB5]/10');
      setTimeout(() => {
        element.classList.remove('bg-[#1F7EB5]/10');
      }, 2000);
    }
  };

  // Mostrar loader apenas na carga inicial (antes de termos userLocation)
  if (loading && distribuidores.length === 0 && !userLocation) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Carregando distribuidores...</div>
      </div>
    );
  }

  if (error && distribuidores.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        <div className="relative">
          <Hero />
          {/* SearchSection sobreposta ao Hero */}
          <div className="absolute left-0 right-0 -bottom-12 md:bottom-0 transform md:translate-y-1/2 px-0 md:px-4">
            <div className="container mx-auto w-[100%] md:w-auto md:max-w-5xl">
              <SearchSection 
                onSearch={handleLocationFound} 
                mapsApiLoaded={mapsApiLoaded}
                mapsLoadError={mapsLoadError}
              />
            </div>
          </div>
        </div>
        
        {/* Container principal para conteúdo */}
        <div className="container mx-auto max-w-4xl px-4 md:px-6 mt-12 md:mt-20 space-y-4 md:space-y-8">
          {/* LocationFinder oculto mas funcional */}
          <div className="hidden">
            <LocationFinder 
              onLocationFound={handleLocationFound}
              onLocationError={handleLocationError}
            />
          </div>

          {/* Filtro de Distância e Alternância de Visualização */}
          <div className="pt-8 md:pt-24 flex justify-center">
            <DistanceFilter
              currentDistance={distanceFilter}
              onDistanceChange={handleDistanceChange}
              currentView={view}
              onViewChange={handleViewChange}
            />
          </div>

          {/* Título da seção */}
          <div className="mb-2 md:mb-4">
            <h2 className="text-xl min-[430px]:text-2xl md:text-3xl font-bold text-gray-800 text-center">
              {userLocation 
                ? `Distribuidores próximos a você (${distanceFilter})` 
                : 'Todos os Distribuidores'}
            </h2>
          </div>
          
          {/* Vista de mapa */}
          {view === 'map' && (
            <div className="mb-8">
              <MapView 
                distribuidores={distribuidores} 
                userLocation={userLocation}
                onDistribuidorClick={handleDistribuidorClick}
                mapsApiLoaded={mapsApiLoaded}
                mapsLoadError={mapsLoadError}
                distanceFilter={distanceFilter}
              />
            </div>
          )}
          
          {/* Vista de lista */}
          {view === 'list' && (
            <div>
              {distribuidores.length === 0 ? (
                <div className="text-xl text-gray-600 text-center py-12 bg-gray-50 rounded-lg">
                  {userLocation 
                    ? `Nenhum distribuidor encontrado em um raio de ${distanceFilter}.`
                    : 'Nenhum distribuidor encontrado.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {distribuidores.map((distribuidor) => (
                    <div 
                      id={`distribuidor-${distribuidor.id}`}
                      key={distribuidor.id}
                      className={`transition-all duration-500 ${selectedDistribuidor?.id === distribuidor.id ? 'ring-2 ring-blue-400 rounded-[36px]' : ''}`}
                    >
                      <DistributorCard 
                        distributor={distribuidor}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Banner de Kits */}
        <div className="container mx-auto max-w-4xl px-4 md:px-4 my-6 md:my-8">
          <div className="relative bg-black w-full h-[400px] md:h-[300px] rounded-[16px] overflow-hidden flex flex-col md:flex-row">
            {/* Lado esquerdo com texto */}
            <div className="flex-1 flex flex-col justify-center items-start p-6 md:p-12 z-10">
              <h2 className="text-white text-xl md:text-2xl font-figtree mb-2">
                Kits Home Care
              </h2>
              <h1 className="text-white text-3xl md:text-4xl font-figtree font-bold mb-6 max-w-md">
                Trate seus cabelos com eficiência!
              </h1>
              <button className="bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded-lg font-figtree hover:bg-gray-100 transition-colors text-sm md:text-base">
                Saiba mais
              </button>
            </div>

            {/* Lado direito com imagem */}
            <div className="flex-1 relative h-48 md:h-auto">
              <img
                src={fotoAna}
                alt="Ana demonstrando produto"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <InfoSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
